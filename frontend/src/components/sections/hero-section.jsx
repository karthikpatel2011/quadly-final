import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui.jsx';
import './hero-section.css';
import Logo from '../Logo.jsx';

/* Hero: black nav + rounded blue panel; the demo video is the panel content —
   silent ambient loop until clicked, then it replays from the start with sound,
   in place. Nothing else is layered on it. */
export default function HeroSection() {
  const reelRef = useRef(null);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    try { setSignedIn(Boolean(localStorage.getItem('quadly:token'))); } catch { /* ignore */ }
  }, []);
  const playDemo = () => {
    const v = reelRef.current;
    if (!v) return;
    if (!v.paused && !v.muted) { v.pause(); return; } // click again pauses
    v.muted = false;
    v.currentTime = 0;
    v.play();
  };

  return (
    <section className="hero">
      <nav className="hero-nav">
        <a className="hero-nav__logo" href="#" aria-label="Quadly home"><Logo /></a>

        <ul className="hero-nav__links">
          <li><a className="hero-nav__link" href="/features">Features <span className="hero-nav__caret">▾</span></a></li>
          <li><a className="hero-nav__link" href="/pricing">Pricing</a></li>
          <li><a className="hero-nav__link" href="/squads">Squads</a></li>
          <li><a className="hero-nav__link" href="/contact">Contact</a></li>
        </ul>

        <div className="hero-nav__right">
          {signedIn ? (
            <Button variant="primary" size="sm" href="/app">Open Dashboard →</Button>
          ) : (
            <>
              <a className="hero-nav__login" href="/join">Login</a>
              <Button variant="primary" size="sm" href="/join">Join Waitlist</Button>
            </>
          )}
        </div>
      </nav>

      <div className="hero-panel">
        <span className="hero-panel__streak hero-panel__streak--a" aria-hidden="true" />
        <span className="hero-panel__streak hero-panel__streak--b" aria-hidden="true" />
        <span className="hero-panel__streak hero-panel__streak--c" aria-hidden="true" />
        <span className="hero-panel__arc hero-panel__arc--a" aria-hidden="true" />
        <span className="hero-panel__arc hero-panel__arc--b" aria-hidden="true" />

        <div className="hero-panel__inner">
          <div className="hero-badge">
            <span className="hero-badge__mark">Q</span>
            <span className="hero-badge__text">
              <span className="hero-badge__eyebrow">Built around</span>
              <span className="hero-badge__title">Your 90-Day Plan</span>
            </span>
            <span className="hero-badge__stat">▲ 3/day</span>
          </div>

          <h1 className="hero-title">
            Crack your<br />placement season
          </h1>

          <div className="hero-intro-row">
            <p className="hero-sub">
              Quadly gets you placed and teaches you to run AI instead of being replaced by it.
            </p>

            <div className="hero-ctas">
              <Button variant="dark" size="md" href="/join">Join Waitlist →</Button>
            </div>
          </div>

          <div className="hero-app">
            <div
              className="hero-app__canvas hero-app__canvas--video"
              role="button"
              tabIndex={0}
              aria-label="Play demo with sound"
              onClick={playDemo}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playDemo(); } }}
            >
              <video
                ref={reelRef}
                className="hero-app__reel"
                src="/demo/demo.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>


          </div>
        </div>
      </div>

    </section>
  );
}
