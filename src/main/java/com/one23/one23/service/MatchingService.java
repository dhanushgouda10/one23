package com.one23.one23.service;

import com.one23.one23.model.RideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class MatchingService {

    private final Map<String, List<RideRequest>> lobbyMap = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static boolean isExpired(RideRequest user) {
        return user.getCreatedAt() != null &&
                user.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5));
    }

    /**
     * Auto-delete old users from memory.
     * Runs every 1 minute and removes users older than 5 minutes.
     */
    @Scheduled(fixedRate = 60_000)
    public void cleanupOldUsers() {
        lobbyMap.entrySet().removeIf(entry -> {
            List<RideRequest> users = entry.getValue();
            users.removeIf(MatchingService::isExpired);
            return users.isEmpty();
        });
    }

    public List<RideRequest> addAndMatch(RideRequest request) {

        String key = request.getPickupHub() + "_" + request.getDestination();

        List<RideRequest> users = lobbyMap.getOrDefault(key, new ArrayList<>());
        users.removeIf(MatchingService::isExpired);
        users.add(request);

        lobbyMap.put(key, users);

        // Match found
        if (users.size() >= 2) {

            // Notify subscribers via WebSocket (STOMP topic /topic/match)
            messagingTemplate.convertAndSend("/topic/match", users);

            // Clear lobby after match so the next pair starts fresh on this route
            lobbyMap.remove(key);

            return users;
        }

        return Collections.emptyList();
    }
}
