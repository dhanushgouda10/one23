import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
// Connect directly to backend (CORS enabled) — more reliable than Vite proxy for SockJS
import { WS_URL } from "../config/env";

export const createMatchClient = ({ onMatch, onError, onConnect }) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onConnect?.();
      client.subscribe("/topic/match", (message) => {
        try {
          const parsedBody = JSON.parse(message.body);
          onMatch(parsedBody);
        } catch (error) {
          onError?.("Could not read match update.");
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
