package com.one23.one23.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    // Same allowlist as CorsConfig (app.cors.allowed-origins) — kept in sync
    // so the WebSocket endpoint can't be reached from origins the REST API
    // itself would reject. Previously this was setAllowedOriginPatterns("*"),
    // which let ANY origin open a socket and read/send chat + live location
    // for any group it could authenticate into. It now uses the same
    // pattern-based matching as CorsConfig (see setAllowedOriginPatterns
    // below) so a dev-only entry like "http://localhost:*" is still scoped
    // to actual matched origins, not a true wildcard.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public WebSocketConfig(WebSocketAuthInterceptor webSocketAuthInterceptor) {
        this.webSocketAuthInterceptor = webSocketAuthInterceptor;
    }

    // Configure STOMP message broker
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Frontend subscribes to /topic/*
        config.enableSimpleBroker("/topic");

        // Frontend sends messages to /app/*
        config.setApplicationDestinationPrefixes("/app");
    }

    // Attach JWT token to WebSocket connection
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }

    // WebSocket connection endpoint for frontend
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(CorsOrigins.parse(allowedOrigins))
                .withSockJS();
    }
}
