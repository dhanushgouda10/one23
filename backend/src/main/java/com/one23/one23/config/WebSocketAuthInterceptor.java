package com.one23.one23.config;

import com.one23.one23.auth.service.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Reads JWT token from WebSocket CONNECT frame
 * so chat messages know which user is logged in.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public WebSocketAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // Every STOMP frame (CONNECT, SUBSCRIBE, SEND, ...) passes through here,
    // but a user only ever needs to prove who they are once — on CONNECT,
    // the very first frame when opening the socket. Every later frame on
    // that same connection reuses the identity we attach here.
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !isConnectFrame(accessor)) {
            return message;
        }

        String token = extractBearerToken(accessor);
        if (token != null) {
            authenticateStompUser(token, accessor);
        }

        return message;
    }

    private boolean isConnectFrame(StompHeaderAccessor accessor) {
        return StompCommand.CONNECT.equals(accessor.getCommand());
    }

    // Pulls the raw JWT out of the CONNECT frame's "Authorization: Bearer
    // <token>" header — the frontend sends it as a native STOMP header
    // (see createChatClient/createLocationClient/createGroupClient in the
    // frontend), the same way a normal REST request sends it as an HTTP
    // header (see JwtAuthenticationFilter.extractToken).
    private String extractBearerToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring("Bearer ".length());
    }

    // Validates the token and, if it checks out, attaches the user's
    // identity to this STOMP session so every later frame on the same
    // connection (chat messages, location updates) is already authenticated.
    private void authenticateStompUser(String token, StompHeaderAccessor accessor) {
        String email = jwtService.extractEmail(token);
        if (email == null || !jwtService.isTokenValid(token, email)) {
            return;
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

        accessor.setUser(authToken);
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
