import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import { Icon } from './icons.jsx';
import './dashboard.css';
import Logo from '../Logo.jsx';

/* Signed-in dashboard shell: chrome only — wordmark, theme toggle, account
   menu. No nav items, no feature surfaces, no placeholder text: every route
   under /app renders the same empty Home until a rebuilt surface ships (new
   surfaces get added back through the nav as they land). The 401 gate and
   the verified sign-out stay, since they are real behavior, not content. */

const THEME_KEY = 'quadly:theme';

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
    document.title = 'Quadly';
  }, []);

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

      {menuOpen && (
        <button
          type="button"
          className="qd-top__outside"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Home is intentionally blank — content returns with the rebuilt surfaces. */}
      <main className="qd-home" aria-label="Home" />
    </div>
  );
}
