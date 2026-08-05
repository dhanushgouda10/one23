import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, StatusBadge, ErrorState, PageLoader } from "@/components/common/primitives";
import { GroupLobbyMap } from "@/components/common/GroupLobbyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getGroupDetails,
  getChatHistory,
  startRide,
  endRide,
  cancelGroup,
  apiErrorMessage,
  type GroupLobby,
  type ChatMessage,
  type RideStatus,
} from "@/lib/api";
import {
  createChatClient,
  sendChatMessage,
  createLocationClient,
  sendLocationUpdate,
  createGroupClient,
  type LocationUpdate,
} from "@/lib/websocket";
import { getUserName } from "@/lib/session";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Client } from "@stomp/stompjs";

export const Route = createFileRoute("/rides/$groupId")({
  head: () => ({
    meta: [{ title: "Group lobby — one23" }],
  }),
  component: GroupLobbyPage,
});

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function GroupLobbyPage() {
  const { ready } = useRequireAuth();
  const { groupId } = Route.useParams();
  const navigate = Route.useNavigate();
  const userName = getUserName() || "You";

  const [group, setGroup] = useState<GroupLobby | null>(null);
  const [status, setStatus] = useState<RideStatus>("MATCHED");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState("");

  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [memberLocations, setMemberLocations] = useState<Record<string, LocationUpdate>>({});

  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [requestingLocation, setRequestingLocation] = useState(false);

  const chatClientRef = useRef<Client | null>(null);
  const locationClientRef = useRef<Client | null>(null);
  const groupClientRef = useRef<Client | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Set right before we call cancelGroup() ourselves — lets the group
  // lifecycle socket below tell "I caused this DISSOLVED event" apart
  // from "someone else in my group left", so the leaver doesn't get a
  // second toast + redundant navigate on top of their own.
  const leavingRef = useRef(false);

  // Load group details. retryTick lets the "Try again" button on
  // ErrorState re-run this without duplicating the fetch logic.
  const [retryTick, setRetryTick] = useState(0);
  useEffect(() => {
    if (!ready) return;
    let isMounted = true;
    setLoading(true);
    getGroupDetails(groupId)
      .then((data) => {
        if (!isMounted) return;
        setGroup(data);
        setStatus(data.status);
        setLoadError("");
      })
      .catch((err) => {
        if (isMounted) setLoadError(apiErrorMessage(err, "Failed to load group details."));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [ready, groupId, retryTick]);

  // Chat history + live chat socket.
  useEffect(() => {
    if (!ready || loading) return;

    getChatHistory(groupId)
      .then(setMessages)
      .catch((err) => setChatError(apiErrorMessage(err, "Could not load chat history.")));

    const client = createChatClient(groupId, {
      onConnect: () => setChatError(""),
      onMessage: (message) => {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      },
      onError: setChatError,
    });
    chatClientRef.current = client;
    client.activate();

    return () => {
      chatClientRef.current?.deactivate();
      chatClientRef.current = null;
    };
  }, [ready, loading, groupId]);

  // Group lifecycle socket — leave automatically if the group dissolves.
  useEffect(() => {
    if (!ready || loading) return;

    const client = createGroupClient(groupId, {
      onGroupEvent: (event) => {
        if (event.type === "DISSOLVED" && !leavingRef.current) {
          toast.message(event.message || "Your group was dissolved.");
          void navigate({ to: "/rides" });
        }
      },
    });
    groupClientRef.current = client;
    client.activate();

    return () => {
      groupClientRef.current?.deactivate();
      groupClientRef.current = null;
    };
  }, [ready, loading, groupId, navigate]);

  // Location socket.
  useEffect(() => {
    if (!ready || loading) return;

    const client = createLocationClient(groupId, {
      onConnect: () => setLocationError(""),
      onLocationUpdate: (update) => {
        setMemberLocations((prev) => ({ ...prev, [update.userName]: update }));
      },
      onError: setLocationError,
    });
    locationClientRef.current = client;
    client.activate();

    return () => {
      locationClientRef.current?.deactivate();
      locationClientRef.current = null;
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [ready, loading, groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleShareLocation() {
    if (requestingLocation || sharingLocation) return;
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    if (!locationClientRef.current?.connected) {
      setLocationError("Location connection not ready. Please wait a moment and try again.");
      return;
    }
    setLocationError("");
    setRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSharingLocation(true);
        setRequestingLocation(false);
        sendLocationUpdate(
          locationClientRef.current,
          groupId,
          position.coords.latitude,
          position.coords.longitude,
        );

        locationIntervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            sendLocationUpdate(
              locationClientRef.current,
              groupId,
              pos.coords.latitude,
              pos.coords.longitude,
            );
          });
        }, 5000);
      },
      () => {
        setLocationError("Unable to retrieve your location. Please enable location permissions.");
        setSharingLocation(false);
        setRequestingLocation(false);
      },
    );
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    setActionError("");
    try {
      await startRide(groupId);
      const data = await getGroupDetails(groupId);
      setGroup(data);
      setStatus(data.status);
    } catch (err) {
      setActionError(apiErrorMessage(err, "Failed to start ride."));
    } finally {
      setStarting(false);
    }
  }

  async function handleEnd() {
    if (ending) return;
    setEnding(true);
    setActionError("");
    try {
      await endRide(groupId);
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      setSharingLocation(false);
      const data = await getGroupDetails(groupId);
      setGroup(data);
      setStatus(data.status);
    } catch (err) {
      setActionError(apiErrorMessage(err, "Failed to end ride."));
    } finally {
      setEnding(false);
    }
  }

  async function handleLeaveGroup() {
    if (cancelling) return;
    if (!window.confirm("Cancel this ride for your whole group? This can't be undone.")) return;
    setCancelling(true);
    leavingRef.current = true;
    setActionError("");
    try {
      await cancelGroup(groupId);
      toast.message("Group ride was cancelled.");
      await navigate({ to: "/rides" });
    } catch (err) {
      leavingRef.current = false;
      setActionError(apiErrorMessage(err, "Failed to cancel group."));
    } finally {
      setCancelling(false);
    }
  }

  function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text) return;
    const sent = sendChatMessage(chatClientRef.current, groupId, text);
    if (!sent) {
      setChatError("Chat connection lost. Please refresh the page.");
      return;
    }
    setMessageInput("");
  }

  if (!ready) return <PageLoader label="Loading group lobby…" />;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/rides">
            <ArrowLeft /> Back to my rides
          </Link>
        </Button>

        {loading ? (
          <div className="surface animate-pulse p-8 text-sm text-muted-foreground">
            Loading group lobby…
          </div>
        ) : loadError ? (
          <ErrorState
            description={loadError}
            onRetry={() => {
              setLoadError("");
              setRetryTick((t) => t + 1);
            }}
          />
        ) : (
          <>
            <section className="surface space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {group?.pickupHub} → {group?.destination}
                </h1>
                <StatusBadge status={status} />
              </div>

              {actionError ? (
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {actionError}
                </p>
              ) : null}

              <div className="space-y-3">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Route &amp; live location
                </h2>

                {group ? (
                  <GroupLobbyMap
                    pickupHub={group.pickupHub}
                    destination={group.destination}
                    memberLocations={memberLocations}
                    selfName={userName}
                  />
                ) : null}

                {locationError ? <p className="text-xs text-destructive">{locationError}</p> : null}
                {!sharingLocation && status !== "COMPLETED" ? (
                  <Button
                    variant="outline"
                    size="default"
                    disabled={requestingLocation}
                    onClick={handleShareLocation}
                  >
                    {requestingLocation ? "Getting your location…" : "Share my location"}
                  </Button>
                ) : sharingLocation ? (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="pulse-ring absolute inset-0 rounded-full bg-lime" />
                      <span className="relative h-2 w-2 rounded-full bg-lime" />
                    </span>
                    Sharing your location with the group
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2.5 border-t border-border pt-5">
                {status === "MATCHED" ? (
                  <>
                    <Button variant="lime" size="default" disabled={starting} onClick={handleStart}>
                      {starting ? "Starting…" : "Start ride"}
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      disabled={cancelling}
                      onClick={handleLeaveGroup}
                    >
                      {cancelling ? "Cancelling…" : "Cancel ride"}
                    </Button>
                  </>
                ) : null}
                {status === "IN_PROGRESS" ? (
                  <Button variant="lime" size="default" disabled={ending} onClick={handleEnd}>
                    {ending ? "Ending…" : "End ride"}
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="surface space-y-4 p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Your group ({group?.members.length ?? 0})
              </h2>
              <ul className="grid gap-3 sm:grid-cols-3">
                {group?.members.map((member) => (
                  <li
                    key={member.fullName}
                    className="flex items-center gap-3 rounded-2xl border border-border p-4"
                  >
                    <Avatar initials={initialsOf(member.fullName)} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {member.fullName}
                        {member.fullName === userName ? (
                          <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={member.rideStatus} />
                        {memberLocations[member.fullName] ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lime-soft px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                            Sharing
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface flex flex-col p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-muted-foreground">Group chat</h2>
              {chatError ? <p className="mt-2 text-xs text-destructive">{chatError}</p> : null}

              <div className="mt-4 flex max-h-96 min-h-56 flex-col gap-3 overflow-y-auto rounded-2xl bg-muted/40 p-4">
                {messages.length === 0 ? (
                  <p className="m-auto text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const own = msg.senderName === userName;
                    return (
                      <div
                        key={msg.id}
                        className={own ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}
                      >
                        <div
                          className={
                            "rounded-2xl px-4 py-2.5 text-sm " +
                            (own ? "bg-ink text-ink-foreground" : "bg-card border border-border")
                          }
                        >
                          {!own ? (
                            <p className="text-xs font-semibold text-accent-foreground">
                              {msg.senderName}
                            </p>
                          ) : null}
                          <p>{msg.message}</p>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2.5">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="h-12 flex-1 rounded-full text-base"
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  variant="lime"
                  disabled={!messageInput.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
