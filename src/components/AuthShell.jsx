import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Users, Route as RouteIcon } from "./Icons";
import { Logo } from "./Logo";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-grid">
      <aside className="auth-aside grid-map">
        <Logo onDark />
        <div className="auth-aside-copy">
          <h2>The seat next to someone going your way is already there.</h2>
          <p>
            one23 pairs Bengaluru office commuters on the same pickup hub and destination into a group of
            three, so nobody rides — or pays — alone.
          </p>
          <ul className="auth-points">
            {[
              { icon: ShieldCheck, text: "Work email verification at signup" },
              { icon: Users, text: "Matched into a group of 3 on your exact route" },
              { icon: RouteIcon, text: "Live group chat and location sharing" },
            ].map((item) => (
              <li key={item.text}>
                <span className="auth-point-icon">
                  <item.icon size={18} />
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-foot">Built for office commuters travelling within Bengaluru.</p>
      </aside>

      <div className="auth-form-col">
        <div className="auth-form-top">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          <Link to="/" className="back-home">
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>

        <div className="auth-form-body rise-in">
          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>

        <p className="auth-legal">
          By continuing you agree to share a fair cost, not a fare. one23 is a cost-sharing community for
          office commuters, not a taxi service.
        </p>
      </div>
    </div>
  );
}
