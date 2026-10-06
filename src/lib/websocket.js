// Real-time connection to the backend using STOMP over SockJS.
//
// The backend endpoint is `${WS_URL}` (default http://localhost:8080/ws).
//   - We SUBSCRIBE to /topic/... to receive messages.
//   - We SEND (publish) to /app/... to send messages.
// The JWT is sent once in the CONNECT headers so the backend knows who we are.
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "./config";
import { getToken } from "./session";

// Creates a STOMP client with the shared settings (auto-reconnect every 5s,
// heartbeats every 10s). Call client.activate() to connect and
// client.deactivate() to disconnect.
function createClient(onError, connectHeaders = {}) {
  return new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders,
    onStompError: (frame) => {
      onError?.(frame.headers.message || "WebSocket broker reported an error.");
    },
    onWebSocketError: () => {
      onError?.("WebSocket connection failed. Is the backend running?");
    },
  });
}

// Subscribes to a topic and passes each message (parsed from JSON) to onData.
function subscribeJson(client, topic, onData, onError, errorText) {
  client.subscribe(topic, (frame) => {
    try {
      onData(JSON.parse(frame.body));
    } catch {
      onError?.(errorText);
    }
  });
}

// My Rides page: tells us when any group is formed, so the page can reload its rides.
export function createMatchClient(callbacks) {
  const client = createClient(callbacks.onError);
  client.onConnect = () => {
    callbacks.onConnect?.();
    client.subscribe("/topic/match", () => callbacks.onMatch());
  };
  return client;
}

// Group lobby page: ONE connection with three subscriptions for this group:
//   /topic/chat/{groupId}      -> new chat messages      (callbacks.onMessage)
//   /topic/location/{groupId}  -> members' live location (callbacks.onLocationUpdate)
//   /topic/group/{groupId}     -> group events, e.g. DISSOLVED (callbacks.onGroupEvent)
export function createLobbyClient(groupId, callbacks) {
  const token = getToken();
  const client = createClient(callbacks.onError, token ? { Authorization: `Bearer ${token}` } : {});
  client.onConnect = () => {
    callbacks.onConnect?.();
    subscribeJson(client, `/topic/chat/${groupId}`, callbacks.onMessage, callbacks.onError, "Could not read chat message.");
    subscribeJson(client, `/topic/location/${groupId}`, callbacks.onLocationUpdate, callbacks.onError, "Could not read location update.");
    subscribeJson(client, `/topic/group/${groupId}`, callbacks.onGroupEvent, callbacks.onError, "Could not read group update.");
  };
  return client;
}

// Sends a chat message. Returns false if the connection isn't ready.
export function sendChatMessage(client, groupId, message) {
  if (!client?.connected) return false;
  client.publish({
    destination: `/app/chat/${groupId}`,
    body: JSON.stringify({ message: message.trim() }),
  });
  return true;
}

// Sends the current position. Returns false if the connection isn't ready.
export function sendLocationUpdate(client, groupId, latitude, longitude) {
  if (!client?.connected) return false;
  client.publish({
    destination: `/app/location/${groupId}`,
    body: JSON.stringify({ latitude, longitude }),
  });
  return true;
}
