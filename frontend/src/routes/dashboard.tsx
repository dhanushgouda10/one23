import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlusCircle, List, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/SectionHeading";
import { getMyRides, type Ride } from "@/lib/api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { PageLoader } from "@/components/common/primitives";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — one23" },
      {
        name: "description",
        content: "Your one23 home: join a ride and track your active commute group.",
      },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { ready, userName } = useRequireAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let isMounted = true;
    getMyRides()
      .then((data) => {
        if (isMounted) setRides(data);
      })
      .catch(() => {
        /* Dashboard stats are best-effort */
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [ready]);

  if (!ready) return <PageLoader label="Loading your dashboard…" />;

  const firstName = (userName || "there").split(" ")[0];
  const active = rides.filter(
    (r) => r.status === "WAITING" || r.status === "MATCHED" || r.status === "IN_PROGRESS",
  ).length;
  const completed = rides.filter((r) => r.status === "COMPLETED").length;

  return (
    <AppShell>
      <div className="space-y-9">
        <PageHeader
          title={`${greeting()}, ${firstName}`}
          description="Where are you headed today?"
        />

        {!loading && rides.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 sm:max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-3xl font-bold">{rides.length}</p>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">Total rides</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-3xl font-bold">{active}</p>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">Active</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-3xl font-bold">{completed}</p>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">Completed</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:max-w-4xl">
          <Link to="/join" className="hover-lift surface group flex flex-col gap-4 p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-soft">
              <PlusCircle className="h-5.5 w-5.5 text-accent-foreground" />
            </span>
            <h2 className="text-xl font-bold">Join a ride</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pick your pickup hub and destination — we'll match you with two other commuters headed
              the same way.
            </p>
            <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-foreground">
              Get started{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>

          <Link to="/rides" className="hover-lift surface group flex flex-col gap-4 p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
              <List className="h-5.5 w-5.5" />
            </span>
            <h2 className="text-xl font-bold">My rides</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              View ride history, track live status, and jump back into a matched group's lobby.
            </p>
            <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-foreground">
              View rides{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
