import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/session";

// Wraps pages that need login (see App.jsx).
// Not logged in -> go to /login. Logged in -> show the page.
export function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
