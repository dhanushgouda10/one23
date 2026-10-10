import { Link } from "react-router-dom";
import { MarketingLayout } from "../components/MarketingLayout";
import { ArrowRight } from "../components/Icons";

// Public landing page: what one23 is, how it works, and a short FAQ.

const STEPS = [
  {
    title: "Sign up",
    text: "Create a free account with your name and email.",
  },
  {
    title: "Pick your metro station and office",
    text: "Choose where you get off the metro and where you're going.",
  },
  {
    title: "Get matched with 2 others",
    text: "When 3 people wait on the same route, one23 puts you in a group automatically.",
  },
  {
    title: "Meet, take an auto, split the fare",
    text: "Use the group chat and live location to meet, take any auto nearby and split the fare.",
  },
];

const FAQS = [
  {
    question: "Does one23 book the auto?",
    answer:
      "No. one23 only matches people. Your group takes any regular auto near the station and agrees the fare with the driver.",
  },
  {
    question: "How do we pay?",
    answer: "Each person pays their share directly. The app doesn't handle any payment.",
  },
  {
    question: "What if only 2 people are going my way?",
    answer:
      "A group is formed only with 3 people, so you keep waiting. A request that isn't matched expires after 15 minutes, so you can rejoin later.",
  },
  {
    question: "Can I leave a group?",
    answer:
      "Yes, before the ride starts. The other two go back to waiting and can be matched with someone else.",
  },
];

export function HomePage() {
  return (
    <MarketingLayout>
      {/* ---- Hero ---- */}
      <section className="container hero">
        <div>
          <p className="eyebrow">Metro → office, shared</p>
          <h1>
            3 people. 1 auto.
            <br />
            <span className="highlight">Split the fare.</span>
          </h1>
          <p className="lead">
            one23 finds 2 other people who get off at your metro station and go to the same office,
            so you can share one auto instead of paying alone.
          </p>
          <div className="row">
            <Link to="/signup" className="btn btn-lime btn-lg">
              Get started <ArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Log in
            </Link>
          </div>
        </div>

        {/* Example card: the fare split (illustration only) */}
        <div className="card fare-card">
          <p className="hint">Example</p>
          <p className="fare-route">Whitefield (Kadugodi) metro → ITPL</p>
          <div className="fare-compare">
            <div>
              <p className="fare-amount muted">₹180</p>
              <p className="hint">Alone</p>
            </div>
            <ArrowRight />
            <div>
              <p className="fare-amount">₹60</p>
              <p className="hint">Each, with 3 people</p>
            </div>
          </div>
          <p className="hint">
            Actual fare depends on the route and what you agree with the driver.
          </p>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how-it-works" className="container section">
        <h2>How it works</h2>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card">
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- FAQ (uses the browser's built-in <details> open/close) ---- */}
      <section id="faq" className="container section faq">
        <h2>FAQ</h2>
        {FAQS.map((faq) => (
          <details key={faq.question} className="faq-item">
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </MarketingLayout>
  );
}
