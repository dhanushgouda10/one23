package com.one23.one23.ride.dto;

import com.one23.one23.ride.model.RideRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response body for ride endpoints (/api/join, /api/my-rides).
 *
 * Mirrors every scalar field the frontend already reads off a ride
 * (id, name, pickupHub, destination, createdAt, groupId, status — see
 * MyRides.jsx / Dashboard.jsx), but drops the entity's nested `user`
 * object. That field previously serialized the ride owner's full User
 * record (id + email, everything but the @JsonIgnore'd password) to
 * the client — including, in the "3 people just matched" response from
 * /api/join, the internal user id and email of the OTHER two riders.
 * Nothing in the frontend reads ride.user, so removing it is a pure
 * exposure fix with no behavior change.
 */
public class RideResponse {

    private Long id;
    private String name;
    private String pickupHub;
    private String destination;
    private LocalDateTime createdAt;
    private String groupId;
    private String status;

    public static RideResponse from(RideRequest ride) {
        RideResponse response = new RideResponse();
        response.id = ride.getId();
        response.name = ride.getName();
        response.pickupHub = ride.getPickupHub();
        response.destination = ride.getDestination();
        response.createdAt = ride.getCreatedAt();
        response.groupId = ride.getGroupId();
        response.status = ride.getStatus();
        return response;
    }

    // Converts a whole list of rides at once — used by /api/my-rides and by
    // /api/join whenever that call is the one that completes a match.
    public static List<RideResponse> fromList(List<RideRequest> rides) {
        List<RideResponse> responses = new ArrayList<>();
        for (RideRequest ride : rides) {
            responses.add(RideResponse.from(ride));
        }
        return responses;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPickupHub() {
        return pickupHub;
    }

    public String getDestination() {
        return destination;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getGroupId() {
        return groupId;
    }

    public String getStatus() {
        return status;
    }
}
