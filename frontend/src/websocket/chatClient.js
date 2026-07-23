import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:8080/ws";

function getToken() {
  // Auth only ever writes the token to sessionStorage (see Login.jsx), so
  // this is the single source of truth — keeps each browser tab's session
  // independent instead of ever picking up another tab's leftover token.
  return sessionStorage.getItem("token");
}

// Connect to group chat WebSocket
export const createChatClient = ({ groupId, onMessage, onError, onConnect }) => {
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

      // Listen for new messages in this group
      client.subscribe(`/topic/chat/${groupId}`, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          onMessage?.(parsedMessage);
        } catch (error) {
          onError?.("Could not parse chat message.");
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

// Send message to backend through WebSocket
export const sendChatMessage = (client, groupId, messageText) => {
  if (!client || !client.connected) {
    return false;
  }

  client.publish({
    destination: `/app/chat/${groupId}`,
    body: JSON.stringify({
      message: messageText.trim()
    })
  });

  return true;
};
