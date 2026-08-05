import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { RideStatus } from "@/lib/api";

const STATUS_LABEL: Record<RideStatus, string> = {
  WAITING: "Waiting for match",
  MATCHED: "Matched",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status, className }: { status: RideStatus; className?: string }) {
  const tone: Record<RideStatus, string> = {
    WAITING: "bg-warning/20 text-warning-foreground border-transparent",
    MATCHED: "bg-lime-soft text-accent-foreground border-transparent",
    IN_PROGRESS: "bg-lime-soft text-accent-foreground border-transparent",
    COMPLETED: "bg-success/15 text-success border-transparent",
    CANCELLED: "bg-destructive/10 text-destructive border-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tone[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Chip({
  children,
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200",
        active
          ? "border-transparent bg-ink text-ink-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-xs", lg: "h-14 w-14 text-sm" };
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-secondary font-display font-bold text-foreground ring-2 ring-card",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something didn't load",
  description = "We couldn't reach the ride network. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-10 text-center">
      <h3 className="text-lg font-bold text-destructive">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="surface animate-pulse space-y-4 p-6">
      <div className="h-4 w-24 rounded-full bg-secondary" />
      <div className="h-6 w-3/4 rounded-full bg-secondary" />
      <div className="h-4 w-1/2 rounded-full bg-secondary" />
      <div className="flex gap-2 pt-2">
        <div className="h-9 w-9 rounded-full bg-secondary" />
        <div className="h-9 flex-1 rounded-full bg-secondary" />
      </div>
    </div>
  );
}

/**
 * Full-viewport loading state for pages gated by useRequireAuth — avoids a
 * blank white flash while the client checks sessionStorage for a token on
 * first paint (e.g. after a hard refresh or a deep link).
 */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground"
          aria-hidden
        />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
