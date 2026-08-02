import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { getMyRides, cancelRide } from "../services/api";
import { createMatchClient } from "../websocket/stompClient";

const ACTIVE_STATUSES = ["WAITING", "MATCHED", "IN_PROGRESS"];

/**
 * My Rides Page
 *
 * Backend API: GET /api/my-rides
 * Authorization: Bearer Token (automatically attached by Axios)
 *
 * Features:
 * - Display all rides with pickup hub, destination, status, and created time
 * - Cancel Ride button for rides with WAITING status
 * - Live updates via WebSocket (falls back to polling if the socket drops)
 *
 * Cancel Ride API: PATCH /api/rides/{id}/cancel
 */
function MyRides() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("active");
  // Shows a brief toast when we land here because a group was dissolved
  // (see GroupLobby.jsx) — cleared automatically after a couple seconds.
  const [toastMessage, setToastMessage] = useState(location.state?.message || "");
  // Tracks which ride is currently being cancelled so we can disable just
  // that button (and show "Cancelling...") instead of the whole page —
  // this also stops a fast double-click from firing the cancel twice.
  const [cancellingId, setCancellingId] = useState(null);
  const pollTimerRef = useRef(null);
  const socketClientRef = useRef(null);
  const redirectGuardRef = useRef(false);

  const navigateToGroupLobby = (rideList) => {
    if (redirectGuardRef.current) {
      return;
    }

    const matchedRide = rideList.find(
      (ride) => ride.status === "MATCHED" && ride.groupId
    );

    if (!matchedRide) {
      return;
    }

    redirectGuardRef.current = true;
    navigate(`/group-lobby/${matchedRide.groupId}`, {
      replace: true,
      state: {
        message: "Ride status updated to MATCHED."
      }
    });
  };

  const loadRides = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await getMyRides();
      setRides(data);
      setError("");
      navigateToGroupLobby(data);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load rides. Please try again."
      );
      return false;
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const startPolling = () => {
    if (pollTimerRef.current) {
      return;
    }

    pollTimerRef.current = setInterval(() => {
      loadRides(false);
    }, 5000);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadRides(true);

    const client = createMatchClient({
      onConnect: () => {
        if (!isMounted) return;
        stopPolling();
      },
      onMatch: () => {
        if (!isMounted) return;
        loadRides(false);
      },
      onError: () => {
        if (!isMounted) return;
        startPolling();
      }
    });

    socketClientRef.current = client;
    client.activate();

    return () => {
      isMounted = false;
      stopPolling();

      if (socketClientRef.current) {
        socketClientRef.current.deactivate();
        socketClientRef.current = null;
      }
    };
  }, []);

  // Auto-hide the toast after a couple seconds
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  const handleCancelRide = async (rideId) => {
    if (cancellingId) {
      // A cancel request is already in flight — ignore extra clicks.
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this ride?")) {
      return;
    }

    setError("");
    setCancellingId(rideId);

    try {
      await cancelRide(rideId);
      await loadRides(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to cancel ride. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING": return "status-waiting";
      case "MATCHED": return "status-matched";
      case "CANCELLED": return "status-cancelled";
      case "IN_PROGRESS": return "status-in_progress";
      case "COMPLETED": return "status-completed";
      default: return "status-default";
    }
  };

  const { activeRides, pastRides } = useMemo(() => {
    const active = [];
    const past = [];
    rides.forEach((ride) => {
      if (ACTIVE_STATUSES.includes(ride.status)) {
        active.push(ride);
      } else {
        past.push(ride);
      }
    });
    return { activeRides: active, pastRides: past };
  }, [rides]);

  const visibleRides = tab === "active" ? activeRides : pastRides;

  return (
    <AppShell title="My Rides" onBack={() => navigate("/dashboard")}>
      {toastMessage && (
        <div className="toast-overlay" role="alert" aria-live="polite">
          <div className="toast-card">
            <div className="toast-icon">
              <Icon name="bell" size={15} strokeWidth={2} />
            </div>
            <div>
              <h3>Group Update</h3>
              <p>{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="app-content animate-in">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Rides</h1>
            <p className="page-lede">Track your ride requests and matched groups.</p>
          </div>

          <div className="segmented segmented--dark">
            <button
              type="button"
              className={`segmented__btn ${tab === "active" ? "active" : ""}`}
              onClick={() => setTab("active")}
            >
              Active ({activeRides.length})
            </button>
            <button
              type="button"
              className={`segmented__btn ${tab === "past" ? "active" : ""}`}
              onClick={() => setTab("past")}
            >
              Past ({pastRides.length})
            </button>
          </div>
        </div>

        {error && <div className="error-message--dark">{error}</div>}

        {loading ? (
          <div className="loading">
            <span className="btn-spinner btn-spinner--muted" />
            Loading rides...
          </div>
        ) : visibleRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <Icon name="car" size={26} strokeWidth={1.7} />
            </div>
            <p>
              {tab === "active"
                ? "No active rides. Join a ride to get started!"
                : "No past rides yet."}
            </p>
            {tab === "active" && (
              <button className="btn-primary" onClick={() => navigate("/join")}>
                Join a Ride
              </button>
            )}
          </div>
        ) : (
          <div className="ticket-list">
            {visibleRides.map((ride) => {
              const clickable = ride.status === "MATCHED" && ride.groupId;
              return (
                <div
                  key={ride.id}
                  className={`ticket-card ${clickable ? "ticket-card--clickable" : ""}`}
                  onClick={clickable ? () => navigate(`/group-lobby/${ride.groupId}`) : undefined}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/group-lobby/${ride.groupId}`);
                          }
                        }
                      : undefined
                  }
                >
                  <div className="ticket-card__icon">
                    <Icon name="car" size={22} strokeWidth={1.9} />
                  </div>

                  <div className="ticket-card__body">
                    <div className="ticket-card__top">
                      <span className="ticket-card__route">
                        {ride.pickupHub} → {ride.destination}
                      </span>
                      <span className={`status-badge ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>

                    <div className="ticket-card__meta">
                      <span><strong>{ride.pickupHub}</strong> pickup</span>
                      <span><strong>{ride.destination}</strong> destination</span>
                      <span>Requested {formatDate(ride.createdAt)}</span>
                    </div>

                    <div className="ticket-card__actions">
                      {clickable && (
                        <span className="tile-go">
                          Open group lobby
                          <Icon name="chevronRight" size={15} strokeWidth={2.2} />
                        </span>
                      )}

                      {ride.status === "WAITING" && (
                        <button
                          className="btn-cancel"
                          disabled={cancellingId === ride.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRide(ride.id);
                          }}
                        >
                          {cancellingId === ride.id ? "Cancelling..." : "Cancel Ride"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default MyRides;
