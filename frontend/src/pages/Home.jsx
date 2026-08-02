import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

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

const HIGHLIGHTS = [
  { icon: "bolt", title: "Instant Join", text: "Request a ride in seconds." },
  { icon: "chat", title: "Group Chat", text: "Coordinate live with your group." },
  { icon: "map", title: "Live Location", text: "See your group on the map." },
  { icon: "bell", title: "Live Updates", text: "Real-time WebSocket status." }
];

function Home() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* ——— Hero + bento grid ——— */}
      <section className="landing-hero-wrap">
        <div className="landing-hero-banner animate-in">
          <div className="landing-hero-banner__photo" />
          <div className="landing-hero-banner__overlay" />
          <div className="landing-hero-banner__content">
            <h2>Ride together. Split the cost. Zero hassle.</h2>
            <p>
              Automatic hub matching groups you with commuters headed your way —
              chat, share location, and go.
            </p>
          </div>
        </div>

        <div className="landing-hero-copy">
          <span className="eyebrow-pill">
            <span className="eyebrow-dot" aria-hidden="true" />
            Live hub matching
          </span>
          <h1>
            No coordinating.
            <br />
            Just ride, <span>together.</span>
          </h1>
          <p>
            one23 automatically groups students and professionals leaving from
            the same pickup hub — so you split the ride, not the hassle.
          </p>
          <div className="landing-hero-actions">
            <Link to="/join" className="landing-hero-btn">
              <span>Join a Ride</span>
              <span className="landing-hero-btn__icon">
                <Icon name="arrowRight" size={16} strokeWidth={2.2} />
              </span>
            </Link>
            <a href="#how-it-works" className="btn-ghost-dark">
              See how it works
            </a>
          </div>
        </div>

        <div className="bento-grid stagger-children">
          {/* Big brand tile */}
          <div className="bento-tile bento-tile--accent bento-tile--col-2 bento-tile--row-2 wordmark-tile">
            <div>
              <span className="tile-eyebrow" style={{ opacity: 0.6 }}>Quick-split rides</span>
              <div className="wordmark">
                one23<sup>®</sup>
              </div>
            </div>
            <p style={{ fontSize: "0.95rem", fontWeight: 600, maxWidth: 280 }}>
              The fastest way to split a commute with people already going
              your way.
            </p>
          </div>

          {/* Phone mock tile */}
          <div className="bento-tile bento-tile--dark bento-tile--col-2 bento-tile--row-2" style={{ alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div className="phone-mock animate-float">
              <div className="phone-mock__notch" />
              <div className="phone-mock__screen">
                <div className="phone-mock__map-dots" />
                <div className="phone-mock__status">
                  <span className="phone-mock__status-pill">
                    <Icon name="pin" size={11} strokeWidth={2.4} />
                    Whitefield Hub
                  </span>
                </div>
                <div className="phone-mock__pin phone-mock__pin--you" style={{ top: "34%", left: "38%" }}>
                  <Icon name="pin" size={14} strokeWidth={2.2} />
                </div>
                <div className="phone-mock__pin phone-mock__pin--rider" style={{ top: "52%", left: "62%" }}>
                  <Icon name="users" size={13} strokeWidth={2.2} />
                </div>
                <div className="phone-mock__sheet">
                  <div className="phone-mock__greeting">
                    <span className="welcome-wave">👋</span>
                    Hey Priya, 2 riders nearby
                  </div>
                  <div className="phone-mock__actions">
                    <div className="phone-mock__action">
                      <strong>Join a Ride</strong>
                      <span>Group of 3</span>
                    </div>
                    <div className="phone-mock__action">
                      <strong>My Rides</strong>
                      <span>1 waiting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick action tile */}
          <Link to="/join" className="bento-tile bento-tile--white bento-tile--col-2 bento-tile--clickable">
            <div className="tile-icon">
              <Icon name="car" size={22} strokeWidth={1.9} />
            </div>
            <span className="tile-title">Join a Ride</span>
            <p className="tile-body">
              Pick a pickup hub and destination — we'll group you with two
              other commuters headed the same way.
            </p>
            <span className="tile-go">
              Get started
              <Icon name="arrowRight" size={14} strokeWidth={2.4} />
            </span>
          </Link>

          {/* Stat tiles */}
          <div className="bento-tile bento-tile--outline">
            <div className="tile-icon">
              <Icon name="users" size={20} strokeWidth={1.9} />
            </div>
            <span className="tile-title" style={{ fontSize: "1.15rem" }}>Groups of 3</span>
            <p className="tile-body" style={{ marginBottom: 0 }}>per pickup hub, every time.</p>
          </div>

          <div className="bento-tile bento-tile--outline">
            <div className="tile-icon">
              <Icon name="bolt" size={20} strokeWidth={1.9} />
            </div>
            <span className="tile-title" style={{ fontSize: "1.15rem" }}>Real-time</span>
            <p className="tile-body" style={{ marginBottom: 0 }}>WebSocket matching &amp; chat.</p>
          </div>

          {/* Ticket preview tile */}
          <div className="bento-tile bento-tile--white bento-tile--col-2 ticket-preview-tile">
            <div className="ticket-preview-tile__row">
              <div className="ticket-preview-tile__lead">
                <div className="tile-icon ticket-preview-tile__icon">
                  <Icon name="map" size={19} strokeWidth={1.9} />
                </div>
                <div>
                  <strong className="ticket-preview-tile__title">Whitefield → Tech Park</strong>
                  <span className="ticket-preview-tile__subtitle">Group forming now</span>
                </div>
              </div>
              <span className="status-badge status-waiting">2 / 3</span>
            </div>

            <div className="ticket-preview-tile__meta">
              <div>
                <strong>~4 min</strong>
                <span>Est. match time</span>
              </div>
              <div>
                <strong>Live</strong>
                <span>Location sharing</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Riders per group</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Lifestyle band ——— */}
      <div className="lifestyle-band animate-in">
        <div className="lifestyle-band__photo" role="img" aria-label="Commuters on the move" />
        <div className="lifestyle-band__copy">
          <h2>Built for real commutes</h2>
          <p>
            Whether you're heading to campus or the tech park, one23 finds
            riders at your hub and gets you moving — no group chats, no
            waiting around.
          </p>
          <div className="lifestyle-band__stat">
            <div>
              <strong>3</strong>
              <span>Riders per group</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Location sharing</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>Hub matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* ——— How it works ——— */}
      <section className="landing-section" id="how-it-works">
        <span className="section-eyebrow">How one23 works</span>
        <h2>Three steps from request to ride</h2>
        <div className="steps-row stagger-children">
          {STEPS.map((step, index) => (
            <div className="step-tile" key={step.title}>
              <span className="step-tile__num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Highlights strip ——— */}
      <section className="landing-section" id="benefits">
        <span className="section-eyebrow">one23 benefits</span>
        <h2>Everything you need to ride together</h2>
        <div className="bento-grid stagger-children">
          {HIGHLIGHTS.map((item) => (
            <div className="bento-tile bento-tile--outline" key={item.title}>
              <div className="tile-icon">
                <Icon name={item.icon} size={20} strokeWidth={1.9} />
              </div>
              <span className="tile-title" style={{ fontSize: "1.05rem" }}>{item.title}</span>
              <p className="tile-body" style={{ marginBottom: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Final CTA ——— */}
      <div className="landing-cta-band animate-in">
        <div>
          <h2>Ready to split your next commute?</h2>
          <p>Join a hub and get matched with two other riders in minutes.</p>
        </div>
        <Link to="/join" className="landing-cta-btn--large">
          Get Started
          <Icon name="arrowRight" size={16} strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
}

export default Home;
