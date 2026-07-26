package com.one23.one23.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory fixed-window rate limiter for POST /api/auth/login.
 *
 * There was previously no protection at all against brute-force/credential
 * stuffing on the login endpoint. This limiter tracks attempts per key
 * (called once for the caller's IP and once for the submitted email — see
 * AuthController) and rejects once a key exceeds the configured attempt
 * count within the configured window.
 *
 * Deliberately in-memory rather than Redis/DB-backed: this mirrors the
 * same single-instance assumption already made by MatchingService's
 * `synchronized` matching lock elsewhere in this codebase, which is
 * appropriate for this project's current (single backend instance) scale.
 * A multi-instance deployment would need a shared store (e.g. Redis)
 * instead, since state here does not cross JVMs.
 */
@Component
public class LoginRateLimiter {

    private final int maxAttempts;
    private final Duration window;

    private final Map<String, Window> attemptsByKey = new ConcurrentHashMap<>();

    public LoginRateLimiter(
            @Value("${app.security.login-rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.security.login-rate-limit.window-seconds:60}") long windowSeconds) {
        this.maxAttempts = maxAttempts;
        this.window = Duration.ofSeconds(windowSeconds);
    }

    /**
     * Registers one attempt for the given key and returns true if the
     * caller is still within the allowed rate, false if they've exceeded
     * the limit and should be rejected.
     */
    public boolean tryAcquire(String key) {
        Instant now = Instant.now();

        Window current = attemptsByKey.compute(key, (k, existing) -> {
            if (existing == null || existing.windowStart.plus(window).isBefore(now)) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        return current.count.get() <= maxAttempts;
    }

    private static final class Window {
        private final Instant windowStart;
        private final AtomicInteger count;

        private Window(Instant windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
