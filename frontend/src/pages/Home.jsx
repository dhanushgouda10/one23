import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const FEATURES = {
  matching: [
    {
      icon: "⚡",
      title: "Instant Join",
      text: "Submit your name, pickup hub, and destination in seconds."
    },
    {
      icon: "📍",
      title: "Hub-Based Matching",
      text: "Get grouped with commuters leaving from the same pickup hub."
    },
    {
      icon: "👥",
      title: "Groups of 3",
      text: "When 3 users join the same hub, a ride group is created instantly."
    },
    {
      icon: "🔔",
      title: "Live Updates",
      text: "Lobby tabs update in real time through WebSocket notifications."
    }
  ],
  lobby: [
    {
      icon: "💬",
      title: "Group Chat",
      text: "Coordinate pickup details with your matched group in real time."
    },
    {
      icon: "🗺️",
      title: "Live Location",
      text: "Share your live location so your group can find you on the map."
    },
    {
      icon: "✅",
      title: "Match Found",
      text: "See your group ID, pickup hub, and matched commuter names."
    },
    {
      icon: "🚦",
      title: "Ride Status",
      text: "Track the ride from matched → in progress → completed."
    }
  ]
};

const STEPS = [
  {
    title: "Tell us where you're headed",
    text: "Pick your pickup hub and destination — no back-and-forth messaging needed."
  },
  {
    title: "We match you automatically",
    text: "The moment three riders share a hub and destination, a group is formed."
  },
  {
    title: "Coordinate in the group lobby",
    text: "Chat, share your live location, and start the ride together."
  }
];

function Home() {
  const [activeTab, setActiveTab] = useState("matching");

  return (
    <div className="landing-page">
      {/* ——— Hero ——— */}
      <section className="landing-hero">
        <Navbar landing />

        <div className="landing-hero__content">
          <span className="landing-hero__eyebrow">● Live hub matching</span>
          <h1>
            No coordinating.
            <br />
            Just ride, <span>together.</span>
          </h1>
          <p className="landing-hero__lead">
            one23 automatically groups students and professionals leaving from
            the same pickup hub — so you split the ride, not the hassle.
          </p>

          <div className="landing-hero-actions">
            <Link to="/join" className="landing-hero-btn">
              <span>Join a Ride</span>
              <span className="landing-hero-btn__icon">→</span>
            </Link>
            <a href="#how-it-works" className="landing-hero-btn landing-hero-btn--ghost">
              See how it works
            </a>
          </div>

          <div className="landing-stat-row">
            <div className="stat-chip">
              <strong>Groups of 3</strong>
              <span>per pickup hub</span>
            </div>
            <div className="stat-chip">
              <strong>Real-time</strong>
              <span>WebSocket matching</span>
            </div>
            <div className="stat-chip">
              <strong>Live</strong>
              <span>location sharing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ——— How it works ——— */}
      <section className="landing-steps" id="how-it-works">
        <div className="landing-steps__inner">
          <span className="benefits-badge">How one23 works</span>
          <h2 style={{ margin: 0, fontSize: "clamp(1.6rem, 3.4vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Three steps from request to ride
          </h2>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <div className="step-card" key={step.title}>
                <span className="step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Benefits ——— */}
      <section className="landing-benefits" id="benefits">
        <span className="benefits-badge">one23 Benefits</span>
        <h2>What Can You Do With one23?</h2>

        <div className="benefits-toggle">
          <button
            type="button"
            className={`benefits-tab ${activeTab === "matching" ? "active" : ""}`}
            onClick={() => setActiveTab("matching")}
          >
            <span className="tab-icon">🚗</span>
            Smart Hub Matching
          </button>
          <button
            type="button"
            className={`benefits-tab ${activeTab === "lobby" ? "active" : ""}`}
            onClick={() => setActiveTab("lobby")}
          >
            <span className="tab-icon">📡</span>
            Live Group Lobby
          </button>
        </div>

        <div className="benefits-content">
          <div className="benefits-image">
            <div className="benefits-image__inner">
              <div className="benefits-image__route">
                <div className="route-pin route-pin--start">A</div>
                <div className="route-path" />
                <div className="route-pin route-pin--end">B</div>
              </div>
              <p>Last-mile commute matching made simple</p>
            </div>
          </div>

          <ul className="benefits-list">
            {FEATURES[activeTab].map((item) => (
              <li key={item.title} className="benefits-item">
                <span className="benefits-item__icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="benefits-footer">
          <Link to="/join" className="landing-cta-btn--large">
            Get Started — Join Ride
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
