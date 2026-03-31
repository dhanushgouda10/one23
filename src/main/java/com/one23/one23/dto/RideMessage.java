package com.one23.one23.dto;

public class RideMessage {

    private String username;
    private String pickupHub;
    private String destination;

    public RideMessage() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
