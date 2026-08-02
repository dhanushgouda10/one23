import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { joinRide } from "../services/api";

const PICKUP_HUBS = ["Kadugodi Metro", "Whitefield", "Hoodi", "Hope Farm", "KR Puram"];
const DESTINATIONS = ["Tech Park", "MVJ College", "ITPL", "Phoenix Mall", "Prestige Lakeside"];

/**
 * Join Ride Page — a trip-preview panel next to a floating reserve
 * sheet, echoing a device-mock "reserve" flow rather than a plain form.
 *
 * Backend API: POST /api/join
 * Authorization: Bearer Token (automatically attached by Axios)
 * Request Body: { pickupHub, destination }
 */
function JoinRide() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupHub: "",
    destination: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const selectField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await joinRide(formData);

      setSuccess("Ride successfully joined! Redirecting to My Rides...");

      setTimeout(() => {
        navigate("/my-rides");
      }, 1600);
    } catch (err) {
      console.error(err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to join ride.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = formData.pickupHub && formData.destination;

  return (
    <AppShell title="Join a Ride" onBack={() => navigate("/dashboard")}>
      <div className="app-content animate-in">
        <div className="reserve-layout">
          {/* Trip preview */}
          <div className="phone-mock" style={{ maxWidth: "none" }}>
            <div className="phone-mock__notch" />
            <div className="phone-mock__screen">
              <div className="phone-mock__map-dots" />
              <div className="phone-mock__status">
                <span className="phone-mock__status-pill">
                  <Icon name="map" size={11} strokeWidth={2.4} />
                  Trip preview
                </span>
              </div>

              <div
                className="phone-mock__pin phone-mock__pin--you"
                style={{ top: "30%", left: "30%" }}
                title={formData.pickupHub || "Pickup hub"}
              >
                <Icon name="pin" size={14} strokeWidth={2.2} />
              </div>
              <div
                className="phone-mock__pin phone-mock__pin--rider"
                style={{ top: "58%", left: "66%" }}
                title={formData.destination || "Destination"}
              >
                <Icon name="target" size={14} strokeWidth={2.2} />
              </div>

              <div className="phone-mock__sheet">
                <div className="phone-mock__greeting">
                  {isComplete ? "Group of 3 forming" : "Choose hub & destination"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Pickup</span>
                    <strong>{formData.pickupHub || "—"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Destination</span>
                    <strong>{formData.destination || "—"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reserve sheet */}
          <div className="reserve-sheet">
            <h1 className="page-title page-title--on-light" style={{ marginBottom: 6 }}>
              Where to?
            </h1>
            <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: "0.92rem" }}>
              Pick a pickup hub and destination. We'll group you with two other
              riders headed the same way.
            </p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="reserve-sheet__field">
                <span className="reserve-sheet__label">
                  <Icon name="pin" size={14} strokeWidth={2.2} />
                  Pickup hub
                </span>
                <div className="chip-row">
                  {PICKUP_HUBS.map((hub) => (
                    <button
                      type="button"
                      key={hub}
                      className={`chip ${formData.pickupHub === hub ? "active" : ""}`}
                      onClick={() => selectField("pickupHub", hub)}
                    >
                      {hub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reserve-sheet__field">
                <span className="reserve-sheet__label">
                  <Icon name="target" size={14} strokeWidth={2.2} />
                  Destination
                </span>
                <div className="chip-row">
                  {DESTINATIONS.map((dest) => (
                    <button
                      type="button"
                      key={dest}
                      className={`chip ${formData.destination === dest ? "active" : ""}`}
                      onClick={() => selectField("destination", dest)}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reserve-sheet__actions">
                <button type="submit" className="btn-primary" disabled={loading || !isComplete}>
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Continue
                      <Icon name="arrowRight" size={16} strokeWidth={2.2} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default JoinRide;
