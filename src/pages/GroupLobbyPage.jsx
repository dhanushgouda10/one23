import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Send } from "../components/Icons";
import { toast } from "../lib/toast";
import { AppShell } from "../components/AppShell";
import { Avatar, StatusBadge, ErrorState, PageLoader } from "../components/primitives";
import { GroupLobbyMap } from "../components/GroupLobbyMap";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { getGroupDetails, getChatHistory, startRide, endRide, cancelGroup, apiErrorMessage } from "../lib/api";
import { createLobbyClient, sendChatMessage, sendLocationUpdate } from "../lib/websocket";
import { getUserName } from "../lib/session";
import { initialsOf } from "../lib/utils";
import { useRequireAuth } from "../hooks/useRequireAuth";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function GroupLobbyPage() {
  const { ready } = useRequireAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();
  const userName = getUserName() || "You";

  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState("MATCHED");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [chatError, setChatError] = useState("");

  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [memberLocations, setMemberLocations] = useState({});

  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [requestingLocation, setRequestingLocation] = useState(false);

  const lobbyClientRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const leavingRef = useRef(false);
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

  // Load chat history, then open ONE live connection for chat, location and group events.
  useEffect(() => {
    if (!ready || loading) return;

    getChatHistory(groupId)
      .then(setMessages)
      .catch((err) => setChatError(apiErrorMessage(err, "Could not load chat history.")));

    const client = createLobbyClient(groupId, {
      onConnect: () => {
        setChatError("");
        setLocationError("");
      },
      onError: (message) => {
        setChatError(message);
        setLocationError(message);
      },
      onMessage: (message) => {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      },
      onLocationUpdate: (update) => {
        setMemberLocations((prev) => ({ ...prev, [update.userName]: update }));
      },
      onGroupEvent: (event) => {
        // Another member left: the backend dissolved the group, so go back to My Rides.
        if (event.type === "DISSOLVED" && !leavingRef.current) {
          toast.message(event.message || "Your group was dissolved.");
          navigate("/rides");
        }
        // A member started or ended the ride: reload the group so everyone sees the new status.
        if (event.type === "STARTED" || event.type === "COMPLETED") {
          if (event.type === "COMPLETED" && locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
            locationIntervalRef.current = null;
            setSharingLocation(false);
          }
          getGroupDetails(groupId)
            .then((data) => {
              setGroup(data);
              setStatus(data.status);
            })
            .catch(() => {});
        }
      },
    });
    lobbyClientRef.current = client;
    client.activate();

    return () => {
      lobbyClientRef.current?.deactivate();
      lobbyClientRef.current = null;
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [ready, loading, groupId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleShareLocation() {
    if (requestingLocation || sharingLocation) return;
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    if (!lobbyClientRef.current?.connected) {
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
          lobbyClientRef.current,
          groupId,
          position.coords.latitude,
          position.coords.longitude,
        );

        locationIntervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            sendLocationUpdate(
              lobbyClientRef.current,
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
      navigate("/rides");
    } catch (err) {
      leavingRef.current = false;
      setActionError(apiErrorMessage(err, "Failed to cancel group."));
    } finally {
      setCancelling(false);
    }
  }

  function handleSendMessage(event) {
    event.preventDefault();
    const text = messageInput.trim();
    if (!text) return;
    const sent = sendChatMessage(lobbyClientRef.current, groupId, text);
    if (!sent) {
      setChatError("Chat connection lost. Please refresh the page.");
      return;
    }
    setMessageInput("");
  }

  if (!ready) return <PageLoader label="Loading group lobby…" />;

  return (
    <AppShell>
      <div className="lobby">
        <Link to="/rides" className="btn btn-ghost btn-sm" style={{ width: "fit-content" }}>
          <ArrowLeft /> Back to my rides
        </Link>

        {loading ? (
          <div className="surface animate-pulse" style={{ padding: "2rem" }}>
            <p className="hint">Loading group lobby…</p>
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
            <section className="surface lobby-card">
              <div className="lobby-head">
                <h1 className="font-display">
                  {group?.pickupHub} → {group?.destination}
                </h1>
                <StatusBadge status={status} />
              </div>

              {actionError ? (
                <p role="alert" aria-live="polite" className="alert">
                  {actionError}
                </p>
              ) : null}

              <div className="stack" style={{ gap: "0.75rem", marginTop: 0 }}>
                <h2 className="muted-label">
                  <MapPin size={16} /> Route &amp; live location
                </h2>

                {group ? (
                  <GroupLobbyMap
                    pickupHub={group.pickupHub}
                    destination={group.destination}
                    memberLocations={memberLocations}
                    selfName={userName}
                  />
                ) : null}

                {locationError ? <p className="field-error">{locationError}</p> : null}
                {!sharingLocation && status !== "COMPLETED" ? (
                  <Button variant="outline" disabled={requestingLocation} onClick={handleShareLocation}>
                    {requestingLocation ? "Getting your location…" : "Share my location"}
                  </Button>
                ) : sharingLocation ? (
                  <p className="sharing-row">
                    <span className="dot-wrap">
                      <span className="pulse-ring dot-ping" />
                      <span className="dot" />
                    </span>
                    Sharing your location with the group
                  </p>
                ) : null}
              </div>

              <div className="lobby-actions">
                {status === "MATCHED" ? (
                  <>
                    <Button variant="lime" disabled={starting} onClick={handleStart}>
                      {starting ? "Starting…" : "Start ride"}
                    </Button>
                    <Button variant="outline" disabled={cancelling} onClick={handleLeaveGroup}>
                      {cancelling ? "Cancelling…" : "Cancel ride"}
                    </Button>
                  </>
                ) : null}
                {status === "IN_PROGRESS" ? (
                  <Button variant="lime" disabled={ending} onClick={handleEnd}>
                    {ending ? "Ending…" : "End ride"}
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="surface lobby-card" style={{ gap: "1rem" }}>
              <h2 className="muted-label">Your group ({group?.members.length ?? 0})</h2>
              <ul className="member-grid">
                {group?.members.map((member) => (
                  <li key={member.fullName} className="member-card">
                    <Avatar initials={initialsOf(member.fullName)} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
                        {member.fullName}
                        {member.fullName === userName ? (
                          <span className="hint" style={{ marginLeft: "0.375rem", fontWeight: 400 }}>
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <div className="member-meta">
                        <StatusBadge status={member.rideStatus} />
                        {memberLocations[member.fullName] ? (
                          <span className="sharing-pill">
                            <span className="badge-dot" aria-hidden />
                            Sharing
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface lobby-card">
              <h2 className="muted-label">Group chat</h2>
              {chatError ? <p className="field-error">{chatError}</p> : null}

              <div className="chat-box">
                {messages.length === 0 ? (
                  <p className="chat-empty">No messages yet. Say hello!</p>
                ) : (
                  messages.map((msg) => {
                    const own = msg.senderName === userName;
                    return (
                      <div key={msg.id} className={`bubble-wrap ${own ? "own" : "other"}`}>
                        <div className={`bubble ${own ? "own" : "other"}`}>
                          {!own ? <p className="bubble-name">{msg.senderName}</p> : null}
                          <p>{msg.message}</p>
                        </div>
                        <p className="bubble-time">{formatTime(msg.timestamp)}</p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-form">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="input-chat"
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  variant="lime"
                  disabled={!messageInput.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </form>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
