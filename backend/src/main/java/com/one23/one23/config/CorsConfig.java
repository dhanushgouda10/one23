package com.one23.one23.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Sourced from app.cors.allowed-origins (application.properties), which
    // defaults to the local dev origins and can be overridden in production
    // via the ONE23_CORS_ALLOWED_ORIGINS env var — no hardcoded URLs here.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    // Allow React frontend to call backend APIs
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        Arrays.stream(allowedOrigins.split(","))
                                .map(String::trim)
                                .toArray(String[]::new)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
