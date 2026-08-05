/**
 * Centralized runtime configuration for the backend API and WebSocket
 * endpoints.
 *
 * Set VITE_API_URL when building for production so the app points at the
 * deployed Spring Boot backend instead of the local dev server. Both fall
 * back to localhost:8080 so local development works with no .env file.
 */
export const API_BASE_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:8080";

export const WS_URL: string =
  (import.meta.env["VITE_WS_URL"] as string | undefined) || `${API_BASE_URL}/ws`;
