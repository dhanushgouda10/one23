import { Link } from "react-router-dom";
import { Logo } from "./Logo";

// Header + footer for the public home page.
export function MarketingLayout({ children }) {
  return (
    <div className="page">
      <header className="mkt-header">
        <div className="container mkt-header-inner">
          <Logo />
          <nav aria-label="Primary" className="mkt-nav">
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="mkt-header-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-lime btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mkt-footer">
        <div className="container mkt-footer-inner">
          <Logo />
          <p>© {new Date().getFullYear()} one23 · Matches commuters, not a taxi service.</p>
        </div>
      </footer>
    </div>
  );
}
