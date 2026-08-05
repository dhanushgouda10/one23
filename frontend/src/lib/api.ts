import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/config";
import { getToken, clearSession, isAuthenticated } from "@/lib/session";

/**
 * Single source of truth for every backend call the frontend makes.
 * Endpoints, request bodies and response shapes mirror the Spring Boot
 * controllers exactly (see backend/src/main/java/com/one23/one23) —
 * nothing here is invented.
 */

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the JWT to every request except the public auth endpoints.
api.interceptors.request.use((config) => {
  const token = getToken();
  const isAuthRoute = config.url?.startsWith("/api/auth/");
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend's JWT is short-lived and there is no refresh-token endpoint
// (see JwtService / JwtAuthenticationFilter) — a 401 on an authenticated
// request always means the token expired or was rejected. Clear the stale
// session and send the user back to /login instead of leaving the page
// stuck on a silently-failing request.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.startsWith("/api/auth/");
    if (error.response?.status === 401 && !isAuthRoute && isAuthenticated()) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?sessionExpired=1";
      }
    }
    return Promise.reject(error);
  },
);

export type RideStatus = "WAITING" | "MATCHED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Ride = {
  id: number;
  name: string;
  pickupHub: string;
  destination: string;
  createdAt: string;
  groupId: string | null;
  status: RideStatus;
};

export type GroupMember = {
  fullName: string;
  email: string | null;
  rideStatus: RideStatus;
};

export type GroupLobby = {
  groupId: string;
  pickupHub: string;
  destination: string;
  status: RideStatus;
  members: GroupMember[];
};

export type ChatMessage = {
  id: number;
  groupId: string;
  senderName: string;
  message: string;
  timestamp: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  email: string;
  fullName: string;
};

export type MessageResponse = { message: string };

// POST /api/auth/signup
export async function signup(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>("/api/auth/signup", payload);
  return response.data;
}

// POST /api/auth/login
export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", payload);
  return response.data;
}

// POST /api/join — returns either a single waiting ride, or the 3 rides
// in a group when this request completed the match.
export async function joinRide(payload: {
  pickupHub: string;
  destination: string;
}): Promise<Ride | Ride[]> {
  const response = await api.post<Ride | Ride[]>("/api/join", {
    pickupHub: payload.pickupHub.trim(),
    destination: payload.destination.trim(),
  });
  return response.data;
}

// GET /api/my-rides
export async function getMyRides(): Promise<Ride[]> {
  const response = await api.get<Ride[]>("/api/my-rides");
  return response.data;
}

// PATCH /api/rides/{id}/cancel
export async function cancelRide(rideId: number): Promise<MessageResponse> {
  const response = await api.patch<MessageResponse>(`/api/rides/${rideId}/cancel`);
  return response.data;
}

// GET /api/groups/{groupId}
export async function getGroupDetails(groupId: string): Promise<GroupLobby> {
  const response = await api.get<GroupLobby>(`/api/groups/${groupId}`);
  return response.data;
}

// GET /api/chat/{groupId}
export async function getChatHistory(groupId: string): Promise<ChatMessage[]> {
  const response = await api.get<ChatMessage[]>(`/api/chat/${groupId}`);
  return response.data;
}

// PATCH /api/rides/{groupId}/start
export async function startRide(groupId: string): Promise<MessageResponse> {
  const response = await api.patch<MessageResponse>(`/api/rides/${groupId}/start`);
  return response.data;
}

// PATCH /api/rides/{groupId}/end
export async function endRide(groupId: string): Promise<MessageResponse> {
  const response = await api.patch<MessageResponse>(`/api/rides/${groupId}/end`);
  return response.data;
}

// PATCH /api/rides/{groupId}/cancel-group
export async function cancelGroup(groupId: string): Promise<MessageResponse> {
  const response = await api.patch<MessageResponse>(`/api/rides/${groupId}/cancel-group`);
  return response.data;
}

/** Pulls a human-readable message out of a failed API call. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{
    message?: string;
    fieldErrors?: Record<string, string>;
  }>;
  const data = axiosError?.response?.data;
  if (data?.message) return data.message;
  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  if (axiosError?.request && !axiosError.response) {
    return "Cannot reach the server. Please make sure the backend is running.";
  }
  return fallback;
}

/** Field-level validation errors from the backend's GlobalExceptionHandler. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<{ fieldErrors?: Record<string, string> }>;
  return axiosError?.response?.data?.fieldErrors ?? {};
}

export default api;
