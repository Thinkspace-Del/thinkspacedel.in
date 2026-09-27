import React, { useEffect } from "react";
import JoinForm from "./components/JoinForm";
import HeroMedia from "./components/HeroMedia";
import "./landing.css";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

const PROMISES = [
  {
    title: "Post the messy stuff.",
    body: "Half-done drafts, broken builds, sketches you're not sure about. That's what it's for.",
  },
  {
    title: "Get real feedback.",
    body: "From people who make things too, and will tell you what isn't working.",
  },
  {
    title: "Watch other people get stuck.",
    body: "And unstuck. It helps more than you would think.",
  },
  {
    title: "Find people to make things with.",
    body: "Some ideas need more than one pair of hands.",
  },
];

function LoveIcon({ width = 14, height = 12 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 7 6"
      shapeRendering="crispEdges"
      aria-label="love"
    >
      <path d="M1 0h2v1H1zM4 0h2v1H4zM0 1h7v2H0zM1 3h5v1H1zM2 4h3v1H2zM3 5h1v1H3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
    </svg>
  );
}

function App() {
  // Inter is only loaded while the landing page is mounted so the admin
  // console keeps rendering exactly as it does today.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <div className="ts-landing">
      <main className="ts-col">
        <div className="ts-from ts-rule-bottom">
          <div className="ts-avatar" aria-hidden="true" />
          <div className="ts-from-meta">
            <span className="ts-from-name">Thinkspace</span>
            <span className="ts-from-to">to you</span>
          </div>
        </div>

        <h1 className="ts-h1">
          Ideas don't die. <span>They stall.</span>
        </h1>

        <HeroMedia />

        <p className="ts-p ts-p-lead">
          Making things on your own is hard. You get a great idea, start working
          on it, and somewhere halfway you hit a wall, lose motivation, or run
          out of steam.{" "}
          <span>
            The idea gets lost. We're building a place to keep that momentum
            alive.
          </span>
        </p>

        <div className="ts-promises">
          {PROMISES.map((p) => (
            <p className="ts-p" key={p.title}>
              {p.title} <span>{p.body}</span>
            </p>
          ))}
        </div>

        <a className="ts-apply-link" href="#join">
          Apply to join
        </a>

        <section id="join" className="ts-apply ts-rule-top">
          <h2 className="ts-h2">Sounds like your thing?</h2>
          <p className="ts-apply-sub">
            Half-finished is fine. Just an idea is fine. Tell us what you're
            making.
          </p>
          <JoinForm />
        </section>

        <footer className="ts-signoff">
          <div className="ts-foot ts-rule-top">
            <div className="ts-foot-links">
              <a
                className="ts-social"
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                className="ts-contact"
                href="mailto:comms.thinkspace@gmail.com"
              >
                Contact us
              </a>
            </div>
            <span className="ts-made">
              made with <LoveIcon /> in delhi
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
