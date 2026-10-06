import { Link } from "react-router-dom";

export function Logo({ onDark = false, to = "/" }) {
  return (
    <Link to={to} aria-label="one23 home" className="logo">
      <span className={onDark ? "logo-mark logo-mark-dark" : "logo-mark"}>1</span>
      <span className={onDark ? "logo-text logo-text-dark" : "logo-text"}>one23</span>
    </Link>
  );
}
