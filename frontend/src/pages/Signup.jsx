import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";

/**
 * Signup Page
 *
 * Backend API: POST /api/auth/signup
 * Request Body: { fullName, email, password }
 * Response: { message }
 *
 * After successful signup, redirects to Login page.
 */
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const extractSignupError = (err) => {
    const responseData = err.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData?.fieldErrors && typeof responseData.fieldErrors === "object") {
      const firstFieldError = Object.values(responseData.fieldErrors).find(Boolean);
      if (firstFieldError) {
        return firstFieldError;
      }
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (err.response?.status) {
      return `Signup failed (${err.response.status}). Please try again.`;
    }

    if (err.request) {
      return "Cannot reach the server. Please make sure the backend is running.";
    }

    return err.message || "Signup failed. Please try again.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await signup(formData);
      navigate("/login");
    } catch (err) {
      const responseData = err.response?.data || {};
      const validationErrors = responseData.fieldErrors || {};
      const message = extractSignupError(err);

      const nextFieldErrors = { ...validationErrors };

      if (message.toLowerCase().includes("email already registered")) {
        nextFieldErrors.email = "Email already registered";
      }

      if (message.toLowerCase().includes("full name is required")) {
        nextFieldErrors.fullName = "Full name is required";
      }

      if (message.toLowerCase().includes("email should be valid")) {
        nextFieldErrors.email = "Email should be valid";
      }

      if (message.toLowerCase().includes("password")) {
        nextFieldErrors.password = nextFieldErrors.password || message;
      }

      setFieldErrors(nextFieldErrors);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container map-grid-bg">
      <div className="bg-glow bg-glow--left" />
      <div className="bg-glow bg-glow--right" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link to="/" className="auth-back-home">
          ← Back to one23
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <h2 className="auth-subtitle">Join a hub and get matched in minutes</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={fieldErrors.fullName ? "input-error" : ""}
                required
              />
              {fieldErrors.fullName && <small className="form-hint form-hint-error">{fieldErrors.fullName}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={fieldErrors.email ? "input-error" : ""}
                required
              />
              {fieldErrors.email && <small className="form-hint form-hint-error">{fieldErrors.email}</small>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={fieldErrors.password ? "input-error" : ""}
                minLength="8"
                required
              />
              {fieldErrors.password ? (
                <small className="form-hint form-hint-error">{fieldErrors.password}</small>
              ) : (
                <small className="form-hint">Password must be at least 8 characters.</small>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <button className="btn-link" onClick={() => navigate("/login")}>
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
