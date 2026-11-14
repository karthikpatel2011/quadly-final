import { useEffect, useState } from 'react';
import HeroSection from './components/sections/hero-section.jsx';
import WorkflowSection from './components/sections/workflow-section.jsx';
import NarrativeSection from './components/sections/narrative-section.jsx';
import SaveHoursSection from './components/sections/save-hours-section.jsx';
import ShowcaseSection from './components/sections/showcase-section.jsx';
import BackedCtaSection from './components/sections/backed-cta-section.jsx';
import FooterSection from './components/sections/footer-section.jsx';
import JoinPage from './components/join/JoinPage.jsx';
import OnboardingFlow from './components/onboarding/OnboardingFlow.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AdminApp from './components/admin/AdminApp.jsx';
import LegalPage from './components/legal/LegalPage.jsx';
import AmbassadorProgram from './components/ambassador/AmbassadorProgram.jsx';
import CareerPage from './components/careers/CareerPage.jsx';
import SharedRecordPage from './components/sharedrecord/SharedRecordPage.jsx';

const SECTIONS = [
  ['hero', HeroSection],
  ['workflow', WorkflowSection],
  ['narrative', NarrativeSection],
  ['save-hours', SaveHoursSection],
  ['showcase', ShowcaseSection],
  ['backed-cta', BackedCtaSection],
  ['footer', FooterSection],
];

// Clean-path routing (no #hashtags): "/app", "/join", "/onboarding", "/admin",
// "/ambassadors", "/privacy", "/terms", "/careers". Anything else renders
// the landing sections. Vite serves index.html for deep links in dev;
// production hosts need the standard SPA fallback rewrite.
function pageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '').replace(/^\//, '');
  return path || 'home';
}

export default function App() {
  const [page, setPage] = useState(pageFromLocation);

  useEffect(() => {
    const sync = () => {
      setPage(pageFromLocation());
      window.scrollTo(0, 0);
    };
    // Same-origin "/..." links navigate without a full reload.
    const onClick = (e) => {
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest('a[href^="/"]');
      if (!link || link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href !== window.location.pathname) {
        window.history.pushState({}, '', href);
        sync();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', sync);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const joinInvite = /^join\/([A-Z0-9]{6})$/i.exec(page);
  if (joinInvite) {
    return <JoinPage inviteCode={joinInvite[1].toUpperCase()} />;
  }

  if (page === 'join') {
    return <JoinPage />;
  }

  if (page === 'onboarding') {
    return <OnboardingFlow />;
  }

  // The student product: readiness map, daily missions, Circle-to-Ask.
  // Sub-routes (/app/plan, /app/practice/…) render the same dashboard shell,
  // which resolves its own view from the path.
  if (page === 'app' || page.startsWith('app/')) {
    return <Dashboard />;
  }

  if (page === 'admin') {
    return <AdminApp />;
  }

  // Legal pages: "/privacy" and "/terms" share one shell, content switched by kind.
  if (page === 'privacy' || page === 'terms') {
    return <LegalPage kind={page} />;
  }

  if (page === 'ambassadors') {
    return <AmbassadorProgram />;
  }

  if (page === 'careers') {
    return <CareerPage />;
  }

  // Public read-only work record: /shared-record/<token> — no sign-in.
  const sharedRecord = /^shared-record\/([a-f0-9]{16,})$/.exec(page);
  if (sharedRecord) {
    return <SharedRecordPage token={sharedRecord[1]} />;
  }

  // Dev QA mode: http://localhost:5173/?section=<name> renders one section only.
  const only = new URLSearchParams(window.location.search).get('section');
  const list = only ? SECTIONS.filter(([name]) => name === only) : SECTIONS;

  return list.map(([name, Section]) => <Section key={name} />);
}
