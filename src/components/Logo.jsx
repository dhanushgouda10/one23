import { Link } from "react-router-dom";

// one23 logo (images in /public).
// Light background -> black oval. Dark background (onDark) -> lime oval.
export function Logo({ onDark = false, to = "/" }) {
  return (
    <Link to={to} className="logo">
      <img src={onDark ? "/logo-lime.png" : "/logo-black.png"} alt="one23" />
    </Link>
  );
}
