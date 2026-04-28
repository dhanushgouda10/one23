package com.one23.one23.service;

import com.one23.one23.model.RideRequest;
import com.one23.one23.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MatchingService {

    private final Map<String, List<RideRequest>> lobby = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RideRequestRepository repo;

    public void addAndMatch(RideRequest request) {

        String pickupHub = request.getPickupHub();
        String destination = request.getDestination();

        if (pickupHub == null || destination == null) {
            throw new RuntimeException("pickupHub and destination are required");
        }

        String key = pickupHub.toLowerCase().trim()
                + "_"
                + destination.toLowerCase().trim();

        lobby.putIfAbsent(key, new ArrayList<>());

        List<RideRequest> users = lobby.get(key);

        users.add(request);

        if (users.size() >= 3) {

            String groupId = UUID.randomUUID().toString();

            int groupSize = Math.min(users.size(), 3);

            List<RideRequest> group = new ArrayList<>(users.subList(0, groupSize));

            for (RideRequest user : group) {
                user.setStatus("MATCHED");
                user.setGroupId(groupId);
            }

            repo.saveAll(group);

            messagingTemplate.convertAndSend("/topic/match", group);

            users.subList(0, groupSize).clear();

            if (users.isEmpty()) {
                lobby.remove(key);
            }

            System.out.println("Group created: " + groupId);
        }
    }
}