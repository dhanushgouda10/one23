package com.one23.one23.repository;

import com.one23.one23.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    void deleteByCreatedAtBefore(LocalDateTime time);
}
