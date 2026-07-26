package com.one23.one23.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Central error handler so every API failure returns a consistent JSON
 * shape instead of Spring's default stack-trace-flavoured error page.
 *
 * Response shape:
 *   { "message": "...", "fieldErrors": { "email": "..." } }
 *
 * The frontend (Signup.jsx / Login.jsx / JoinRide.jsx) already reads
 * `message` and `fieldErrors` from error responses, so this handler
 * makes that contract actually hold everywhere instead of only when a
 * controller happens to build the response manually.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Bean Validation failures (@Valid on @RequestBody DTOs like SignupRequest / LoginRequest)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        String firstMessage = fieldErrors.values().stream()
                .findFirst()
                .orElse("Validation failed");

        Map<String, Object> body = new HashMap<>();
        body.put("message", firstMessage);
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // Expected "bad input" errors thrown by services (e.g. MatchingService
    // rejecting a blank pickupHub/destination) — surfaced as 400 instead of 500.
    //
    // BUG FIX: this used to also catch the bare RuntimeException.class,
    // which meant EVERY runtime exception anywhere in the app — including
    // things like a database constraint violation or any other genuine
    // bug — was reported to the client as a 400 with that exception's raw
    // message, and was never logged anywhere. That both hid real failures
    // from monitoring and could leak internal error detail (e.g. SQL/
    // constraint text) to callers. Only the two exception types services
    // in this app intentionally throw for validation purposes are handled
    // here now; anything else falls through to handleUnexpected() below,
    // which logs it and returns a generic 500.
    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<Map<String, Object>> handleBadRequest(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Request could not be processed");
        return ResponseEntity.badRequest().body(body);
    }

    // NullPointerException is a RuntimeException too, but it almost always means a
    // real bug (not bad input) — keep it on the 500 path via the generic handler
    // below instead of masking it as a 400.
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, Object>> handleNullPointer(NullPointerException ex) {
        return handleUnexpected(ex);
    }

    // Anything unexpected — never leak stack traces to the client, but do
    // log the full exception server-side so it's actually visible in
    // production logs/monitoring instead of disappearing silently.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        logger.error("Unhandled exception while processing request", ex);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Something went wrong. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
