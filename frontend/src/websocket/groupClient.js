import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "../config/env";

function getToken() {
  // Auth only ever writes the token to sessionStorage (see Login.jsx),
  // so this is the single source of truth — keeps two tabs logged in as
  // two different accounts from ever mixing up.
  return sessionStorage.getItem("token");
}

// Connect to group status WebSocket.
// Used so a Group Lobby page finds out right away when its group is
// dissolved (a member left) instead of only noticing on next refresh.
export const createGroupClient = ({ groupId, onGroupEvent, onError, onConnect }) => {
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

      // Listen for status events (e.g. group dissolved) for this group
      client.subscribe(`/topic/group/${groupId}`, (message) => {
        try {
          const event = JSON.parse(message.body);
          onGroupEvent?.(event);
        } catch (error) {
          onError?.("Could not parse group update.");
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
