import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import Icon from "../components/Icon";

/**
 * Login Page
 *
 * Backend API: POST /api/auth/login
 * Request Body: { email, password }
 * Response: { message, token, fullName, email }
 *
 * After successful login:
 * - Saves JWT token to sessionStorage
 * - Saves user name to sessionStorage
 * - Redirects to Dashboard
 */
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);

      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("userName", response.fullName);
      sessionStorage.setItem("userEmail", response.email);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-auth">
      <div className="split-auth__brand">
        <div className="split-auth__brand-photo" aria-hidden="true" />
        <div className="split-auth__brand-overlay" aria-hidden="true" />
        <div className="split-auth__glow" />
        <div className="split-auth__brandmark">
          <span className="split-auth__logomark">23</span>
          one23
        </div>
        <div className="split-auth__copy">
          <h1>
            Welcome back to <span>quick-split</span> rides.
          </h1>
          <p>
            Sign in to see your matched groups, chat with your riders, and
            track your ride status live.
          </p>
          <div className="split-auth__stats">
            <div className="tile-stat">
              <strong>3</strong>
              <span>Riders per group</span>
            </div>
            <div className="tile-stat">
              <strong>Live</strong>
              <span>Group chat &amp; map</span>
            </div>
            <div className="tile-stat">
              <strong>Real-time</strong>
              <span>Match notifications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="split-auth__panel">
        <div className="split-auth__form-wrap">
          <Link to="/" className="split-auth__back">
            <Icon name="arrowLeft" size={14} strokeWidth={2.2} />
            Back to one23
          </Link>

          <h1 className="auth-title">Welcome back</h1>
          <h2 className="auth-subtitle">Login to find your ride group</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{" "}
            <button className="btn-link" onClick={() => navigate("/signup")}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
