import { useEffect, useState } from 'react';
import { Button } from '../ui.jsx';
import './showcase-section.css';
import Logo from '../Logo.jsx';

// Auto-playing product showcase — a React/CSS rebuild of the reference video:
// glow → app window → ticking checklist + progress → readiness ring + count →
// squad slide-in with counters → drifting chips → closing lockup, then loops.
const LOOP_MS = 15000;

// Counts from 0 to target with an ease-out curve, restarting every loop.
// Under prefers-reduced-motion the target is shown immediately.
function useCountUp(target, { delay = 0, duration = 1200, resetKey = 0 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }
    setValue(0);
    let raf;
    const timer = setTimeout(() => {
      const began = performance.now();
      const tick = (now) => {
        const t = Math.min((now - began) / duration, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, delay, duration, resetKey]);

  return value;
}

export default function ShowcaseSection() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => clearInterval(timer);
  }, []);

  const score = useCountUp(38, { delay: 4500, duration: 1500, resetKey: cycle });
  const aarav = useCountUp(120, { delay: 8200, duration: 800, resetKey: cycle });
  const diya = useCountUp(95, { delay: 8600, duration: 800, resetKey: cycle });

  return (
    <section className="showcase" key={cycle}>
      <div className="showcase__glow" aria-hidden="true" />

      <span className="showcase__chip showcase__chip--a" aria-hidden="true">
        <span className="showcase__chip-dot" /> Catch the AI
      </span>
      <span className="showcase__chip showcase__chip--b" aria-hidden="true">
        <span className="showcase__chip-dot" /> Mock Drive
      </span>
      <span className="showcase__chip showcase__chip--c" aria-hidden="true">
        <span className="showcase__chip-dot" /> Squad Streak
      </span>

      <div className="showcase__stage">
        <div className="showcase__window">
          <div className="showcase__bar">
            <span className="showcase__bar-left">
              <span className="showcase__dot" />
              <span className="showcase__window-title">Quadly — Live</span>
            </span>
            <span className="showcase__day-pill">Day 12</span>
          </div>

          <div className="showcase__canvas">
            <h3 className="showcase__headline">Ready in 90 days</h3>

            <div className="showcase__ring-wrap">
              <svg className="showcase__ring" viewBox="0 0 130 130" role="img" aria-label={`Readiness Score: ${score}%`}>
                <circle className="showcase__ring-track" cx="65" cy="65" r="54" />
                <circle className="showcase__ring-progress" cx="65" cy="65" r="54" />
              </svg>
              <div className="showcase__ring-center">
                <span className="showcase__ring-value">{score}%</span>
                <span className="showcase__ring-label">Readiness</span>
              </div>
            </div>

            <p className="showcase__split">
              <strong>Strong:</strong> Python&ensp;·&ensp;<strong>Weak:</strong> DSA, system design&ensp;·&ensp;No projects yet
            </p>
          </div>

          <aside className="showcase__panel showcase__panel--today">
            <p className="showcase__panel-title">Today</p>
            <ul className="showcase__tasks">
              <li><span className="showcase__check" /> Aptitude</li>
              <li><span className="showcase__check" /> DSA</li>
              <li><span className="showcase__check" /> DBMS</li>
            </ul>
            <div className="showcase__track"><span className="showcase__fill" /></div>
          </aside>

          <aside className="showcase__panel showcase__panel--squad">
            <p className="showcase__panel-title">Squad</p>
            <div className="showcase__squad-avatars">
              <span className="showcase__avatar showcase__avatar--pink">A</span>
              <span className="showcase__avatar showcase__avatar--lime">D</span>
              <span className="showcase__avatar showcase__avatar--green">M</span>
            </div>
            <p className="showcase__squad-rank">Squad rank #4 this week</p>
            <div className="showcase__squad-row">
              <span>Aarav</span>
              <span className="showcase__squad-score">+{aarav}</span>
            </div>
            <div className="showcase__squad-row">
              <span>Diya</span>
              <span className="showcase__squad-score">+{diya}</span>
            </div>
          </aside>
        </div>
      </div>

      <div className="showcase__endcard">
        <p className="showcase__brand"><Logo /></p>
        <p className="showcase__tagline">Crack your placement season</p>
        <Button variant="primary" size="md" href="/join">Join Waitlist</Button>
      </div>
    </section>
  );
}
