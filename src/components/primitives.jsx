import { Button } from "./Button";

const STATUS_LABEL = {
  WAITING: "Waiting for match",
  MATCHED: "Matched",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }) {
  const tone = {
    WAITING: "badge-waiting",
    MATCHED: "badge-matched",
    IN_PROGRESS: "badge-in_progress",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
  };

  return (
    <span className={`badge ${tone[status] || ""}`}>
      <span className="badge-dot" aria-hidden />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function Chip({ children, active, ...props }) {
  return (
    <button type="button" aria-pressed={active} className={`chip${active ? " active" : ""}`} {...props}>
      {children}
    </button>
  );
}

export function Avatar({ initials, size = "md" }) {
  return (
    <span aria-hidden className={`avatar avatar-${size}`}>
      {initials}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something didn't load",
  description = "We couldn't reach the ride network. Check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="surface skeleton animate-pulse">
      <div className="skel" style={{ width: "6rem", height: "1rem" }} />
      <div className="skel" style={{ width: "75%", height: "1.5rem" }} />
      <div className="skel" style={{ width: "50%" }} />
      <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.5rem" }}>
        <div className="skel" style={{ height: "2.25rem", width: "2.25rem" }} />
        <div className="skel" style={{ height: "2.25rem", flex: 1 }} />
      </div>
    </div>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="page-loader">
      <div className="page-loader-inner">
        <span className="spinner animate-spin" aria-hidden />
        <p className="hint">{label}</p>
      </div>
    </div>
  );
}
