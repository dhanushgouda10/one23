package com.one23.one23.ride.controller;

import com.one23.one23.lobby.dto.GroupLobbyResponse;
import com.one23.one23.ride.dto.RideJoinRequest;
import com.one23.one23.ride.dto.RideResponse;
import com.one23.one23.ride.model.RideRequest;
import com.one23.one23.ride.repository.RideRequestRepository;
import com.one23.one23.user.model.User;
import com.one23.one23.user.repository.UserRepository;
import com.one23.one23.matching.service.MatchingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Controller for ride management (join, cancel, start, end rides)
// CORS is handled globally by CorsConfig (app.cors.allowed-origins) —
// no per-controller @CrossOrigin needed, so there's a single source of
// truth for allowed origins instead of two lists that can drift apart.
@RestController
@RequestMapping("/api")
public class RideController {

    private final RideRequestRepository rideRequestRepository;
    private final UserRepository userRepository;
    private final MatchingService matchingService;
    private final SimpMessagingTemplate messagingTemplate;

    public RideController(RideRequestRepository rideRequestRepository,
                           UserRepository userRepository,
                           MatchingService matchingService,
                           SimpMessagingTemplate messagingTemplate) {
        this.rideRequestRepository = rideRequestRepository;
        this.userRepository = userRepository;
        this.matchingService = matchingService;
        this.messagingTemplate = messagingTemplate;
    }

    // Join a ride — save request and try to match with others at same pickup hub
    //
    // Takes a RideJoinRequest DTO (pickupHub + destination only) instead of
    // binding the RideRequest entity straight from the request body.
    // BUG FIX: entity binding let a caller also set "id" in the JSON body;
    // since id was never reset before save(), passing another user's
    // existing ride id made JpaRepository.save() UPDATE that row instead
    // of inserting a new one — an authenticated user could overwrite
    // (and reassign to themselves) any ride by guessing/enumerating its
    // id. The DTO has no id/status/groupId/user field, so that's no
    // longer possible — a fresh RideRequest is always constructed here.
    @PostMapping("/join")
    public ResponseEntity<?> createRide(@Valid @RequestBody RideJoinRequest joinRequest,
                                         Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        if (joinRequest.getPickupHub() == null || joinRequest.getPickupHub().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Pickup hub is required"));
        }

        if (joinRequest.getDestination() == null || joinRequest.getDestination().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Destination is required"));
        }

        RideRequest rideRequest = newWaitingRide(joinRequest, user);
        RideRequest savedRide = rideRequestRepository.save(rideRequest);

        // Check if 3 users at same hub can be matched
        List<RideRequest> matchedGroup = matchingService.addAndMatch(savedRide);

        if (matchedGroup != null) {
            return ResponseEntity.ok(RideResponse.fromList(matchedGroup));
        }
        return ResponseEntity.ok(RideResponse.from(savedRide));
    }

    // Builds a brand-new ride row — never a client-supplied entity — for
    // the logged-in user, in the default just-joined state.
    private RideRequest newWaitingRide(RideJoinRequest joinRequest, User user) {
        RideRequest rideRequest = new RideRequest();
        rideRequest.setPickupHub(joinRequest.getPickupHub());
        rideRequest.setDestination(joinRequest.getDestination());
        rideRequest.setUser(user);
        rideRequest.setName(user.getFullName());
        rideRequest.setCreatedAt(LocalDateTime.now());
        rideRequest.setStatus("WAITING");
        rideRequest.setGroupId(null);
        return rideRequest;
    }

    // Get all rides created by logged-in user
    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides(Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        return ResponseEntity.ok(RideResponse.fromList(rideRequestRepository.findByUser(user)));
    }

    // Cancel a ride — only owner can cancel
    @PatchMapping("/rides/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable("id") Long id, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        RideRequest ride = rideRequestRepository.findById(id).orElse(null);
        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Ride not found"));
        }

