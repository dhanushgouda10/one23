import { Button } from "./Button";

// Small reusable UI pieces used on several pages.

const STATUS_LABEL = {
  WAITING: "Waiting",
  MATCHED: "Matched",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Coloured pill showing a ride status, e.g. "Matched"
export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status?.toLowerCase()}`}>{STATUS_LABEL[status] || status}</span>
  );
}

// Round circle with initials, e.g. "PN"
export function Avatar({ initials }) {
  return (
    <span aria-hidden className="avatar">
      {initials}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ description, onRetry }) {
  return (
    <div className="empty">
      <h3>Something didn't load</h3>
      <p>{description}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Loader({ label = "Loading…" }) {
  return (
    <div className="loader">
      <span className="spinner" aria-hidden />
      <p className="hint">{label}</p>
    </div>
  );
}
