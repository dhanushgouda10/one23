package com.one23.one23.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    /** Pickup hub — stored in DB column {@code location} from earlier days. */
    @Column(name = "pickup_hub")
    @JsonAlias({"location","pickupHub"})
    private String pickupHub;

    private String destination;
    private LocalDateTime createdAt;

    private String groupId;
    private String status;


    public RideRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getGroupId(){
        return groupId;

    }

     public void setGroupId( String groupId ) {
        this.groupId = groupId;
    }
    
      public String  getStatus(){
        return status;

    }

     public void setStatus( String status ) {
        this.status = status;
    }


}
