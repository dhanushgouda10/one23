// Backend URLs. Set VITE_API_URL (see .env.example) for production; localhost is the dev default.
// Trailing "/" is removed so "https://api.example.com/" also works.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE_URL}/ws`;
