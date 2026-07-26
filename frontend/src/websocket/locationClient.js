import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../config/env";

function getToken() {
  // Auth only ever writes the token to sessionStorage (see Login.jsx),
  // so this is the single source of truth — keeping it this way (instead
  // of also falling back to localStorage) avoids two tabs ever picking up
  // a leftover token from a different account.
  return sessionStorage.getItem("token");
}

// Connect to location sharing WebSocket
export const createLocationClient = ({ groupId, onLocationUpdate, onError, onConnect }) => {
  const token = getToken();

  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    // Send JWT token when WebSocket connects
    connectHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : {},

    onConnect: () => {
      onConnect?.();

      // Listen for location updates in this group
      client.subscribe(`/topic/location/${groupId}`, (message) => {
        try {
          const locationData = JSON.parse(message.body);
          onLocationUpdate?.(locationData);
        } catch (error) {
          console.error("Could not parse location update:", error);
          onError?.("Could not parse location update.");
        }
      });
    },

    onStompError: (frame) => {
      const brokerMessage =
        frame?.headers?.message || "WebSocket broker reported an error.";
      onError?.(brokerMessage);
    },

    onWebSocketError: () => {
      onError?.("WebSocket connection failed. Is backend running on port 8080?");
    }
  });

  return client;
};

// Send location update to backend through WebSocket
export const sendLocationUpdate = (client, groupId, latitude, longitude) => {
  if (!client || !client.connected) {
    return false;
  }

  client.publish({
    destination: `/app/location/${groupId}`,
    body: JSON.stringify({
      latitude: latitude,
      longitude: longitude
    })
  });

  return true;
};
