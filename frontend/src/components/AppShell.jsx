import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const NAV_ITEMS = [
  { to: "/dashboard", icon: "home", label: "Dashboard", match: (p) => p === "/dashboard" },
  { to: "/join", icon: "plus", label: "Join a Ride", match: (p) => p.startsWith("/join") },
  { to: "/my-rides", icon: "list", label: "My Rides", match: (p) => p === "/my-rides" || p.startsWith("/group-lobby") }
];

/**
 * AppShell — the persistent left icon-rail that replaces the old
 * floating pill navbar for every authenticated screen. Pages pass a
 * title (and optionally a back handler) for the sticky top bar, and
 * render their own content as children.
 */
function AppShell({ title, onBack, backLabel = "Back", children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-bg__photo" />
        <div className="ambient-bg__mesh" />
        <div className="ambient-bg__dots" />
      </div>

      <aside className="app-rail">
        <Link to="/dashboard" className="app-rail__brand" aria-label="one23 home">
          23
        </Link>

        <nav className="app-rail__nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-rail__link ${item.match(location.pathname) ? "active" : ""}`}
            >
              <Icon name={item.icon} size={20} strokeWidth={1.9} />
              <span className="rail-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-rail__footer">
          <span className="app-rail__avatar" title={userName || "You"}>
            {getInitials(userName)}
          </span>
          <button
            type="button"
            className="app-rail__logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <Icon name="logout" size={16} strokeWidth={2} />
          </button>
        </div>
      </aside>

      <div className="app-main">
        {(title || onBack) && (
          <header className="app-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {onBack && (
                <button className="app-topbar__back" onClick={onBack}>
                  <Icon name="arrowLeft" size={14} strokeWidth={2.2} />
                  {backLabel}
                </button>
              )}
              {title && <span className="app-topbar__title">{title}</span>}
            </div>
          </header>
        )}

        {children}
      </div>
    </div>
  );
}

export default AppShell;
