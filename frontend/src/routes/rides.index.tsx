import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PlusCircle, MapPinOff, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/SectionHeading";
import { EmptyState, PageLoader, SkeletonCard, StatusBadge } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { getMyRides, cancelRide, apiErrorMessage, type Ride } from "@/lib/api";
import { createMatchClient } from "@/lib/websocket";
import { useRequireAuth } from "@/hooks/use-require-auth";
import type { Client } from "@stomp/stompjs";

export const Route = createFileRoute("/rides/")({
  head: () => ({
    meta: [
      { title: "My rides — one23" },
      { name: "description", content: "Track your ride requests and matched groups." },
    ],
    links: [{ rel: "canonical", href: "/rides" }],
  }),
  component: MyRides,
});

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-IN");
}

function MyRides() {
  const { ready } = useRequireAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Client | null>(null);

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

  async function loadRides(showSpinner: boolean) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function handleCancel(rideId: number) {
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
      <div className="space-y-7">
        <PageHeader
          title="My rides"
          description="Track your ride requests and matched groups."
          action={
            <Button asChild variant="lime" size="lg">
              <Link to="/join">
                <PlusCircle /> Join a ride
              </Link>
            </Button>
          }
        />

        {error ? (
          <div
            role="alert"
            aria-live="polite"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void loadRides(true)}>
              Try again
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <EmptyState
            icon={<MapPinOff className="h-6 w-6" />}
            title="No rides yet"
            description="Join a ride to get matched with two other commuters headed your way."
            action={
              <Button asChild variant="lime" size="lg">
                <Link to="/join">Join a ride</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rides.map((ride) => {
              const clickable =
                (ride.status === "MATCHED" || ride.status === "IN_PROGRESS") &&
                Boolean(ride.groupId);
              const cardBody = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold leading-snug">
                      {ride.pickupHub} → {ride.destination}
                    </h3>
                    <StatusBadge status={ride.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Pickup hub</dt>
                      <dd className="mt-0.5 font-medium">{ride.pickupHub}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Destination</dt>
                      <dd className="mt-0.5 font-medium">{ride.destination}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">Requested</dt>
                      <dd className="mt-0.5 font-medium">{formatDate(ride.createdAt)}</dd>
                    </div>
                  </dl>
                  {clickable ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      Open group lobby <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </>
              );

              if (clickable) {
                return (
                  <Link
                    key={ride.id}
                    to="/rides/$groupId"
                    params={{ groupId: ride.groupId! }}
                    className="hover-lift surface flex flex-col gap-4 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {cardBody}
                  </Link>
                );
              }

              return (
                <article key={ride.id} className="surface flex flex-col gap-4 p-6">
                  {cardBody}
                  {ride.status === "WAITING" ? (
                    <Button
                      variant="outline"
                      size="default"
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
