import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, MapPinOff, ArrowUpRight } from "../components/Icons";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/SectionHeading";
import { EmptyState, PageLoader, SkeletonCard, StatusBadge } from "../components/primitives";
import { Button } from "../components/Button";
import { getMyRides, cancelRide, apiErrorMessage } from "../lib/api";
import { createMatchClient } from "../lib/websocket";
import { useRequireAuth } from "../hooks/useRequireAuth";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-IN");
}

export function MyRidesPage() {
  const { ready } = useRequireAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const pollTimerRef = useRef(null);
  const socketRef = useRef(null);

  function startPolling() {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(() => {
      void loadRides(false);
    }, 5000);
  }

  function stopPolling() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  async function loadRides(showSpinner) {
    if (showSpinner) setLoading(true);
    try {
      const data = await getMyRides();
      setRides(data);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load rides. Please try again."));
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    let isMounted = true;

    void loadRides(true);

    const client = createMatchClient({
      onConnect: () => {
        if (isMounted) stopPolling();
      },
      onMatch: () => {
        if (isMounted) void loadRides(false);
      },
      onError: () => {
        if (isMounted) startPolling();
      },
    });
    socketRef.current = client;
    client.activate();

    return () => {
      isMounted = false;
      stopPolling();
      socketRef.current?.deactivate();
      socketRef.current = null;
    };
  }, [ready]);

  async function handleCancel(rideId) {
    if (cancellingId) return;
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    setError("");
    setCancellingId(rideId);
    try {
      await cancelRide(rideId);
      await loadRides(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to cancel ride. Please try again."));
    } finally {
      setCancellingId(null);
    }
  }

  if (!ready) return <PageLoader label="Loading your rides…" />;

  return (
    <AppShell>
      <div className="rides">
        <PageHeader
          title="My rides"
          description="Track your ride requests and matched groups."
          action={
            <Link to="/join" className="btn btn-lime btn-lg">
              <PlusCircle /> Join a ride
            </Link>
          }
        />

        {error ? (
          <div role="alert" aria-live="polite" className="alert alert-row">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void loadRides(true)}>
              Try again
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="ride-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <EmptyState
            icon={<MapPinOff size={24} />}
            title="No rides yet"
            description="Join a ride to get matched with two other commuters headed your way."
            action={
              <Link to="/join" className="btn btn-lime btn-lg">
                Join a ride
              </Link>
            }
          />
        ) : (
          <div className="ride-grid">
            {rides.map((ride) => {
              const clickable =
                (ride.status === "MATCHED" || ride.status === "IN_PROGRESS") && Boolean(ride.groupId);
              const cardBody = (
                <>
                  <div className="ride-card-top">
                    <h3>
                      {ride.pickupHub} → {ride.destination}
                    </h3>
                    <StatusBadge status={ride.status} />
                  </div>
                  <dl className="ride-dl">
                    <div>
                      <dt>Pickup hub</dt>
                      <dd>{ride.pickupHub}</dd>
                    </div>
                    <div>
                      <dt>Destination</dt>
                      <dd>{ride.destination}</dd>
                    </div>
                    <div className="span-2">
                      <dt>Requested</dt>
                      <dd>{formatDate(ride.createdAt)}</dd>
                    </div>
                  </dl>
                  {clickable ? (
                    <span className="lobby-link">
                      Open group lobby <ArrowUpRight size={14} />
                    </span>
                  ) : null}
                </>
              );

              if (clickable) {
                return (
                  <Link key={ride.id} to={`/rides/${ride.groupId}`} className="hover-lift surface ride-card">
                    {cardBody}
                  </Link>
                );
              }

              return (
                <article key={ride.id} className="surface ride-card">
                  {cardBody}
                  {ride.status === "WAITING" ? (
                    <Button
                      variant="outline"
                      disabled={cancellingId === ride.id}
                      onClick={() => void handleCancel(ride.id)}
                    >
                      {cancellingId === ride.id ? "Cancelling…" : "Cancel ride"}
                    </Button>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
