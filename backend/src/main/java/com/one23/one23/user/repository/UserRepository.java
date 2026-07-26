package com.one23.one23.user.repository;

import com.one23.one23.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Repository for user database operations
public interface UserRepository extends JpaRepository<User, Long> {

    // Used during login and JWT validation
    Optional<User> findByEmail(String email);

    // Used during signup to prevent duplicate email
    boolean existsByEmail(String email);
}
