import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

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
    <div className="auth-container map-grid-bg">
      <div className="bg-glow bg-glow--left" />
      <div className="bg-glow bg-glow--right" />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link to="/" className="auth-back-home">
          ← Back to one23
        </Link>

        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <h2 className="auth-subtitle">Login to find your ride group</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
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

            <div className="form-group">
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
