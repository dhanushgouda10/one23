import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/Button";
import { ArrowLeft } from "../components/Icons";
import { ErrorState, Loader, StatusBadge } from "../components/primitives";
import { GroupLobbyMap } from "../components/GroupLobbyMap";
import { LobbyMembers } from "../components/LobbyMembers";
import { LobbyChat } from "../components/LobbyChat";
import {
  getGroupDetails,
  getChatHistory,
  startRide,
  endRide,
  cancelGroup,
  apiErrorMessage,
} from "../lib/api";
import { createLobbyClient, sendChatMessage, sendLocationUpdate } from "../lib/websocket";
import { getUserName, getUserEmail } from "../lib/session";
import { toast } from "../lib/toast";

// Group lobby for one matched group (/rides/:groupId).
// 1. Load the group (members, route, status) with REST.
// 2. Load old chat messages with REST.
// 3. Open ONE WebSocket for: new chat messages, live locations, group events.
// Buttons: Start ride (MATCHED), End ride (IN_PROGRESS), Leave group (MATCHED).
export function GroupLobbyPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const selfName = getUserName() || "You";
  const selfEmail = getUserEmail();

  const [group, setGroup] = useState(null); // { pickupHub, destination, status, members }
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState("");

  const [isSharing, setIsSharing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [memberLocations, setMemberLocations] = useState({}); // { "Priya": { latitude, longitude } }

  const [busyAction, setBusyAction] = useState(""); // "start" | "end" | "leave" | ""
  const [actionError, setActionError] = useState("");

  const clientRef = useRef(null); // the WebSocket client
  const locationTimerRef = useRef(null); // setInterval id while sharing location
  const isLeavingRef = useRef(false); // true while *I* am leaving (ignore my own DISSOLVED event)

  const hasGroup = group !== null;

  // ---- 1. Load the group ----
  useEffect(() => {
    getGroupDetails(groupId)
      .then((data) => {
        setGroup(data);
        setLoadError("");
      })
      .catch((err) => setLoadError(apiErrorMessage(err, "Could not load this group.")))
      .finally(() => setIsLoading(false));
  }, [groupId, retryCount]);

  // ---- 2 + 3. Chat history and the live connection (only after the group loaded) ----
  useEffect(() => {
    if (!hasGroup) return;

    getChatHistory(groupId)
      .then(setMessages)
      .catch((err) => setChatError(apiErrorMessage(err, "Could not load chat history.")));

    const client = createLobbyClient(groupId, {
      onConnect: () => setChatError(""),
      onError: (message) => setChatError(message),

      // New chat message (skip it if we already have it)
      onMessage: (message) => {
        setMessages((old) => (old.some((m) => m.id === message.id) ? old : [...old, message]));
      },

      // Someone's live location
      onLocationUpdate: (update) => {
        setMemberLocations((old) => ({ ...old, [update.userName]: update }));
      },

      // Group events from the backend
      onGroupEvent: (event) => {
        if (event.type === "DISSOLVED" && !isLeavingRef.current) {
          toast.message("A member left, so the group was closed. You're back in the waiting list.");
          navigate("/rides");
        }
        if (event.type === "STARTED" || event.type === "COMPLETED") {
          getGroupDetails(groupId)
            .then(setGroup)
            .catch(() => {});
        }
        if (event.type === "COMPLETED") {
          clearInterval(locationTimerRef.current);
          setIsSharing(false);
        }
      },
    });
    clientRef.current = client;
    client.activate();

    // Cleanup when leaving the page: close the connection and stop sharing
    return () => {
      client.deactivate();
      clearInterval(locationTimerRef.current);
    };
  }, [hasGroup, groupId, navigate]);

  // ---- Location sharing: send my position now and then every 5 seconds ----
  function handleShareLocation() {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location.");
      return;
    }
    setLocationError("");

    function sendMyPosition() {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          sendLocationUpdate(clientRef.current, groupId, pos.coords.latitude, pos.coords.longitude),
        () => {
          setLocationError("Could not get your location. Please allow location access.");
          handleStopSharing();
        },
      );
    }

    sendMyPosition();
    locationTimerRef.current = setInterval(sendMyPosition, 5000);
    setIsSharing(true);
  }

  function handleStopSharing() {
    clearInterval(locationTimerRef.current);
    locationTimerRef.current = null;
    setIsSharing(false);
  }

  // ---- Buttons ----
  async function runAction(name, apiCall, failMessage) {
    setBusyAction(name);
    setActionError("");
    try {
      await apiCall(groupId);
      setGroup(await getGroupDetails(groupId));
    } catch (err) {
      setActionError(apiErrorMessage(err, failMessage));
    } finally {
      setBusyAction("");
    }
  }

  async function handleLeaveGroup() {
    if (!window.confirm("Leave this group? The other two will go back to waiting.")) return;
    setBusyAction("leave");
    isLeavingRef.current = true;
    try {
      await cancelGroup(groupId);
      toast.message("You left the group.");
      navigate("/rides");
    } catch (err) {
      isLeavingRef.current = false;
      setActionError(apiErrorMessage(err, "Could not leave the group."));
      setBusyAction("");
    }
  }

  function handleSendMessage(text) {
    const sent = sendChatMessage(clientRef.current, groupId, text);
    if (!sent) setChatError("Chat is not connected. Please wait a moment.");
    return sent;
  }

  // ---- Screen ----
  if (isLoading) {
    return (
      <AppShell>
        <Loader label="Loading group…" />
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell>
        <ErrorState
          description={loadError}
          onRetry={() => {
            setIsLoading(true);
            setRetryCount((count) => count + 1);
          }}
        />
      </AppShell>
    );
  }

  const status = group.status;

  return (
    <AppShell>
      <Link to="/rides" className="back-link">
        <ArrowLeft size={16} /> My rides
      </Link>

      {/* Route, status and actions */}
      <section className="card">
        <div className="row-between">
          <h1 className="lobby-title">
            {group.pickupHub} → {group.destination}
          </h1>
          <StatusBadge status={status} />
        </div>

        {status === "MATCHED" ? (
          <p className="tip">
            Meet at the station, agree the fare with the auto driver <b>before</b> you start, then
            split it 3 ways.
          </p>
        ) : null}

        {actionError ? (
          <p role="alert" className="alert">
            {actionError}
          </p>
        ) : null}

        <div className="row">
          {status === "MATCHED" ? (
            <>
              <Button
                variant="lime"
                disabled={busyAction !== ""}
                onClick={() => runAction("start", startRide, "Could not start the ride.")}
              >
                {busyAction === "start" ? "Starting…" : "Start ride"}
              </Button>
              <Button variant="outline" disabled={busyAction !== ""} onClick={handleLeaveGroup}>
                {busyAction === "leave" ? "Leaving…" : "Leave group"}
              </Button>
            </>
          ) : null}
          {status === "IN_PROGRESS" ? (
            <Button
              variant="lime"
              disabled={busyAction !== ""}
              onClick={() => runAction("end", endRide, "Could not end the ride.")}
            >
              {busyAction === "end" ? "Ending…" : "End ride"}
            </Button>
          ) : null}
        </div>
      </section>

      <LobbyMembers
        members={group.members}
        selfEmail={selfEmail}
        sharingNames={Object.keys(memberLocations)}
      />

      <LobbyChat
        messages={messages}
        selfName={selfName}
        error={chatError}
        onSend={handleSendMessage}
      />

      {/* Map + location sharing */}
      <section className="card">
        <h2 className="label">Map</h2>
        <GroupLobbyMap
          pickupHub={group.pickupHub}
          destination={group.destination}
          memberLocations={memberLocations}
          selfName={selfName}
        />
        {locationError ? <p className="field-error">{locationError}</p> : null}
        {status !== "COMPLETED" ? (
          isSharing ? (
            <div className="row">
              <span className="live-dot" /> Sharing your location with the group
              <Button variant="ghost" size="sm" onClick={handleStopSharing}>
                Stop sharing
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleShareLocation}>
              Share my location
            </Button>
          )
        ) : null}
      </section>
    </AppShell>
  );
}
