package com.one23.one23.ride.scheduler;

import com.one23.one23.ride.repository.RideRequestRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

// Scheduler to clean up old ride requests
@Component
public class CleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(CleanupScheduler.class);

    // Only these statuses are safe to delete once stale.
    // MATCHED / IN_PROGRESS / COMPLETED rides must never be auto-deleted.
    private static final List<String> DELETABLE_STATUSES = List.of("WAITING", "CANCELLED");

    private final RideRequestRepository rideRequestRepository;

    public CleanupScheduler(RideRequestRepository rideRequestRepository) {
        this.rideRequestRepository = rideRequestRepository;
    }

    // Runs every 1 minute
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanOldRequests() {

        logger.debug("Ride cleanup sweep started");

        // Delete rides older than 15 minutes, but only if they're still
        // WAITING (never matched) or already CANCELLED. Active rides
        // (MATCHED, IN_PROGRESS) and COMPLETED history are left alone —
        // those are only ever removed by an explicit cancel action.
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);

        long deletedCount = rideRequestRepository.deleteByCreatedAtBeforeAndStatusIn(expiryTime, DELETABLE_STATUSES);

        if (deletedCount > 0) {
            logger.info("Ride cleanup removed {} stale request(s) older than {}", deletedCount, expiryTime);
        } else {
            logger.debug("Ride cleanup found nothing to remove");
        }
    }
}
