package com.one23.one23.ride.repository;

import com.one23.one23.ride.model.RideRequest;
import com.one23.one23.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

// Repository for ride request database operations
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {

    // Used by cleanup scheduler — only removes stale rides in the given
    // statuses (e.g. WAITING, CANCELLED), never MATCHED/IN_PROGRESS/COMPLETED.
    // Returns the number of rows deleted so the scheduler can log it.
    long deleteByCreatedAtBeforeAndStatusIn(LocalDateTime time, List<String> statuses);

    // Used by matching service to find waiting rides
    List<RideRequest> findByStatus(String status);

    // Used by my-rides API
    List<RideRequest> findByUser(User user);

    List<RideRequest> findByGroupId(String groupId);
}
