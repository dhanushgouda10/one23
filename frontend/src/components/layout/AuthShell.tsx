import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, ShieldCheck, Users, Route as RouteIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/** Split-screen auth layout: dark story panel + light form panel. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
      <aside className="grid-map relative hidden flex-col justify-between overflow-hidden p-12 text-ink-foreground lg:flex xl:p-16">
        <Logo onDark />
        <div className="relative max-w-lg space-y-7">
          <h2 className="text-balance-tight font-display text-4xl font-bold leading-[1.05] xl:text-5xl">
            The seat next to someone going your way is already there.
          </h2>
          <p className="text-base leading-relaxed text-ink-foreground/65">
            one23 pairs Bengaluru office commuters on the same pickup hub and destination into a
            group of three, so nobody rides — or pays — alone.
          </p>
          <ul className="space-y-4 text-sm">
            {[
              { icon: ShieldCheck, text: "Work email verification at signup" },
              { icon: Users, text: "Matched into a group of 3 on your exact route" },
              { icon: RouteIcon, text: "Live group chat and location sharing" },
            ].map((i) => (
              <li key={i.text} className="flex items-center gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-foreground/10">
                  <i.icon className="h-4.5 w-4.5 text-lime" />
                </span>
                <span className="text-base text-ink-foreground/80">{i.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs leading-snug text-ink-foreground/50">
          Built for office commuters travelling within Bengaluru.
        </p>
      </aside>

      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>

        <div className="rise-in mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 lg:max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2.5 text-base text-muted-foreground">{subtitle}</p>
          <div className="mt-9">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>

        <p className="mx-auto max-w-md text-xs text-muted-foreground lg:max-w-lg">
          By continuing you agree to share a fair cost, not a fare. one23 is a cost-sharing
          community for office commuters, not a taxi service.
        </p>
      </div>
    </div>
  );
}
