// Centralized runtime configuration for API/WebSocket endpoints.
//
// Set VITE_API_URL (and optionally VITE_WS_URL) when building the frontend
// for production so it points at the deployed backend instead of the local
// dev server — see .env.example. Both fall back to localhost:8080 so local
// development keeps working with no .env file present.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE_URL}/ws`;

export { API_BASE_URL, WS_URL };
