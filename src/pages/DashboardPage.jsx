import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/primitives";
import { ArrowRight } from "../components/Icons";
import { getMyRides } from "../lib/api";
import { getUserName } from "../lib/session";

// A ride is "current" while it is waiting, matched or in progress
const CURRENT_STATUSES = ["WAITING", "MATCHED", "IN_PROGRESS"];

// Home page after login: shows your current ride (if any) and quick links.
export function DashboardPage() {
  const firstName = (getUserName() || "there").split(" ")[0];
  const [currentRide, setCurrentRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load my rides once and pick the open one (a user can have only one open ride)
  useEffect(() => {
    getMyRides()
      .then((rides) => {
        const openRide = rides.find((ride) => CURRENT_STATUSES.includes(ride.status));
        setCurrentRide(openRide || null);
      })
      .catch(() => setCurrentRide(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader title={`Hi, ${firstName}`} description="Going to the office today?" />

      <section className="card current-ride">
        <p className="label">Current ride</p>
        {isLoading ? (
          <p className="hint">Loading…</p>
        ) : currentRide ? (
          <CurrentRide ride={currentRide} />
        ) : (
          <>
            <p>You don't have an active ride.</p>
            <Link to="/join" className="btn btn-lime">
              Join a ride <ArrowRight />
            </Link>
          </>
        )}
      </section>

      <div className="grid-2">
        <Link to="/join" className="card card-link">
          <h3>Join a ride</h3>
          <p>Pick your metro station and office. We'll find 2 people going the same way.</p>
        </Link>
        <Link to="/rides" className="card card-link">
          <h3>My rides</h3>
          <p>See your requests, groups and past rides.</p>
        </Link>
      </div>
    </AppShell>
  );
}

// The "current ride" box: route, status and where to go next
function CurrentRide({ ride }) {
  const hasGroup = ride.status !== "WAITING" && ride.groupId;
  return (
    <>
      <div className="row-between">
        <h3>
          {ride.pickupHub} → {ride.destination}
        </h3>
        <StatusBadge status={ride.status} />
      </div>
      {hasGroup ? (
        <Link to={`/rides/${ride.groupId}`} className="btn btn-lime">
          Open group lobby <ArrowRight />
        </Link>
      ) : (
        <>
          <p className="hint">Waiting for others on this route to make a group of 3…</p>
          <Link to="/rides" className="btn btn-outline">
            View in My rides
          </Link>
        </>
      )}
    </>
  );
}
