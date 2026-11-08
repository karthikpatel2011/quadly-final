import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import { Icon } from './icons.jsx';
import './dashboard.css';
import Logo from '../Logo.jsx';
import PracticePage from './PracticePage.jsx';
import InterviewsPage from './InterviewsPage.jsx';
import ContestsPage from './ContestsPage.jsx';
import ReplayPage from './ReplayPage.jsx';

/* Signed-in dashboard shell: chrome plus the routes that have shipped. The
   Practice workspace grows one entry per landed surface; unknown routes
   resolve back to Home — no placeholder text, no dead links. The 401 gate
   and the verified sign-out stay. */

const THEME_KEY = 'quadly:theme';

const NAV_ITEMS = [
  { id: 'app', label: 'Home' },
  {
    id: 'practice',
    label: 'Practice',
    children: [
      { id: 'practice/daily', label: 'Daily practice' },
      { id: 'practice/interviews', label: 'Interviews' },
      { id: 'practice/contests', label: 'Contests' },
      { id: 'practice/replay', label: 'Mistake replay' },
    ],
  },
];

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/app') return 'app';
  const sub = path.replace(/^\/app\/?/, ''); // '' | 'practice' | 'practice/daily' | 'practice/interviews' | …
  if (sub === 'practice') return 'practice/daily';
  for (const n of NAV_ITEMS) {
    if (n.children?.some((c) => c.id === sub)) return sub;
  }
  return 'app';
}

function navPath(id) {
  if (id === 'app') return '/app';
  if (id === 'practice/daily') return '/app/practice';
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
  const [practiceMenuOpen, setPracticeMenuOpen] = useState(false);

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
    document.title = route === 'app' ? 'Quadly — Home' : `Quadly — ${(NAV_ITEMS.find((n) => n.id === route.split('/')[0])?.children ?? NAV_ITEMS).find((n) => n.id === route)?.label ?? 'Quadly'}`;
  }, [route]);

  useEffect(() => {
    const sync = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    if (!menuOpen && !practiceMenuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setPracticeMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, practiceMenuOpen]);

  const navigate = (id) => {
    const path = navPath(id);
    if (window.location.pathname.replace(/\/+$/, '') !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(id);
    setMenuOpen(false);
    setPracticeMenuOpen(false);
    window.scrollTo(0, 0);
  };

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
                      aria-expanded={practiceMenuOpen}
                      onClick={() => setPracticeMenuOpen((o) => !o)}
                    >
                      {n.label}
                      <span className={`qd-chev${practiceMenuOpen ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
                    </button>
                    {practiceMenuOpen && (
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

      {(menuOpen || practiceMenuOpen) && (
        <button
          type="button"
          className="qd-top__outside"
          aria-label="Close menu"
          onClick={() => { setMenuOpen(false); setPracticeMenuOpen(false); }}
        />
      )}

      {/* Home waits on the rebuilt feed; the Practice surfaces are live. */}
      {route === 'practice/daily' && <main className="qd-home"><PracticePage /></main>}
      {route === 'practice/interviews' && <main className="qd-home"><InterviewsPage /></main>}
      {route === 'practice/contests' && <main className="qd-home"><ContestsPage /></main>}
      {route === 'practice/replay' && <main className="qd-home"><ReplayPage /></main>}
      {route === 'app' && <main className="qd-home" aria-label="Home" />}
    </div>
  );
}
