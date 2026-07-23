import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { joinRide } from "../services/api";

const PICKUP_HUBS = ["Kadugodi Metro", "Whitefield", "Hoodi", "Hope Farm", "KR Puram"];
const DESTINATIONS = ["Tech Park", "MVJ College", "ITPL", "Phoenix Mall", "Prestige Lakeside"];

/**
 * Join Ride Page — "Where to?" style trip request sheet.
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const selectChip = (field, value) => {
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

  return (
    <div className="page-container map-grid-bg">
      <div className="bg-glow bg-glow--left" />
      <div className="bg-glow bg-glow--right" />

      <Navbar />

      <div className="page-header">
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
      </div>

      <div className="form-container">
        {/* Dark "map" style preview strip, echoes the pickup → destination route */}
        <div className="hub-preview">
          <span className="hub-preview__label">Trip preview</span>
          <div className="hub-preview__route">
            <span className="hub-preview__pin hub-preview__pin--start">📍</span>
            <span className="hub-preview__line" />
            <span className="hub-preview__pin hub-preview__pin--end">🎯</span>
          </div>
        </div>

        <div className="sheet-card">
          <h1 className="form-title" style={{ color: "var(--text)" }}>Where to?</h1>
          <p style={{ margin: "0 0 22px", color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Pick a pickup hub and destination. We'll group you with two other
            riders headed the same way.
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="pickupHub">Pickup hub</label>
              <div className="field-icon-select">
                <span className="field-icon-select__icon">📍</span>
                <select
                  id="pickupHub"
                  name="pickupHub"
                  value={formData.pickupHub}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select pickup hub</option>
                  {PICKUP_HUBS.map((hub) => (
                    <option key={hub} value={hub}>{hub}</option>
                  ))}
                </select>
              </div>
              <div className="chip-row">
                {PICKUP_HUBS.slice(0, 4).map((hub) => (
                  <button
                    type="button"
                    key={hub}
                    className={`chip ${formData.pickupHub === hub ? "active" : ""}`}
                    onClick={() => selectChip("pickupHub", hub)}
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <div className="field-icon-select">
                <span className="field-icon-select__icon">🎯</span>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select destination</option>
                  {DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
              <div className="chip-row">
                {DESTINATIONS.slice(0, 4).map((dest) => (
                  <button
                    type="button"
                    key={dest}
                    className={`chip ${formData.destination === dest ? "active" : ""}`}
                    onClick={() => selectChip("destination", dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Joining...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinRide;
