import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { getMyRides } from "../services/api";

/**
 * Dashboard Page
 *
 * Main hub after login — shows a welcome message, quick actions
 * (Join Ride / My Rides), and a snapshot of the user's ride activity.
 * No dedicated backend endpoint here beyond /api/my-rides, which is
 * reused to build the small stats row.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getMyRides()
      .then((rides) => {
        if (!isMounted) return;
        const active = rides.filter((r) => r.status === "WAITING" || r.status === "MATCHED" || r.status === "IN_PROGRESS").length;
        const completed = rides.filter((r) => r.status === "COMPLETED").length;
        setStats({ total: rides.length, active, completed });

        const mostRecentActive = rides.find(
          (r) => r.status === "WAITING" || r.status === "MATCHED" || r.status === "IN_PROGRESS"
        );
        setActiveRide(mostRecentActive || null);
      })
      .catch(() => {
        /* Dashboard stats are best-effort — silently ignore failures here */
      })
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = (userName || "there").split(" ")[0];

  // Bento tiles are divs acting as buttons (they need free-form content,
  // not just a label), so — unlike a real <button> — they need an
  // explicit key handler for Enter/Space to be keyboard-operable.
  const onActivateKey = (handler) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };

  return (
    <AppShell title="Dashboard">
      <div className="app-content animate-in">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              Hey {firstName} <span className="welcome-wave">👋</span>
            </h1>
            <p className="page-lede">Where are you headed today?</p>
          </div>
        </div>

        <div className="bento-grid stagger-children">
          {/* Quick action — Join a Ride */}
          <div
            className="bento-tile bento-tile--accent bento-tile--col-2 bento-tile--clickable"
            onClick={() => navigate("/join")}
            onKeyDown={onActivateKey(() => navigate("/join"))}
            role="button"
            tabIndex={0}
          >
            <div className="tile-icon">
              <Icon name="car" size={22} strokeWidth={1.9} />
            </div>
            <span className="tile-title">Join a Ride</span>
            <p className="tile-body">
              Pick your pickup hub and destination — we'll match you with two
              other commuters.
            </p>
            <span className="tile-go">
              Get started
              <Icon name="arrowRight" size={14} strokeWidth={2.4} />
            </span>
          </div>

          {/* Quick action — My Rides */}
          <div
            className="bento-tile bento-tile--white bento-tile--col-2 bento-tile--clickable"
            onClick={() => navigate("/my-rides")}
            onKeyDown={onActivateKey(() => navigate("/my-rides"))}
            role="button"
            tabIndex={0}
          >
            <div className="tile-icon">
              <Icon name="clipboard" size={22} strokeWidth={1.9} />
            </div>
            <span className="tile-title">My Rides</span>
            <p className="tile-body">
              View ride history, track live status, and jump back into a
              matched group.
            </p>
            <span className="tile-go">
              View rides
              <Icon name="arrowRight" size={14} strokeWidth={2.4} />
            </span>
          </div>

          {/* Stats tile */}
          <div className="bento-tile bento-tile--dark bento-tile--col-2">
            <span className="tile-eyebrow">Your activity</span>
            {loadingStats ? (
              <div className="loading loading--inline">
                <span className="btn-spinner btn-spinner--muted" />
                Loading stats...
              </div>
            ) : (
              <div className="tile-stat-row">
                <div className="tile-stat">
                  <strong>{stats.total}</strong>
                  <span>Total rides</span>
                </div>
                <div className="tile-stat">
                  <strong>{stats.active}</strong>
                  <span>Active / waiting</span>
                </div>
                <div className="tile-stat">
                  <strong>{stats.completed}</strong>
                  <span>Completed</span>
                </div>
              </div>
            )}
          </div>

          {/* Active ride preview, if any */}
          {activeRide && (
            <div
              className="bento-tile bento-tile--white bento-tile--col-2 bento-tile--clickable ticket-preview-tile"
              onClick={() =>
                activeRide.status === "MATCHED" && activeRide.groupId
                  ? navigate(`/group-lobby/${activeRide.groupId}`)
                  : navigate("/my-rides")
              }
              onKeyDown={onActivateKey(() =>
                activeRide.status === "MATCHED" && activeRide.groupId
                  ? navigate(`/group-lobby/${activeRide.groupId}`)
                  : navigate("/my-rides")
              )}
              role="button"
              tabIndex={0}
            >
              <div className="ticket-preview-tile__row">
                <div className="ticket-preview-tile__lead">
                  <div className="tile-icon ticket-preview-tile__icon">
                    <Icon name="map" size={19} strokeWidth={1.9} />
                  </div>
                  <div>
                    <strong className="ticket-preview-tile__title">
                      {activeRide.pickupHub} → {activeRide.destination}
                    </strong>
                    <span className="ticket-preview-tile__subtitle">Your most recent request</span>
                  </div>
                </div>
                <span className={`status-badge status-${activeRide.status?.toLowerCase()}`}>
                  {activeRide.status}
                </span>
              </div>
              <span className="tile-go">
                {activeRide.status === "MATCHED" ? "Open group lobby" : "View in My Rides"}
                <Icon name="arrowRight" size={14} strokeWidth={2.4} />
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;
