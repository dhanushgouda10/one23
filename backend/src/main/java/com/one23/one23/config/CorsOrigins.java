package com.one23.one23.config;

import java.util.ArrayList;
import java.util.List;

/**
 * Turns the comma-separated app.cors.allowed-origins property into a plain
 * array of trimmed origin patterns.
 *
 * CorsConfig (REST APIs) and WebSocketConfig (the /ws STOMP endpoint) both
 * need this same parsing done on the same property, so it lives here once
 * instead of being copy-pasted in both places.
 */
final class CorsOrigins {

    private CorsOrigins() {
        // Utility class — never instantiated.
    }

    static String[] parse(String commaSeparatedOrigins) {
        List<String> origins = new ArrayList<>();

        for (String origin : commaSeparatedOrigins.split(",")) {
            origins.add(origin.trim());
        }

        return origins.toArray(new String[0]);
    }
}
