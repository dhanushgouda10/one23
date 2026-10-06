import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ArrowRight } from "./Icons";
import { Logo } from "./Logo";
import { Button } from "./Button";

const links = [
  { hash: "#how-it-works", label: "How it works" },
  { hash: "#faq", label: "FAQ" },
];

export function MarketingLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="page">
      <header className="mkt-header">
        <div className="mkt-header-inner">
          <Logo />
          <nav aria-label="Primary" className="mkt-nav">
            {links.map((link) => (
              <a key={link.label} href={link.hash} className="mkt-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mkt-header-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-lime btn-sm">
              Get started <ArrowRight />
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mkt-menu-btn hidden-md"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open ? (
          <div className="mkt-mobile">
            <nav aria-label="Mobile">
              {links.map((link) => (
                <a key={link.label} href={link.hash} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mkt-mobile-actions">
              <Link to="/login" className="btn btn-outline btn-default-size" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-lime btn-default-size" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="mkt-footer">
        <div className="mkt-footer-grid">
          <div className="mkt-footer-brand">
            <Logo />
            <p>
              one23 turns the office commute you already make in Bengaluru into a shared, cheaper,
              friendlier ride. Built for office commuters, not taxi fleets.
            </p>
          </div>
          <FooterCol
            title="Product"
            items={[
              { label: "Join a ride", to: "/join" },
              { label: "My rides", to: "/rides" },
              { label: "Dashboard", to: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Account"
            items={[
              { label: "Log in", to: "/login" },
              { label: "Sign up", to: "/signup" },
            ]}
          />
        </div>
        <div className="mkt-footer-bottom">
          <div className="mkt-footer-bottom-inner">
            <p>© {new Date().getFullYear()} one23. Commuting, shared.</p>
            <p>Not a taxi service · Bengaluru office commuters only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <p className="footer-col-title">{title}</p>
      <ul className="footer-col-list">
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
