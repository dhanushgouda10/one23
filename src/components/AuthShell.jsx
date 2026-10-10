import { Link } from "react-router-dom";
import { ArrowLeft } from "./Icons";
import { Logo } from "./Logo";

// Layout for Login and Signup: a dark info panel on the left (desktop only)
// and the form on the right.
const POINTS = [
  "Matched with 2 people from your metro station",
  "Group chat and live location to meet up",
  "One offline auto, fare split 3 ways",
];

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-grid">
      <aside className="auth-aside">
        <Logo onDark />
        <div>
          <h2>3 people. 1 auto. Split the fare.</h2>
          <ul className="auth-points">
            {POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <p className="auth-aside-foot">For metro commuters in Bengaluru.</p>
      </aside>

      <div className="auth-form-col">
        <div className="auth-form-top">
          <Logo />
          <Link to="/" className="back-home">
            <ArrowLeft size={16} /> Home
          </Link>
        </div>

        <div className="auth-form-body">
          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
