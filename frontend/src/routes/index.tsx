import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { SectionHeading, Eyebrow } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "one23 — Share your Bengaluru office commute" },
      {
        name: "description",
        content:
          "one23 matches Bengaluru office commuters heading the same way into a group of three, so you can share an auto or cab and split the cost fairly.",
      },
      { property: "og:title", content: "one23 — Share your Bengaluru office commute" },
      {
        property: "og:description",
        content:
          "Pick a pickup hub and destination, get matched with two other commuters, chat, and go.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "one23",
          description:
            "Ride-matching platform for Bengaluru office commuters to share an auto or cab and split the cost.",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <MarketingLayout>
      <Hero />
      <HowItWorks />
      <Features />
      <Safety />
      <Faq />
      <FinalCta />
    </MarketingLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="rise-in space-y-7">
          <Eyebrow>
            <Sparkles className="h-3.5 w-3.5 text-lime" /> Built for Bengaluru office commuters
          </Eyebrow>
          <h1 className="text-balance-tight text-[2.65rem] font-bold leading-[0.98] sm:text-6xl lg:text-[4.25rem]">
            Same route.
            <br />
            Same time.
            <span className="relative ml-3 inline-block">
              <span className="relative z-10">One group.</span>
              <span
                className="absolute inset-x-[-6px] bottom-1.5 z-0 h-4 -rotate-1 rounded-sm bg-lime sm:h-5"
                aria-hidden
              />
            </span>
          </h1>
          <p className="max-w-xl text-balance-tight text-lg leading-relaxed text-muted-foreground">
            one23 matches office commuters travelling the same pickup hub and destination in
            Bengaluru into a group of three, so you can share an auto or cab instead of commuting —
            and paying — alone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl" variant="lime">
              <Link to="/signup">
                Create free account <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>

        {/* Illustrative example — not live data */}
        <div className="relative">
          <div className="grid-map relative overflow-hidden rounded-4xl p-5 shadow-[var(--shadow-lift)] sm:p-7">
            <div className="flex items-center justify-between text-ink-foreground">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-ring absolute inset-0 rounded-full bg-lime" />
                  <span className="relative h-2 w-2 rounded-full bg-lime" />
                </span>
                Example ride
              </div>
              <span className="rounded-full bg-ink-foreground/10 px-2.5 py-1 text-[11px] font-semibold text-ink-foreground/80">
                8:30 AM departure
              </span>
            </div>

            <svg
              viewBox="0 0 320 150"
              className="mt-6 h-32 w-full text-lime"
              role="img"
              aria-label="Route from Whitefield to Embassy Tech Village"
            >
              <path
                d="M12 128 C 80 128, 92 74, 150 74 S 236 30, 308 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="6 10"
              />
              <circle cx="12" cy="128" r="6" fill="currentColor" />
              <circle cx="308" cy="22" r="6" fill="currentColor" />
            </svg>

            <div className="mt-5 rounded-3xl bg-card p-5">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-soft px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                  Matched
                </span>
                <div className="text-right">
                  <p className="font-display text-lg font-bold">3 riders</p>
                  <p className="text-[11px] text-muted-foreground">sharing this group</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-foreground bg-card" />
                  <div>
                    <p className="text-sm font-semibold">Whitefield</p>
                    <p className="text-xs text-muted-foreground">Pickup hub</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-lime ring-4 ring-lime-soft" />
                  <div>
                    <p className="text-sm font-semibold">Embassy Tech Village</p>
                    <p className="text-xs text-muted-foreground">Destination</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-foreground/5 p-4 text-ink-foreground">
              <MessagesSquare className="h-4 w-4 shrink-0 text-lime" />
              <p className="text-xs text-ink-foreground/75">
                "Meeting at the metro entrance — I'll wait until 8:35."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Sign up with your work email",
      d: "One account, no separate roles — one23 is built for office commuters only.",
    },
    {
      n: "02",
      t: "Pick your pickup hub and destination",
      d: "Choose from Bengaluru pickup hubs and office corridors when you join a ride.",
    },
    {
      n: "03",
      t: "Get matched into a group of three",
      d: "As soon as three commuters are waiting on the same route, one23 forms your group automatically.",
    },
    {
      n: "04",
      t: "Chat, share location and go",
      d: "Coordinate pickup in the group lobby, share live location, then start and end the ride together.",
    },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-ink py-20 text-ink-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex rounded-full bg-ink-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
            How it works
          </span>
          <h2 className="text-balance-tight text-3xl font-bold leading-[1.05] sm:text-4xl">
            Four steps from standing at the hub to sitting in the group
          </h2>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="group rounded-3xl border border-ink-foreground/10 bg-ink-foreground/[0.04] p-6 transition-colors hover:border-lime/40"
            >
              <span className="font-display text-sm font-bold text-lime">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-foreground/60">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Sparkles,
      t: "Automatic matching",
      d: "The moment three commuters are waiting on the same pickup hub and destination, one23 forms your group.",
    },
    {
      icon: MessagesSquare,
      t: "Group chat",
      d: "Every matched group gets a live chat to agree the exact pickup point before the ride starts.",
    },
    {
      icon: MapPin,
      t: "Live location sharing",
      d: "Share your location with your group in real time so everyone can find each other at the hub.",
    },
    {
      icon: Clock,
      t: "Ride status tracking",
      d: "Track your ride from waiting, to matched, to in progress, to completed — right from My Rides.",
    },
    {
      icon: Users,
      t: "Groups of three",
      d: "Every match pairs exactly three riders on the same route, so an auto or cab is shared, never solo.",
    },
    {
      icon: ShieldCheck,
      t: "Work email accounts",
      d: "Every account signs up with a real name and work email — no anonymous riders.",
    },
  ];
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Features" title="Everything a shared commute needs" align="center" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <article key={i.t} className="hover-lift surface flex gap-4 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary">
              <i.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-bold">{i.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{i.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Safety() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
      <div className="grid gap-8 rounded-4xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <Eyebrow>
            <ShieldCheck className="h-3.5 w-3.5 text-lime" /> Trust
          </Eyebrow>
          <h2 className="text-balance-tight text-3xl font-bold leading-[1.05] sm:text-4xl">
            You should know who's in your group before you meet at the hub
          </h2>
          <p className="text-balance-tight leading-relaxed text-muted-foreground">
            Every rider signs up with their real name and a work email. Group members can see each
            other's name and status the moment a match forms, and chat before ever meeting in
            person.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { t: "Work email accounts", d: "Every signup uses a real name and work email." },
            { t: "Group chat first", d: "Agree the exact pickup point before you meet." },
            {
              t: "Live location sharing",
              d: "Opt in to share your location with your matched group.",
            },
            {
              t: "Leave anytime",
              d: "Cancel a waiting request, or leave a matched group, in one tap.",
            },
          ].map((s) => (
            <li key={s.t} className="rounded-2xl bg-muted/70 p-4">
              <p className="text-sm font-bold">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  const faqs = [
    {
      q: "Is one23 a taxi or auto service?",
      a: "No. one23 only matches commuters who are already travelling the same pickup hub and destination. You and your group arrange and pay for your own auto or cab.",
    },
    {
      q: "How does matching work?",
      a: "Choose a pickup hub and destination when you join a ride. As soon as three people are waiting on that exact route, one23 groups you together automatically.",
    },
    {
      q: "Who can sign up?",
      a: "one23 is built for office commuters travelling within Bengaluru. Signup only needs your name, work email and a password.",
    },
    {
      q: "What happens after I'm matched?",
      a: "You land in a Group Lobby with the other two riders — chat to agree the pickup point, share your location, then start and end the ride together once you're on your way.",
    },
    {
      q: "Can I cancel?",
      a: "Yes. While you're still waiting to be matched, cancel from My Rides. Once matched, you can leave the group from the Group Lobby.",
    },
    {
      q: "Does one23 cost anything?",
      a: "Creating an account and getting matched is free. Any auto or cab fare is arranged and paid directly between the riders in your group.",
    },
  ];
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions people ask before their first ride"
        align="center"
      />
      <Accordion
        type="single"
        collapsible
        className="mt-10 divide-y divide-border rounded-3xl border border-border bg-card px-2"
      >
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`} className="border-none px-4">
            <AccordionTrigger className="py-5 text-left text-[15px] font-semibold hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
      <div className="grid-map relative overflow-hidden rounded-4xl px-6 py-14 text-center text-ink-foreground sm:px-12 sm:py-20">
        <h2 className="text-balance-tight mx-auto max-w-2xl font-display text-3xl font-bold leading-[1.05] sm:text-5xl">
          Your commute leaves in the morning. Bring two people along.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink-foreground/65">
          Sign up with your work email and get matched with commuters heading your way tomorrow.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" variant="lime">
            <Link to="/signup">
              Create free account <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
