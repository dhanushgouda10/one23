import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, PlusCircle, List, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Avatar } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUserName, clearSession } from "@/lib/session";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/join", label: "Join a ride", icon: PlusCircle },
  { to: "/rides", label: "My rides", icon: List },
] as const;

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-5">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to !== "/rides" }}
          activeProps={{ className: "bg-ink text-ink-foreground hover:bg-ink" }}
          inactiveProps={{
            className: "text-muted-foreground hover:bg-secondary hover:text-foreground",
          }}
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors"
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setUserName(getUserName() || "You");
  }, []);

  function handleLogout() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-20 items-center px-6">
          <Logo to="/dashboard" />
        </div>
        <NavList />
        <div className="space-y-1.5 border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar initials={initialsOf(userName)} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">Office commuter</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="rise-in absolute inset-y-0 left-0 flex w-[280px] flex-col bg-sidebar">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo to="/dashboard" />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <div className="lg:hidden">
            <Logo to="/dashboard" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="lime">
              <Link to="/join">
                <PlusCircle /> Join a ride
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 pb-24 sm:px-6 sm:py-9 lg:px-8 lg:pb-12 2xl:max-w-[96rem]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {nav.map((item) => {
            const active =
              item.to === "/rides" ? pathname.startsWith("/rides") : pathname === item.to;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-12 place-items-center rounded-full transition-colors",
                      active && "bg-lime-soft",
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
