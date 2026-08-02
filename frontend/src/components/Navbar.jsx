import { Link } from "react-router-dom";

/**
 * Navbar — now landing-only. Authenticated pages use AppShell's rail
 * nav instead; this is just the minimal top bar for the public site.
 */
function Navbar() {
  const token = sessionStorage.getItem("token");

  return (
    <header className="landing-topbar landing-topbar--floating glass-panel">
      <Link to="/" className="landing-topbar__brand">
        <span className="landing-topbar__logomark">23</span>
        one23
      </Link>

      {token ? (
        <Link to="/dashboard" className="landing-topbar__cta">
          Dashboard
        </Link>
      ) : (
        <Link to="/login" className="landing-topbar__cta">
          Login
        </Link>
      )}
    </header>
  );
}

export default Navbar;
