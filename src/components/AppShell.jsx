import { NavLink, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";
import { Avatar } from "./primitives";
import { Button } from "./Button";
import { LayoutDashboard, PlusCircle, List, LogOut, Menu, X } from "./Icons";
import { getUserName, clearSession } from "../lib/session";
import { initialsOf } from "../lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/join", label: "Join a ride", icon: PlusCircle, end: true },
  { to: "/rides", label: "My rides", icon: List, end: false },
];

function NavList({ onNavigate }) {
  return (
    <nav aria-label="Main" className="sidebar-nav">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          <item.icon size={20} />
          <span className="flex-1 truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const userName = getUserName() || "You";
  const location = useLocation();

  function handleLogout() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo to="/dashboard" />
        </div>
        <NavList />
        <div className="sidebar-user">
          <div className="user-row">
            <Avatar initials={initialsOf(userName, "U")} size="md" />
            <div className="min-w-0 flex-1">
              <p className="user-name">{userName}</p>
              <p className="hint">Office commuter</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {open ? (
        <div className="drawer">
          <button aria-label="Close menu" className="drawer-backdrop" onClick={() => setOpen(false)} />
          <div className="drawer-panel rise-in">
            <div className="drawer-head">
              <Logo to="/dashboard" />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="sidebar-user">
              <button type="button" onClick={handleLogout} className="logout-btn">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="app-main-wrap">
        <header className="app-topbar">
          <Button
            variant="ghost"
            size="icon"
            className="hidden-lg"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <div className="hidden-lg">
            <Logo to="/dashboard" />
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/join" className="btn btn-lime btn-default-size">
              <PlusCircle /> Join a ride
            </Link>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <nav aria-label="Quick navigation" className="bottom-nav">
        <ul>
          {nav.map((item) => {
            const active = item.to === "/rides" ? location.pathname.startsWith("/rides") : location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link to={item.to} className={`bottom-link${active ? " active" : ""}`}>
                  <span className="bottom-ico">
                    <item.icon size={18} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
