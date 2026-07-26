package com.one23.one23.chat.service;

import com.one23.one23.chat.model.ChatMessage;
import com.one23.one23.chat.repository.ChatMessageRepository;
import com.one23.one23.ride.model.RideRequest;
import com.one23.one23.ride.repository.RideRequestRepository;
import com.one23.one23.user.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

// Service for chat message operations
@Service
public class ChatMessageService {

    // A ride only counts as "still part of this group" while it's in one
    // of these statuses. BUG FIX: this used to only accept "MATCHED", which
    // meant chat + live location silently stopped working the moment a
    // group clicked "Start Ride" (status becomes IN_PROGRESS) — exactly
    // when a group needs chat/location the most. COMPLETED is included too
    // so members can still read chat history after the ride ends.
    private static final Set<String> ACTIVE_GROUP_STATUSES = Set.of("MATCHED", "IN_PROGRESS", "COMPLETED");

    private final ChatMessageRepository chatMessageRepository;
    private final RideRequestRepository rideRequestRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                               RideRequestRepository rideRequestRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.rideRequestRepository = rideRequestRepository;
    }

    // Check if logged-in user belongs to this group (at any point in the ride lifecycle)
    public boolean isUserInGroup(String groupId, User user) {
        if (user == null || groupId == null || groupId.isBlank()) {
            return false;
        }

        List<RideRequest> userRides = rideRequestRepository.findByUser(user);

        for (RideRequest ride : userRides) {
            if (groupId.equals(ride.getGroupId()) && ACTIVE_GROUP_STATUSES.contains(ride.getStatus())) {
                return true;
            }
        }

        return false;
    }

    // Save a new chat message
    public ChatMessage saveMessage(String groupId, String senderName, String messageText) {

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setGroupId(groupId);
        chatMessage.setSenderName(senderName);
        chatMessage.setMessage(messageText);
        chatMessage.setTimestamp(LocalDateTime.now());

        return chatMessageRepository.save(chatMessage);
    }

    // Get all previous messages for one group
    public List<ChatMessage> getGroupMessages(String groupId) {
        return chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }
}
