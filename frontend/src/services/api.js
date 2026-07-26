import axios from "axios";
import { API_BASE_URL } from "../config/env";

/**
 * API Configuration
 *
 * Base URL comes from VITE_API_URL (see .env.example), falling back to
 * http://localhost:8080 for local development.
 *
 * - Attaches JWT token from sessionStorage to protected requests
 * - Keeps all backend calls in one place
 */

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach Bearer token automatically for protected routes
api.interceptors.request.use(
  (config) => {
    // sessionStorage is scoped per browser tab, which is what keeps two
    // tabs logged in as two different accounts from ever mixing up.
    // (Login.jsx only ever writes the token here — never to localStorage —
    // so this is the single source of truth for "who is logged in".)
    const token = sessionStorage.getItem("token");
    const isAuthRoute = config.url?.startsWith("/api/auth/");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// POST /api/auth/login
export const login = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
};

// POST /api/auth/signup
export const signup = async (userData) => {
  const response = await api.post("/api/auth/signup", userData);
  return response.data;
};

// POST /api/join
export const joinRide = async (rideData) => {
  const response = await api.post("/api/join", {
    pickupHub: rideData.pickupHub?.trim(),
    destination: rideData.destination?.trim()
  });
  return response.data;
};

// GET /api/my-rides
export const getMyRides = async () => {
  const response = await api.get("/api/my-rides");
  return response.data;
};

// PATCH /api/rides/{id}/cancel
export const cancelRide = async (rideId) => {
  const response = await api.patch(`/api/rides/${rideId}/cancel`);
  return response.data;
};

// GET /api/groups/{groupId}
export const getGroupDetails = async (groupId) => {
  const response = await api.get(`/api/groups/${groupId}`);
  return response.data;
};

// GET /api/chat/{groupId}
export const getChatHistory = async (groupId) => {
  const response = await api.get(`/api/chat/${groupId}`);
  return response.data;
};

// PATCH /api/rides/{groupId}/start
export const startRide = async (groupId) => {
  const response = await api.patch(`/api/rides/${groupId}/start`);
  return response.data;
};

// PATCH /api/rides/{groupId}/end
export const endRide = async (groupId) => {
  const response = await api.patch(`/api/rides/${groupId}/end`);
  return response.data;
};

// PATCH /api/rides/{groupId}/cancel-group
// Cancels the whole matched group (only allowed before the ride starts)
export const cancelGroup = async (groupId) => {
  const response = await api.patch(`/api/rides/${groupId}/cancel-group`);
  return response.data;
};

export default api;
