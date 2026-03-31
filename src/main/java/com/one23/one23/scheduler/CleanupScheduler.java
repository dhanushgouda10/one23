package com.one23.one23.scheduler;

import com.one23.one23.repository.RideRequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CleanupScheduler {

    private final RideRequestRepository repo;

    public CleanupScheduler(RideRequestRepository repo) {
        this.repo = repo;
    }

    @Scheduled(fixedRate = 60000) // every 1 min
    @Transactional
    public void cleanOldRequests() {

        System.out.println("Cleaning started...");
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(5);

        repo.deleteByCreatedAtBefore(expiryTime);

        System.out.println("🧹 Cleaned old requests");
    }
}
