package com.one23.one23.ride.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for POST /api/join.
 *
 * Deliberately only carries the two fields a client is allowed to set.
 * The controller used to bind the {@code RideRequest} JPA entity straight
 * from the request body, which meant a caller could also supply "id",
 * "status", "groupId", or "user" in the JSON — and since the controller
 * only overwrote user/name/createdAt/status/groupId AFTER binding, a
 * client-supplied "id" matching an existing ride would make
 * JpaRepository.save() UPDATE that row (owned by anyone) instead of
 * inserting a new one. A dedicated request DTO makes that impossible:
 * there is no id/status/groupId/user field here for Jackson to bind.
 */
public class RideJoinRequest {

    @NotBlank(message = "Pickup hub is required")
    @JsonAlias({"location", "pickupHub"})
    private String pickupHub;

    @NotBlank(message = "Destination is required")
    private String destination;

    public RideJoinRequest() {
    }

    public String getPickupHub() {
        return pickupHub;
    }

    public void setPickupHub(String pickupHub) {
        this.pickupHub = pickupHub;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }
}
