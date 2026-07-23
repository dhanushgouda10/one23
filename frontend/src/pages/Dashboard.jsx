import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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

  return (
    <div className="dashboard-container map-grid-bg">
      <div className="bg-glow bg-glow--left" />
      <div className="bg-glow bg-glow--right" />

      <Navbar />

      <div className="dashboard-content">
        <h2 className="welcome-message">Hey {firstName} 👋</h2>
        <p className="welcome-sub">Where are you headed today?</p>

        {!loadingStats && stats.total > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <strong>{stats.total}</strong>
              <span>Total rides</span>
            </div>
            <div className="stat-card">
              <strong>{stats.active}</strong>
              <span>Active / waiting</span>
            </div>
            <div className="stat-card">
              <strong>{stats.completed}</strong>
              <span>Completed</span>
            </div>
          </div>
        )}

        <div className="dashboard-cards">
          <div
            className="dashboard-card dashboard-card--accent"
            onClick={() => navigate("/join")}
            role="button"
            tabIndex={0}
          >
            <div className="card-icon">🚗</div>
            <h3>Join a Ride</h3>
            <p>Pick your pickup hub and destination — we'll match you with two other commuters.</p>
            <span className="card-go">Get started →</span>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/my-rides")}
            role="button"
            tabIndex={0}
          >
            <div className="card-icon">📋</div>
            <h3>My Rides</h3>
            <p>View ride history, track live status, and jump back into a matched group.</p>
            <span className="card-go">View rides →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
