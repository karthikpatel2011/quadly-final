import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './careers.css';
import Logo from '../Logo.jsx';

/* Careers — open roles managed from the admin panel.
   Layout: sticky section nav on the left that highlight-syncs as you scroll
   (IntersectionObserver), role content on the right. */

export default function CareerPage() {
  const [roles, setRoles] = useState(null); // null = loading
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState('overview');

  useEffect(() => {
    let alive = true;
    apiFetch('/careers')
      .then((list) => {
        if (alive) setRoles(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (alive) {
          setRoles([]);
          setFailed(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  // Scroll-synced sidebar highlights
  useEffect(() => {
    if (!roles) return undefined;
    const ids = ['overview', ...roles.map((r) => r.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [roles]);

  return (
    <main className="cr-page">
      <header className="cr-topbar">
        <a className="cr-logo" href="/" aria-label="Quadly home"><Logo /></a>
        <a className="cr-back" href="/">← Back to home</a>
      </header>

      <div className="cr-layout">
        <aside className="cr-sidebar">
          <p className="cr-side-title">Careers at Quadly</p>
          <nav className="cr-side-nav">
            <a className={`cr-side-link ${active === 'overview' ? 'is-active' : ''}`} href="#overview" onClick={(e) => { e.preventDefault(); document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Overview
            </a>
            {(roles || []).map((r) => (
              <a
                key={r.id}
                href={'#' + r.id}
                className={`cr-side-link ${active === r.id ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(r.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {r.title}
              </a>
            ))}
          </nav>
          <p className="cr-side-note">Nothing fits? Write to <a href="mailto:hello@quadly.in">hello@quadly.in</a> — we read everything.</p>
        </aside>

        <div className="cr-content">
          <p className="cr-kicker">Careers</p>
          <h1 className="cr-title">Build the thing students actually use.</h1>
          <p className="cr-sub">
            Small team, real ownership, and users who tell you the truth every single day. We hire for craft
            and ship for students.
          </p>

          <section className="cr-section" id="overview">
            <h2 className="cr-h2">Overview</h2>
            <div className="cr-card">
              <p>
                Quadly is a placement and AI-judgment platform built for Indian engineering students. You would
                work on the features students touch daily — the Placement Plan, Catch-the-AI, squads — with the
                founding team. Everything we build together is measured by whether students come back tomorrow.
              </p>
            </div>
            {failed && <p className="cr-note cr-note--error">Couldn't load open roles — is the backend running?</p>}
          </section>

          {(roles || []).map((r) => (
            <section className="cr-section" id={r.id} key={r.id}>
              <h2 className="cr-h2">{r.title}</h2>
              <div className="cr-card">
                <p className="cr-meta">
                  {r.team} · {r.type} · {r.location}
                </p>
                {r.description ? <p className="cr-desc">{r.description}</p> : null}
                <a className="cr-apply" href={'mailto:hello@quadly.in?subject=' + encodeURIComponent('Application: ' + r.title)}>
                  Apply → hello@quadly.in
                </a>
              </div>
            </section>
          ))}

          {roles && roles.length === 0 && (
            <section className="cr-section" id="no-roles">
              <div className="cr-card">
                <p className="cr-desc">
                  No open roles right now. We open seats when the roadmap needs them — write to{' '}
                  <a href="mailto:hello@quadly.in?subject=Careers">hello@quadly.in</a> and tell us what you'd
                  build, and we'll keep you first in line.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
