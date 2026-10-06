import { API_BASE_URL } from "./config";
import { getToken, clearSession, isAuthenticated } from "./session";

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !path.startsWith("/api/auth/")) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    const networkError = new Error("network");
    networkError.isNetworkError = true;
    throw networkError;
  }

  if (response.status === 401 && !path.startsWith("/api/auth/") && isAuthenticated()) {
    clearSession();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?sessionExpired=1";
    }
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const apiError = new Error("api");
    apiError.data = data;
    apiError.status = response.status;
    throw apiError;
  }

  return data;
}

export function signup(payload) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinRide(payload) {
  return request("/api/join", {
    method: "POST",
    body: JSON.stringify({
      pickupHub: payload.pickupHub.trim(),
      destination: payload.destination.trim(),
    }),
  });
}

export function getMyRides() {
  return request("/api/my-rides");
}

export function cancelRide(rideId) {
  return request(`/api/rides/${rideId}/cancel`, { method: "PATCH" });
}

export function getGroupDetails(groupId) {
  return request(`/api/groups/${groupId}`);
}

export function getChatHistory(groupId) {
  return request(`/api/chat/${groupId}`);
}

export function startRide(groupId) {
  return request(`/api/rides/${groupId}/start`, { method: "PATCH" });
}

export function endRide(groupId) {
  return request(`/api/rides/${groupId}/end`, { method: "PATCH" });
}

export function cancelGroup(groupId) {
  return request(`/api/rides/${groupId}/cancel-group`, { method: "PATCH" });
}

export function apiErrorMessage(error, fallback) {
  if (error?.isNetworkError) {
    return "Cannot reach the server. Please make sure the backend is running.";
  }
  const data = error?.data;
  if (data?.message) return data.message;
  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  return fallback;
}

export function apiFieldErrors(error) {
  return error?.data?.fieldErrors ?? {};
}
