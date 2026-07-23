import { Link, useLocation, useNavigate } from "react-router-dom";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Navbar({ landing = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const userName = sessionStorage.getItem("userName");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  };

  if (landing) {
    return (
      <header className="landing-nav">
        <Link to="/" className="landing-logo">
          one23
        </Link>
        <nav className="landing-nav-links">
          <Link to="/" className="landing-nav-link active">
            Home
          </Link>
          <a href="#benefits" className="landing-nav-link">
            Benefits
          </a>
          <a href="#how-it-works" className="landing-nav-link">
            How it works
          </a>
        </nav>
        {token ? (
          <Link to="/dashboard" className="landing-cta-btn">
            Dashboard
          </Link>
        ) : (
          <Link to="/login" className="landing-cta-btn">
            Login
          </Link>
        )}
      </header>
    );
  }

  return (
    <header className="navbar-wrap">
      <div className="navbar">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">23</span>
          <span className="brand-text">
            one23
            <small>Ride together</small>
          </span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/join"
            className={`nav-link ${location.pathname.startsWith("/join") ? "active" : ""}`}
          >
            Join Ride
          </Link>
          <Link
            to="/my-rides"
            className={`nav-link ${location.pathname === "/my-rides" ? "active" : ""}`}
          >
            My Rides
          </Link>

          {token ? (
            <div className="nav-user">
              <span className="nav-avatar">{getInitials(userName)}</span>
              <button
                type="button"
                className="btn-icon-logout"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                ⏻
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link nav-cta">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
