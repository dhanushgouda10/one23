package com.one23.one23.matching.service;

import com.one23.one23.ride.dto.RideResponse;
import com.one23.one23.ride.model.RideRequest;
import com.one23.one23.ride.repository.RideRequestRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

// Service for matching ride requests based on pickup hub + destination
@Service
public class MatchingService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingService.class);

    // A group needs this many riders waiting on the same route before it's formed.
    private static final int RIDERS_PER_GROUP = 3;

    private final SimpMessagingTemplate messagingTemplate;
    private final RideRequestRepository rideRequestRepository;

    public MatchingService(SimpMessagingTemplate messagingTemplate, RideRequestRepository rideRequestRepository) {
        this.messagingTemplate = messagingTemplate;
        this.rideRequestRepository = rideRequestRepository;
    }

    // Match users by pickup hub AND destination (case-insensitive).
    // Matching on hub alone used to group people headed to different
    // places just because they boarded at the same point — fixed here.
    //
    // synchronized + @Transactional: without this, two ride requests
    // arriving at nearly the same time could both read "only 2 people
    // waiting" before either one writes, and never form a group even
    // though a 3rd rider is in fact there (or, in rarer timing, produce
    // inconsistent groups). `synchronized` ensures only one thread runs
    // this check-then-write at a time; @Transactional ensures the reads
    // and writes it performs are committed as a single unit. This is
    // sufficient for a single backend instance (fine for this project's
    // scale) — a multi-instance deployment would need a DB-level lock
    // instead, since `synchronized` only applies within one JVM.
    @Transactional
    public synchronized List<RideRequest> addAndMatch(RideRequest request) {
        requireRoute(request);

        String hubKey = normalize(request.getPickupHub());
        String destinationKey = normalize(request.getDestination());

        List<RideRequest> waitingOnSameRoute = findWaitingRidesOnRoute(hubKey, destinationKey);
        if (waitingOnSameRoute.size() < RIDERS_PER_GROUP) {
            return null;
        }

        List<RideRequest> group = formGroup(waitingOnSameRoute);

        // Send match update to all lobby tabs via WebSocket.
        //
        // BUG FIX: this used to broadcast the raw RideRequest entities,
        // which serialize their full User association (id + email — see
        // RideRequest.user, @ManyToOne so it's eagerly fetched, not
        // @JsonIgnore'd). /topic/match is a single global, unauthenticated
        // topic every connected client subscribes to (see
        // createMatchClient() in the frontend), so that leaked every
        // matched rider's internal user id and email to every other
        // logged-in user's browser, not just the group's own members.
        // RideResponse (already used for the HTTP /api/join response — see
        // RideController) strips that down to the same scalar fields the
        // frontend actually reads, with no behavior change on the
        // receiving end: the frontend's onMatch callback only uses this
        // message to trigger a refetch of /api/my-rides, it never reads
        // the broadcast payload itself.
        messagingTemplate.convertAndSend("/topic/match", RideResponse.fromList(group));
        logger.info("Group created: {} at hub: {} -> {}", group.get(0).getGroupId(), hubKey, destinationKey);

        return group;
    }

    // Ride requests must have both a pickup hub and a destination before
    // they're eligible for matching.
    private void requireRoute(RideRequest request) {
        if (request.getPickupHub() == null || request.getPickupHub().isBlank()) {
            throw new IllegalArgumentException("pickupHub is required");
        }
        if (request.getDestination() == null || request.getDestination().isBlank()) {
            throw new IllegalArgumentException("destination is required");
        }
    }

    // All rides currently WAITING on the same hub + destination as the
    // given (already-normalized) route.
    private List<RideRequest> findWaitingRidesOnRoute(String hubKey, String destinationKey) {
        List<RideRequest> waiting = rideRequestRepository.findByStatus("WAITING");

        List<RideRequest> onRoute = new ArrayList<>();
        for (RideRequest ride : waiting) {
            if (isOnRoute(ride, hubKey, destinationKey)) {
                onRoute.add(ride);
            }
        }
        return onRoute;
    }

    private boolean isOnRoute(RideRequest ride, String hubKey, String destinationKey) {
        if (ride.getPickupHub() == null || ride.getDestination() == null) {
            return false;
        }
        return normalize(ride.getPickupHub()).equals(hubKey)
                && normalize(ride.getDestination()).equals(destinationKey);
    }

    private String normalize(String value) {
        return value.toLowerCase().trim();
    }

    // Takes the first RIDERS_PER_GROUP waiting riders, marks them MATCHED
    // under a new group id, and saves them.
    private List<RideRequest> formGroup(List<RideRequest> waitingRiders) {
        String groupId = UUID.randomUUID().toString();
        List<RideRequest> group = new ArrayList<>(waitingRiders.subList(0, RIDERS_PER_GROUP));

        for (RideRequest ride : group) {
            ride.setStatus("MATCHED");
            ride.setGroupId(groupId);
        }

        rideRequestRepository.saveAll(group);
        return group;
    }
}
