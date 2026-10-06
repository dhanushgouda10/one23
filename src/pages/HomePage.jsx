import { useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "../components/MarketingLayout";
import { SectionHeading, Eyebrow } from "../components/SectionHeading";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronDown,
} from "../components/Icons";

export function HomePage() {
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
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy rise-in">
          <Eyebrow>
            <Sparkles size={14} /> Built for Bengaluru office commuters
          </Eyebrow>
          <h1>
            Same route.
            <br />
            Same time.
            <span className="hero-mark">
              <span className="hero-mark-text">One group.</span>
              <span className="hero-mark-bar" aria-hidden />
            </span>
          </h1>
          <p>
            one23 matches office commuters travelling the same pickup hub and destination in Bengaluru
            into a group of three, so you can share an auto or cab instead of commuting — and paying —
            alone.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-lime btn-xl">
              Create free account <ArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-xl">
              Log in
            </Link>
          </div>
        </div>

        <div>
          <div className="hero-card grid-map">
            <div className="hero-card-top">
              <div className="live-dot">
                <span className="dot-wrap">
                  <span className="pulse-ring dot-ping" />
                  <span className="dot" />
                </span>
                Example ride
              </div>
              <span className="pill-ghost">8:30 AM departure</span>
            </div>

            <svg
              viewBox="0 0 320 150"
              className="hero-svg"
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

            <div className="hero-inner-card">
              <div className="hero-inner-top">
                <span className="matched-pill">Matched</span>
                <div style={{ textAlign: "right" }}>
                  <p className="font-display">3 riders</p>
                  <p className="muted-xs">sharing this group</p>
                </div>
              </div>
              <div className="route-list">
                <div className="route-row">
                  <span className="route-dot" />
                  <div>
                    <p className="title">Whitefield</p>
                    <p className="sub">Pickup hub</p>
                  </div>
                </div>
                <div className="route-row">
                  <span className="route-dot-lime" />
                  <div>
                    <p className="title">Embassy Tech Village</p>
                    <p className="sub">Destination</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-chat">
              <MessagesSquare size={16} />
              <p>"Meeting at the metro entrance — I'll wait until 8:35."</p>
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
    <section id="how-it-works" className="how">
      <div className="how-inner">
        <div className="how-intro">
          <span className="how-eyebrow">How it works</span>
          <h2>Four steps from standing at the hub to sitting in the group</h2>
        </div>
        <ol className="how-steps">
          {steps.map((step) => (
            <li key={step.n} className="how-step">
              <span className="how-n">{step.n}</span>
              <h3>{step.t}</h3>
              <p>{step.d}</p>
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
    <section className="section">
      <SectionHeading eyebrow="Features" title="Everything a shared commute needs" align="center" />
      <div className="feature-grid">
        {items.map((item) => (
          <article key={item.t} className="hover-lift surface feature-card">
            <span className="feature-icon">
              <item.icon size={18} />
            </span>
            <div>
              <h3>{item.t}</h3>
              <p>{item.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Safety() {
  return (
    <section className="safety">
      <div className="safety-card">
        <div className="safety-copy">
          <Eyebrow>
            <ShieldCheck size={14} /> Trust
          </Eyebrow>
          <h2>You should know who's in your group before you meet at the hub</h2>
          <p>
            Every rider signs up with their real name and a work email. Group members can see each
            other's name and status the moment a match forms, and chat before ever meeting in person.
          </p>
        </div>
        <ul className="safety-list">
          {[
            { t: "Work email accounts", d: "Every signup uses a real name and work email." },
            { t: "Group chat first", d: "Agree the exact pickup point before you meet." },
            { t: "Live location sharing", d: "Opt in to share your location with your matched group." },
            { t: "Leave anytime", d: "Cancel a waiting request, or leave a matched group, in one tap." },
          ].map((item) => (
            <li key={item.t} className="safety-item">
              <p className="t">{item.t}</p>
              <p className="d">{item.d}</p>
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
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="faq">
      <SectionHeading eyebrow="FAQ" title="Questions people ask before their first ride" align="center" />
      <div className="accordion">
        {faqs.map((faq, index) => (
          <div key={faq.q} className={`accordion-item${open === index ? " open" : ""}`}>
            <button
              type="button"
              className="accordion-btn"
              aria-expanded={open === index}
              onClick={() => setOpen((current) => (current === index ? null : index))}
            >
              {faq.q}
              <ChevronDown size={16} className="accordion-chevron" />
            </button>
            <div className="accordion-panel">{faq.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="final-cta-inner grid-map">
        <h2 className="font-display">Your commute leaves in the morning. Bring two people along.</h2>
        <p>Sign up with your work email and get matched with commuters heading your way tomorrow.</p>
        <div className="final-cta-actions">
          <Link to="/signup" className="btn btn-lime btn-xl">
            Create free account <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
