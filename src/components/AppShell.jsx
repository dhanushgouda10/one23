import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { Avatar } from "./primitives";
import { LayoutDashboard, PlusCircle, List, LogOut } from "./Icons";
import { getUserName, clearSession } from "../lib/session";
import { initialsOf } from "../lib/utils";

// Layout for logged-in pages.
// Desktop: sidebar on the left. Phone: top bar + bottom navigation.
const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/join", label: "Join a ride", icon: PlusCircle },
  { to: "/rides", label: "My rides", icon: List },
];

function navClass({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

export function AppShell({ children }) {
  const userName = getUserName() || "You";

  function handleLogout() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo to="/dashboard" />
        <nav aria-label="Main" className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar initials={initialsOf(userName, "U")} />
          <span className="user-name">{userName}</span>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">
          <LogOut size={16} /> Log out
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <Logo to="/dashboard" />
          <button type="button" onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Log out
          </button>
        </header>
        <main className="app-content">{children}</main>
      </div>

      <nav aria-label="Main" className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
