import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="center-page">
      <div className="center-card">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="center-actions">
          <Link to="/" className="btn btn-lime">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
