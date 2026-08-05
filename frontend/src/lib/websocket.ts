import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "@/lib/config";
import { getToken } from "@/lib/session";
import type { ChatMessage } from "@/lib/api";

/**
 * STOMP-over-SockJS clients for the backend's WebSocket endpoint (see
 * WebSocketConfig.java: broker prefix /topic, app prefix /app, endpoint
 * /ws). One factory per topic the frontend actually subscribes to.
 */

type ClientCallbacks = {
  onConnect?: () => void;
  onError?: (message: string) => void;
};

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function baseClient(
  callbacks: ClientCallbacks,
  extra: { connectHeaders?: Record<string, string> },
) {
  return new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: extra.connectHeaders ?? {},
    onStompError: (frame) => {
      callbacks.onError?.(frame.headers["message"] || "WebSocket broker reported an error.");
    },
    onWebSocketError: () => {
      callbacks.onError?.("WebSocket connection failed. Is the backend running?");
    },
  });
}

// Global match feed — MatchingService broadcasts here whenever a group
// of 3 forms. Used purely as an "invalidate and refetch /api/my-rides"
// signal; the payload isn't read directly.
export function createMatchClient(callbacks: ClientCallbacks & { onMatch: () => void }): Client {
  const client = baseClient(callbacks, {});
  client.onConnect = () => {
    callbacks.onConnect?.();
    client.subscribe("/topic/match", () => callbacks.onMatch());
  };
  return client;
}

// Group chat — /topic/chat/{groupId}, sends to /app/chat/{groupId}.
export function createChatClient(
  groupId: string,
  callbacks: ClientCallbacks & { onMessage: (message: ChatMessage) => void },
): Client {
  const client = baseClient(callbacks, { connectHeaders: authHeaders() });
  client.onConnect = () => {
    callbacks.onConnect?.();
    client.subscribe(`/topic/chat/${groupId}`, (frame: IMessage) => {
      try {
        callbacks.onMessage(JSON.parse(frame.body) as ChatMessage);
      } catch {
        callbacks.onError?.("Could not read chat message.");
      }
    });
  };
  return client;
}

export function sendChatMessage(client: Client | null, groupId: string, message: string): boolean {
  if (!client?.connected) return false;
  client.publish({
    destination: `/app/chat/${groupId}`,
    body: JSON.stringify({ message: message.trim() }),
  });
  return true;
}

// Live location — /topic/location/{groupId}, sends to /app/location/{groupId}.
export type LocationUpdate = { latitude: number; longitude: number; userName: string };

export function createLocationClient(
  groupId: string,
  callbacks: ClientCallbacks & { onLocationUpdate: (update: LocationUpdate) => void },
): Client {
  const client = baseClient(callbacks, { connectHeaders: authHeaders() });
  client.onConnect = () => {
    callbacks.onConnect?.();
    client.subscribe(`/topic/location/${groupId}`, (frame: IMessage) => {
      try {
        callbacks.onLocationUpdate(JSON.parse(frame.body) as LocationUpdate);
      } catch {
        callbacks.onError?.("Could not read location update.");
      }
    });
  };
  return client;
}

export function sendLocationUpdate(
  client: Client | null,
  groupId: string,
  latitude: number,
  longitude: number,
): boolean {
  if (!client?.connected) return false;
  client.publish({
    destination: `/app/location/${groupId}`,
    body: JSON.stringify({ latitude, longitude }),
  });
  return true;
}

// Group lifecycle — /topic/group/{groupId}. Backend pushes a DISSOLVED
// event here when a member leaves a matched group before the ride starts.
export type GroupEvent = { type: string; message: string };

export function createGroupClient(
  groupId: string,
  callbacks: ClientCallbacks & { onGroupEvent: (event: GroupEvent) => void },
): Client {
  const client = baseClient(callbacks, { connectHeaders: authHeaders() });
  client.onConnect = () => {
    callbacks.onConnect?.();
    client.subscribe(`/topic/group/${groupId}`, (frame: IMessage) => {
      try {
        callbacks.onGroupEvent(JSON.parse(frame.body) as GroupEvent);
      } catch {
        callbacks.onError?.("Could not read group update.");
      }
    });
  };
  return client;
}
