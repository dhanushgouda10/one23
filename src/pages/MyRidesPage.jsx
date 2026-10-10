import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, Loader, StatusBadge } from "../components/primitives";
import { Button } from "../components/Button";
import { ArrowRight } from "../components/Icons";
import { getMyRides, cancelRide, apiErrorMessage } from "../lib/api";
import { createMatchClient } from "../lib/websocket";

// Statuses that have a group lobby to open
const HAS_LOBBY = ["MATCHED", "IN_PROGRESS", "COMPLETED"];

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// List of all my rides, newest first.
// The backend sends "REFRESH" on /topic/match whenever any group is formed.
export function MyRidesPage() {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  // Add 1 to refreshCount to reload the list (the effect below runs again)
  const [refreshCount, setRefreshCount] = useState(0);
  const reload = () => setRefreshCount((count) => count + 1);

  // Load my rides (on open, and every time refreshCount changes)
  useEffect(() => {
    getMyRides()
      .then((data) => {
        const newestFirst = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRides(newestFirst);
        setError("");
      })
      .catch((err) => setError(apiErrorMessage(err, "Could not load your rides.")))
      .finally(() => setIsLoading(false));
  }, [refreshCount]);

  // Live updates: reload when a group is formed. If the WebSocket fails, reload every 5 s.
  useEffect(() => {
    let pollTimer = null;

    const client = createMatchClient({
      onMatch: reload,
      onConnect: () => {
        clearInterval(pollTimer); // connected: no need to poll
        pollTimer = null;
      },
      onError: () => {
        if (!pollTimer) pollTimer = setInterval(reload, 5000);
      },
    });
    client.activate();

    // Cleanup when leaving the page
    return () => {
      clearInterval(pollTimer);
      client.deactivate();
    };
  }, []);

  async function handleCancel(rideId) {
    if (!window.confirm("Cancel this ride request?")) return;
    setCancelError("");
    setCancellingId(rideId);
    try {
      await cancelRide(rideId);
    } catch (err) {
      // e.g. 409: the ride was matched a moment ago
      setCancelError(apiErrorMessage(err, "Could not cancel the ride."));
    } finally {
      setCancellingId(null);
      reload(); // always show the latest status
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="My rides"
        action={
          <Link to="/join" className="btn btn-lime">
            Join a ride
          </Link>
        }
      />

      {error || cancelError ? (
        <p role="alert" className="alert">
          {error || cancelError}
        </p>
      ) : null}

      {isLoading ? (
        <Loader label="Loading your rides…" />
      ) : rides.length === 0 ? (
        <EmptyState
          title="No rides yet"
          description="Join a ride to get matched with 2 people going your way."
          action={
            <Link to="/join" className="btn btn-lime">
              Join a ride
            </Link>
          }
        />
      ) : (
        <ul className="ride-list">
          {rides.map((ride) => (
            <li key={ride.id} className="card ride-card">
              <div className="row-between">
                <h3>
                  {ride.pickupHub} → {ride.destination}
                </h3>
                <StatusBadge status={ride.status} />
              </div>
              <p className="hint">Requested {formatDate(ride.createdAt)}</p>

              {ride.status === "WAITING" ? (
                <>
                  <p className="hint">
                    Waiting for others on this route to make a group of 3. Requests expire after 15
                    minutes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === ride.id}
                    onClick={() => handleCancel(ride.id)}
                  >
                    {cancellingId === ride.id ? "Cancelling…" : "Cancel request"}
                  </Button>
                </>
              ) : null}

              {HAS_LOBBY.includes(ride.status) && ride.groupId ? (
                <Link to={`/rides/${ride.groupId}`} className="link">
                  {ride.status === "COMPLETED" ? "View group chat" : "Open group lobby"}{" "}
                  <ArrowRight size={14} />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
