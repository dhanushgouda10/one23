import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, MapPin, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/SectionHeading";
import { Chip, PageLoader } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { joinRide, apiErrorMessage } from "@/lib/api";
import { PICKUP_HUBS, DESTINATIONS } from "@/lib/locations";
import { useRequireAuth } from "@/hooks/use-require-auth";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join a ride — one23" },
      {
        name: "description",
        content:
          "Pick a pickup hub and destination in Bengaluru and get matched with two other commuters.",
      },
    ],
    links: [{ rel: "canonical", href: "/join" }],
  }),
  component: JoinRidePage,
});

function JoinRidePage() {
  const { ready } = useRequireAuth();
  const [pickupHub, setPickupHub] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = Route.useNavigate();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the post-join redirect timer if the user navigates away (or the
  // component otherwise unmounts) before it fires.
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  if (!ready) return <PageLoader label="Loading…" />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await joinRide({ pickupHub, destination });

      // BUG FIX: the response was previously discarded entirely, so the
      // rider whose /api/join call actually completed a match (backend
      // returns RideResponse[] — see RideController.createRide) was always
      // sent to the plain "My rides" list instead of straight into their
      // new Group Lobby. A single RideResponse means still WAITING for two
      // more riders on the same route; an array means this request was the
      // one that completed the group.
      const matchedGroupId = Array.isArray(result) ? result[0]?.groupId : null;

      if (matchedGroupId) {
        setSuccess("You're matched! Redirecting to your group lobby…");
        redirectTimerRef.current = setTimeout(() => {
          void navigate({ to: "/rides/$groupId", params: { groupId: matchedGroupId } });
        }, 1200);
      } else {
        setSuccess("Ride joined — redirecting to My Rides…");
        redirectTimerRef.current = setTimeout(() => {
          void navigate({ to: "/rides" });
        }, 1200);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to join ride."));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = Boolean(pickupHub && destination) && !loading;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft /> Back
          </Link>
        </Button>

        <PageHeader
          title="Where to?"
          description="Pick a pickup hub and destination. We'll group you with two other riders headed the same way."
        />

        <div className="surface space-y-7 p-6 sm:p-8">
          {error ? (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-lime/40 bg-lime-soft px-4 py-3 text-sm text-accent-foreground"
            >
              {success}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-3">
              <Label htmlFor="pickupHub" className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" /> Pickup hub
              </Label>
              <select
                id="pickupHub"
                required
                value={pickupHub}
                onChange={(e) => setPickupHub(e.target.value)}
                className="h-14 w-full rounded-2xl border border-border bg-card px-4 text-base"
              >
                <option value="">Select pickup hub</option>
                {PICKUP_HUBS.map((hub) => (
                  <option key={hub} value={hub}>
                    {hub}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {PICKUP_HUBS.slice(0, 5).map((hub) => (
                  <Chip key={hub} active={pickupHub === hub} onClick={() => setPickupHub(hub)}>
                    {hub}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="destination" className="flex items-center gap-1.5 text-sm">
                <Target className="h-4 w-4" /> Destination
              </Label>
              <select
                id="destination"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-14 w-full rounded-2xl border border-border bg-card px-4 text-base"
              >
                <option value="">Select destination</option>
                {DESTINATIONS.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                {DESTINATIONS.slice(0, 5).map((dest) => (
                  <Chip
                    key={dest}
                    active={destination === dest}
                    onClick={() => setDestination(dest)}
                  >
                    {dest}
                  </Chip>
                ))}
              </div>
            </div>

            <Button type="submit" variant="lime" size="xl" className="w-full" disabled={!canSubmit}>
              {loading ? "Joining…" : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
