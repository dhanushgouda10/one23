import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onDark = false,
  to = "/",
}: {
  className?: string;
  onDark?: boolean;
  to?: string;
}) {
  return (
    <Link
      to={to}
      aria-label="one23 home"
      className={cn("inline-flex items-center gap-2 font-display", className)}
    >
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-xl text-sm font-bold",
          onDark ? "bg-lime text-accent-foreground" : "bg-ink text-ink-foreground",
        )}
      >
        1
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          onDark ? "text-ink-foreground" : "text-foreground",
        )}
      >
        one23
      </span>
    </Link>
  );
}
