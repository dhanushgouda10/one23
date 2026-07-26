package com.one23.one23.auth.controller;

import com.one23.one23.auth.dto.LoginRequest;
import com.one23.one23.auth.dto.SignupRequest;
import com.one23.one23.auth.security.LoginRateLimiter;
import com.one23.one23.auth.service.JwtService;
import com.one23.one23.email.service.EmailService;
import com.one23.one23.user.model.User;
import com.one23.one23.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Controller for user authentication (signup and login)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final LoginRateLimiter loginRateLimiter;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          EmailService emailService,
                          LoginRateLimiter loginRateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.loginRateLimiter = loginRateLimiter;
    }

    // Register a new user
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered"));
        }

        // Create new user object
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        // Encrypt password before saving
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(encodedPassword);

        // Save user to database
        userRepository.save(user);

        // Send the welcome email now that the user is saved.
        // sendWelcomeEmail() catches all its own errors internally, so if
        // the email fails to send (bad SMTP config, no internet, etc.) the
        // signup below still completes successfully — email is best-effort.
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        return ResponseEntity.ok(
                Map.of("message", "Signup successful")
        );
    }

    // Login and return JWT token
    //
    // Rate limited by client IP and by the submitted email (see
    // LoginRateLimiter) — previously this endpoint had no protection
    // against brute-force or credential-stuffing attempts at all.
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                    HttpServletRequest httpRequest) {

        String clientIp = httpRequest.getRemoteAddr();
        String emailKey = request.getEmail() == null ? "" : request.getEmail().toLowerCase();

        boolean ipAllowed = loginRateLimiter.tryAcquire("ip:" + clientIp);
        boolean emailAllowed = loginRateLimiter.tryAcquire("email:" + emailKey);

        if (!ipAllowed || !emailAllowed) {
            logger.warn("Login rate limit exceeded for ip={} email={}", clientIp, emailKey);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many login attempts. Please try again later."));
        }

        // Find user by email, then verify the password. Both failure cases
        // return the same generic message so a caller can't use this
        // endpoint to figure out whether an email is registered.
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        boolean credentialsValid = user != null && passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!credentialsValid) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid email or password"));
        }

        // Generate JWT token for this user
        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "token", token,
                        "email", user.getEmail(),
                        "fullName", user.getFullName()
                )
        );
    }
}