        if (!isOwnedBy(ride, user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot cancel another user's ride"));
        }

        // BUG FIX: only a still-WAITING ride can be cancelled through this
        // endpoint. Without this check, a ride that got MATCHED (or is
        // already IN_PROGRESS/COMPLETED/CANCELLED) a moment before the
        // click landed could be silently overwritten to CANCELLED here,
        // leaving that rider's group members with a groupmate row that
        // disagrees with the rest of the group. Once a ride is matched,
        // /api/rides/{groupId}/cancel-group is the correct endpoint —
        // it cancels every member consistently.
        if (!"WAITING".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "This ride is already " + ride.getStatus() +
                                    " and can no longer be cancelled this way."));
        }

        ride.setStatus("CANCELLED");
        rideRequestRepository.save(ride);

        return ResponseEntity.ok(Map.of("message", "Ride cancelled successfully"));
    }

    // Leave a matched group — the person who clicks is CANCELLED, and the
    // rest of the group goes back to WAITING (groupId cleared on everyone)
    // so the matching service can pair them with a new rider later.
    // The old group is dissolved: remaining members are pushed a WebSocket
    // event on /topic/group/{groupId} so their Group Lobby page can send
    // them back to the waiting queue automatically, without a refresh.
    // Route name kept as "cancel-group" to match the frontend, even though
    // only the leaver actually ends up CANCELLED.
    @PatchMapping("/rides/{groupId}/cancel-group")
    public ResponseEntity<?> cancelGroup(@PathVariable String groupId, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        List<RideRequest> rides = rideRequestRepository.findByGroupId(groupId);
        if (rides.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isMemberOfGroup(rides, user)) {
            return notInGroup();
        }

        // Don't allow cancelling once the ride is already underway or finished
        if (isAnyRideInProgressOrDone(rides)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Ride already started or completed — cannot cancel now"));
        }

        // Only the rider who left is CANCELLED. Everyone else goes back to
        // WAITING so they can be auto-matched into a new group later.
        for (RideRequest ride : rides) {
            ride.setStatus(isOwnedBy(ride, user) ? "CANCELLED" : "WAITING");
            // Old group is gone either way — clear it on every row.
            ride.setGroupId(null);
        }
        rideRequestRepository.saveAll(rides);

        // Tell anyone still viewing this Group Lobby (the members who went
        // back to WAITING) that the group no longer exists, so their page
        // can leave automatically instead of sitting on a dead group.
        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId,
                (Object) Map.of(
                        "type", "DISSOLVED",
                        "message", "A member left — the group was dissolved."
                )
        );
        return ResponseEntity.ok(
                Map.of("message", "You left the group. Other members are back in the waiting queue.")
        );
    }

    // Load one matched group for the Group Lobby page.
    // Only members of the group may view it (BUG FIX: this previously had
    // no ownership check at all, so any logged-in user who knew/guessed a
    // groupId could read another group's member names and emails).
    @GetMapping("/groups/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable String groupId, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        List<RideRequest> rides = rideRequestRepository.findByGroupId(groupId);
        if (rides.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isMemberOfGroup(rides, user)) {
            return notInGroup();
        }

        return ResponseEntity.ok(GroupLobbyResponse.fromRides(rides));
    }

    // Start ride - update status from MATCHED to IN_PROGRESS
    //
    // BUG FIX: only members of this group may start its ride — this
    // endpoint had no ownership check before, so any logged-in user
    // who knew a groupId could start (or end) someone else's ride.
    @PatchMapping("/rides/{groupId}/start")
    public ResponseEntity<?> startRide(@PathVariable String groupId, Authentication authentication) {
        return setGroupStatus(groupId, authentication, "IN_PROGRESS", "Ride started successfully");
    }

    // End ride - update status to COMPLETED. Same ownership rule as startRide().
    @PatchMapping("/rides/{groupId}/end")
    public ResponseEntity<?> endRide(@PathVariable String groupId, Authentication authentication) {
        return setGroupStatus(groupId, authentication, "COMPLETED", "Ride completed successfully");
    }

    // Shared by startRide()/endRide(): both endpoints do the exact same
    // thing — verify the caller belongs to the group, set every ride in
    // it to a new status, and confirm with a message — only the target
    // status and success message differ.
    private ResponseEntity<?> setGroupStatus(String groupId, Authentication authentication,
                                              String newStatus, String successMessage) {
        User user = currentUser(authentication);
        if (user == null) {
            return unauthorized();
        }

        List<RideRequest> rides = rideRequestRepository.findByGroupId(groupId);
        if (rides.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (!isMemberOfGroup(rides, user)) {
            return notInGroup();
        }

        for (RideRequest ride : rides) {
            ride.setStatus(newStatus);
        }
        rideRequestRepository.saveAll(rides);

        return ResponseEntity.ok(Map.of("message", successMessage));
    }

    // ---- shared helpers ----

    // Resolves the logged-in user from the JWT-authenticated request.
    private User currentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private boolean isOwnedBy(RideRequest ride, User user) {
        return ride.getUser() != null && ride.getUser().getId().equals(user.getId());
    }

    private boolean isMemberOfGroup(List<RideRequest> rides, User user) {
        for (RideRequest ride : rides) {
            if (isOwnedBy(ride, user)) {
                return true;
            }
        }
        return false;
    }

    // A group can't be cancelled once any member's ride has actually
    // started or finished — only still-MATCHED groups can be left.
    private boolean isAnyRideInProgressOrDone(List<RideRequest> rides) {
        for (RideRequest ride : rides) {
            if ("IN_PROGRESS".equals(ride.getStatus()) || "COMPLETED".equals(ride.getStatus())) {
                return true;
            }
        }
        return false;
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User not found"));
    }

    private ResponseEntity<?> notInGroup() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "You are not part of this group"));
    }
}
