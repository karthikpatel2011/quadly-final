import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import { Icon } from './icons.jsx';
import './dashboard.css';
import './workspace.css';
import Logo from '../Logo.jsx';
import SquadPage from './SquadPage.jsx';
import ContestssPage from './ContestsPage.jsx';
import InterviewsDashboard from './interviews/InterviewsDashboard.jsx';
import InterviewSetup from './interviews/InterviewSetup.jsx';
import InterviewRoom from './interviews/InterviewRoom.jsx';
import InterviewReport from './interviews/InterviewReport.jsx';
import PracticeHome from './practice/PracticeHome.jsx';
import DrillPage from './practice/DrillPage.jsx';
import IncidentRoom from './practice/IncidentRoom.jsx';
import PostmortemPage from './practice/PostmortemPage.jsx';
import RecordPage from './practice/RecordPage.jsx';

/* Signed-in dashboard shell: chrome plus the routes that have shipped, one
   semantic group per workspace (student's call): Practice = the incident
   + drill loop; Interviews = anything interview-shaped (the mock interview
   room and the Saturday mock drive). Unknown routes fall back to Home. The
   401 gate and the verified sign-out stay. */

const THEME_KEY = 'quadly:theme';

const NAV_ITEMS = [
  { id: 'app', label: 'Home' },
  {
    id: 'practice',
    label: 'Practice',
    children: [
      { id: 'practice/home', label: 'Practice home' },
      { id: 'practice/drill', label: 'Daily drill' },
    ],
  },
  { id: 'squad', label: 'Squad' },
  {
    id: 'interviews',
    label: 'Interviews',
    children: [
      { id: 'interviews/dash', label: 'Dashboard' },
      { id: 'interviews/mock', label: 'Mock interview' },
      { id: 'interviews/drive', label: 'Mock drive' },
    ],
  },
];

// Real routes that live under a group but don't need a dropdown entry.
const EXTRA_ROUTES = new Set([
  'interviews/setup', 'interviews/report',
  'practice/incident', 'practice/postmortem', 'practice/record',
]);

const NAV_LABELS = Object.fromEntries(NAV_ITEMS.flatMap((n) => [n, ...(n.children ?? [])]).map((n) => [n.id, n.label]));

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/app') return 'app';
  const sub = path.replace(/^\/app\/?/, '');
  if (sub === 'interviews') return 'interviews/dash';
  if (sub === 'practice') return 'practice/home';
  for (const n of NAV_ITEMS) {
    if (n.id === sub || n.children?.some((c) => c.id === sub)) return sub;
  }
  if (EXTRA_ROUTES.has(sub)) return sub;
  return 'app';
}

function navPath(id) {
  if (id === 'app') return '/app';
  if (id === 'interviews/mock') return '/app/interviews';
  if (id === 'practice/home') return '/app/practice';
  return `/app/${id}`;
}

function authHeaders() {
  let token = null;
  try {
    token = localStorage.getItem('quadly:token');
  } catch {
    /* storage unavailable */
  }
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
}

