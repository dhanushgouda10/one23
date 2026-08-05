package com.one23.one23.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Sourced from app.cors.allowed-origins (application.properties), which
    // defaults to the local dev origins and can be overridden in production
    // via the ONE23_CORS_ALLOWED_ORIGINS env var — no hardcoded URLs here.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    // Allow React frontend to call backend APIs
    //
    // Uses allowedOriginPatterns (not allowedOrigins) so entries can contain
    // wildcards like "http://localhost:*" — Vite's dev server doesn't always
    // land on 5173 (port-in-use fallback, sandboxed dev environments, etc.),
    // and allowedOriginPatterns still reflects back the exact matched origin
    // in the response header, so it remains safe to combine with
    // allowCredentials(true) (unlike a literal "*" in allowedOrigins, which
    // Spring rejects outright when credentials are allowed).
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(CorsOrigins.parse(allowedOrigins))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
