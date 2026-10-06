import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Target } from "../components/Icons";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/SectionHeading";
import { Chip, PageLoader } from "../components/primitives";
import { Button } from "../components/Button";
import { joinRide, apiErrorMessage } from "../lib/api";
import { PICKUP_HUBS, DESTINATIONS } from "../lib/locations";
import { useRequireAuth } from "../hooks/useRequireAuth";

export function JoinPage() {
  const { ready } = useRequireAuth();
  const [pickupHub, setPickupHub] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  if (!ready) return <PageLoader label="Loading…" />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await joinRide({ pickupHub, destination });
      const matchedGroupId = Array.isArray(result) ? result[0]?.groupId : null;

      if (matchedGroupId) {
        setSuccess("You're matched! Redirecting to your group lobby…");
        redirectTimerRef.current = setTimeout(() => {
          navigate(`/rides/${matchedGroupId}`);
        }, 1200);
      } else {
        setSuccess("Ride joined — redirecting to My Rides…");
        redirectTimerRef.current = setTimeout(() => {
          navigate("/rides");
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
      <div className="join">
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ width: "fit-content" }}>
          <ArrowLeft /> Back
        </Link>

        <PageHeader
          title="Where to?"
          description="Pick a pickup hub and destination. We'll group you with two other riders headed the same way."
        />

        <div className="surface join-card">
          {error ? (
            <p role="alert" aria-live="polite" className="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" aria-live="polite" className="alert alert-success">
              {success}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="join-form">
            <div className="field" style={{ gap: "0.75rem" }}>
              <label htmlFor="pickupHub" className="label-row">
                <MapPin size={16} /> Pickup hub
              </label>
              <select
                id="pickupHub"
                required
                value={pickupHub}
                onChange={(e) => setPickupHub(e.target.value)}
                className="select"
              >
                <option value="">Select pickup hub</option>
                {PICKUP_HUBS.map((hub) => (
                  <option key={hub} value={hub}>
                    {hub}
                  </option>
                ))}
              </select>
              <div className="chip-row">
                {PICKUP_HUBS.slice(0, 5).map((hub) => (
                  <Chip key={hub} active={pickupHub === hub} onClick={() => setPickupHub(hub)}>
                    {hub}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="field" style={{ gap: "0.75rem" }}>
              <label htmlFor="destination" className="label-row">
                <Target size={16} /> Destination
              </label>
              <select
                id="destination"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="select"
              >
                <option value="">Select destination</option>
                {DESTINATIONS.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
              <div className="chip-row">
                {DESTINATIONS.slice(0, 5).map((dest) => (
                  <Chip key={dest} active={destination === dest} onClick={() => setDestination(dest)}>
                    {dest}
                  </Chip>
                ))}
              </div>
            </div>

            <Button type="submit" variant="lime" size="xl" className="btn-full" disabled={!canSubmit}>
              {loading ? "Joining…" : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
