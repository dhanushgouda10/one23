import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, List, ArrowUpRight } from "../components/Icons";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/SectionHeading";
import { getMyRides } from "../lib/api";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { PageLoader } from "../components/primitives";

export function DashboardPage() {
  const { ready, userName } = useRequireAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let isMounted = true;
    getMyRides()
      .then((data) => {
        if (isMounted) setRides(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [ready]);

  if (!ready) return <PageLoader label="Loading your dashboard…" />;

  const firstName = (userName || "there").split(" ")[0];
  const active = rides.filter(
    (ride) => ride.status === "WAITING" || ride.status === "MATCHED" || ride.status === "IN_PROGRESS",
  ).length;
  const completed = rides.filter((ride) => ride.status === "COMPLETED").length;

  return (
    <AppShell>
      <div className="dash">
        <PageHeader title={`${greeting()}, ${firstName}`} description="Where are you headed today?" />

        {!loading && rides.length > 0 ? (
          <div className="stat-grid">
            <div className="stat-card">
              <p className="n">{rides.length}</p>
              <p className="l">Total rides</p>
            </div>
            <div className="stat-card">
              <p className="n">{active}</p>
              <p className="l">Active</p>
            </div>
            <div className="stat-card">
              <p className="n">{completed}</p>
              <p className="l">Completed</p>
            </div>
          </div>
        ) : null}

        <div className="action-grid">
          <Link to="/join" className="hover-lift surface action-card">
            <span className="action-ico lime">
              <PlusCircle size={22} />
            </span>
            <h2>Join a ride</h2>
            <p>
              Pick your pickup hub and destination — we'll match you with two other commuters headed the
              same way.
            </p>
            <span className="action-cta">
              Get started <ArrowUpRight size={16} className="nudge" />
            </span>
          </Link>

          <Link to="/rides" className="hover-lift surface action-card">
            <span className="action-ico muted">
              <List size={22} />
            </span>
            <h2>My rides</h2>
            <p>View ride history, track live status, and jump back into a matched group's lobby.</p>
            <span className="action-cta">
              View rides <ArrowUpRight size={16} className="nudge" />
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