function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export default function Dashboard() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [payload, setPayload] = useState(null);
  const [theme, setTheme] = useState(() => lsGet(THEME_KEY, 'dark'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [route, setRoute] = useState(routeFromLocation);
  const [openMenu, setOpenMenu] = useState(null); // nav dropdown open per group id — one at a time

  /* The dashboard request doubles as the auth gate: a 401 means the session
     is gone and the join flow takes over. No cached fallback render — a
     shell with no content has nothing honest to show offline. */
  const load = useCallback(() => {
    const ctrl = new AbortController();
    apiFetch('/dashboard', { headers: authHeaders(), signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        setPayload(res);
        setPhase('ready');
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err.name === 'AbortError') return;
        if (err.message.includes('401') || /Not signed in/i.test(err.message)) {
          window.location.assign('/join');
          return;
        }
        setPhase('error');
      });
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);

  useEffect(() => {
    document.title = route === 'app' ? 'Quadly — Home' : `Quadly — ${NAV_LABELS[route] ?? 'Quadly'}`;
  }, [route]);

  useEffect(() => {
    const sync = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    if (!menuOpen && !openMenu) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, openMenu]);

  const navigate = (id) => {
    const path = navPath(id);
    if (window.location.pathname.replace(/\/+$/, '') !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(id);
    setMenuOpen(false);
    setOpenMenu(null);
    window.scrollTo(0, 0);
  };

  const toggleMenu = (id) => setOpenMenu((m) => (m === id ? null : id));

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    lsSet(THEME_KEY, next);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST', headers: authHeaders() });
    } catch {
      /* session may already be gone */
    }
    try {
      localStorage.removeItem('quadly:token');
      localStorage.removeItem('quadly:email');
    } catch {
      /* storage unavailable */
    }
    window.location.assign('/join');
  };

  const firstName = payload?.name ? payload.name.split(' ')[0] : payload?.email?.split('@')[0] || '';
  const avatarNum = (payload?.avatar || '').replace(/[^0-9]/g, '');

  if (phase === 'loading') {
    return (
      <div className="qd-app" data-qd-theme={theme}>
        <header className="qd-top" aria-hidden="true">
          <div className="qd-top__in">
            <span className="skeleton" style={{ width: 90, height: 22 }} />
            <span className="qd-top__spacer" />
            <span className="skeleton" style={{ width: 30, height: 30 }} />
          </div>
        </header>
        <main className="qd-home">
          <div className="qd-card skeleton" style={{ height: 140 }} />
        </main>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-app" data-qd-theme={theme}>
        <main className="qd-center" role="alert">
          <h1 className="qd-h2">Couldn’t load your dashboard</h1>
          <p className="qd-muted">Check your connection and try again.</p>
          <button
            type="button"
            className="qd-btn qd-btn--primary"
            onClick={() => { setPhase('loading'); load(); }}
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  // The live interview takes over the whole viewport — no dashboard chrome.
  if (route === 'interviews/mock') {
    return <InterviewRoom />;
  }

  return (
    <div className="qd-app" data-qd-theme={theme}>
      <header className="qd-top">
        <div className="qd-top__in">
          <a className="qd-wordmark qd-top__mark" href="/" aria-label="Quadly home site"><Logo /></a>

          <nav className="qd-top__nav" aria-label="Primary">
            {NAV_ITEMS.map((n) => {
              if (n.children) {
                const on = route === n.id || n.children.some((c) => c.id === route);
                return (
                  <div key={n.id} className="qd-topwrap">
                    <button
                      type="button"
                      className={`qd-top__item${on ? ' is-on' : ''}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === n.id}
                      onClick={() => toggleMenu(n.id)}
                    >
                      {n.label}
                      <span className={`qd-chev${openMenu === n.id ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
                    </button>
                    {openMenu === n.id && (
                      <div className="qd-pop qd-topwrap__pop" role="menu">
                        {n.children.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="menuitem"
                            className={`qd-pop__item${route === c.id ? ' is-on' : ''}`}
                            onClick={() => navigate(c.id)}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`qd-top__item${route === n.id ? ' is-on' : ''}`}
                  aria-current={route === n.id ? 'page' : undefined}
                  onClick={() => navigate(n.id)}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>

          <span className="qd-top__spacer" />

          <button
            type="button"
            className="qd-iconbtn"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            onClick={toggleTheme}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
          </button>
          <button
            type="button"
            className="qd-avatar qd-avatar--btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            title="Account"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {avatarNum
              ? <img src={`/avatars/${avatarNum.padStart(2, '0')}.webp`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              : firstName.charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <div className="qd-pop qd-top__acctpop" role="menu">
              <button type="button" role="menuitem" className="qd-pop__item" onClick={() => { toggleTheme(); setMenuOpen(false); }}>
                {theme === 'light' ? 'Dark theme' : 'Light theme'}
              </button>
              <button type="button" role="menuitem" className="qd-pop__item qd-pop__item--danger" onClick={logout}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      {(menuOpen || openMenu) && (
        <button
          type="button"
          className="qd-top__outside"
          aria-label="Close menu"
          onClick={() => { setMenuOpen(false); setOpenMenu(null); }}
        />
      )}

      {/* Home waits on the rebuilt feed; the two workspaces are live. */}
      {route === 'squad' && <main className="qd-home"><SquadPage /></main>}
      {route === 'interviews/dash' && <main className="qd-ivrhome"><InterviewsDashboard /></main>}
      {route === 'interviews/setup' && <main className="qd-ivrhome"><InterviewSetup /></main>}
      {route === 'interviews/report' && <main className="qd-ivrhome"><InterviewReport /></main>}
      {route === 'interviews/drive' && <main className="qd-home"><ContestsPage /></main>}
      {route === 'practice/home' && <main className="qd-prhome"><PracticeHome /></main>}
      {route === 'practice/drill' && <main className="qd-prhome"><DrillPage /></main>}
      {route === 'practice/incident' && <main className="qd-prhome"><IncidentRoom /></main>}
      {route === 'practice/postmortem' && <main className="qd-prhome"><PostmortemPage /></main>}
      {route === 'practice/record' && <main className="qd-prhome"><RecordPage /></main>}
      {route === 'app' && <main className="qd-home" aria-label="Home" />}
    </div>
  );
}
