import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './squad.css';
import './dashboard.css';
import { Icon } from './icons.jsx';

/* Squad v2 — a private 3–5 person group with a SHARED streak built from
   verified tasks in the student accounts store (no checkboxes anywhere).
   Design contract: rich detail in exactly three places — the join code, the
   WhatsApp invite, and the board's hierarchy — minimal everywhere else.
   Calm words: Away members are not shamed, a broken streak gets a clean
   restart line. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});
const CACHE_KEY = 'quadly:squadCache';

export default function SquadPage() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [board, setBoard] = useState(null);
  const [offline, setOffline] = useState(false);
  const [mode, setMode] = useState('choose'); // choose | create | join
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [typed, setTyped] = useState('');
  const prefillRef = useRef(null);
  const pollRef = useRef(null);

  const api = (path, method = 'GET', body = null) => apiFetch(path, { method, headers: authHeaders(), body: body ? JSON.stringify(body) : undefined });

  const load = useCallback((silent = false) => {
    if (!silent) setPhase('loading');
    apiFetch('/squads/me', { headers: authHeaders() })
      .then(async (me) => {
        if (me.squad) {
          const boardRes = await apiFetch(`/squads/${me.squad.id}/board`, { headers: authHeaders() });
          setBoard(boardRes.board);
          setOffline(false);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), board: boardRes.board })); } catch { /* storage */ }
          setPhase('ready');
          return;
        }
        setBoard(null);
        setOffline(false);
        setPhase('ready');
      })
      .catch((err) => {
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { /* none */ }
        if (cached?.board) {
          setBoard(cached.board);
          setOffline(true);
          setPhase('ready');
          return;
        }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => {
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem('quadly:pendingInvite') || 'null'); } catch { /* none */ }
    if (pending?.code) {
      setMode('join');
      setCode(pending.code);
      prefillRef.current = pending.token ?? null;
      sessionStorage.removeItem('quadly:pendingInvite');
    }
    load();
    pollRef.current = setInterval(() => load(true), 30000); // real-time via polling fallback
    return () => clearInterval(pollRef.current);
  }, [load]);

  const boardAct = useCallback(async (fn) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await fn();
      if (res && res.board) setBoard(res.board);
      if (res && res.deletedSquad) {
        setBoard(null);
        load(true);
      }
      return res;
    } catch (err) {
      setNotice(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  // A correct replay of a wrong answer never happens here; joining uses the
  // pending invite token when one exists (deep links).
  const doJoin = async (codeSix) => {
    setBusy(true);
    setJoinError('');
    try {
      const res = await api('/squads/join', 'POST', { code: codeSix, pendingToken: prefillRef.current });
      setBoard(res.board);
      prefillRef.current = null;
      load(true);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Milestone celebration fires once per fresh sweep result (7/14/30 days).
  useEffect(() => {
    const hit = board?.streak?.milestone;
    if (hit) {
      setCelebrate(hit);
      const t = setTimeout(() => { setCelebrate(null); setBoard((b) => (b ? { ...b, streak: { ...b.streak, milestone: null } } : b)); }, 2600);
      return () => clearTimeout(t);
    }
  }, [board?.streak?.milestone]);

  const shareInvite = async () => {
    const url = `${window.location.origin}${board.invite.joinUrl}`;
    const text = `Join my Quadly squad and keep each other on track. Code: ${board.code}. ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Quadly squad', text, url }); return; } catch { /* cancelled → fall through */ }
    }
    window.open(board.invite.whatsapp, '_blank', 'noopener');
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      setNotice('Clipboard blocked — write it down.');
      return false;
    }
  };

  const leave = () => {
    if (!window.confirm('Leave this squad? Two taps and it’s done.')) return;
    if (!window.confirm('Really leave? Your shared streak continues without you.')) return;
    boardAct(async () => {
      const r = await api(`/squads/${board.id}/leave`, 'POST');
      return { ...r, deletedSquad: r.deletedSquad };
    });
  };

  if (phase === 'loading') {
    return <div className="qd-home"><div className="qd-card skeleton" style={{ height: 250 }} /></div>;
  }

  if (phase === 'error') {
    return (
      <div className="qd-home" role="alert">
        <div className="qd-card qd-p__err">
          <h2 className="qd-h2">Squad couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  if (offline) {
    return (
      <div className="qd-home" role="status">
        <div className="qd-card">
          <h2 className="qd-h2">{board?.name ?? 'Squad'} — offline</h2>
          <p className="qd-muted">You’re offline, so this is the last saved board (read-only). Reconnect for fresh progress and nudges.</p>
        </div>
      </div>
    );
  }

  if (!board) {
    if (mode === 'join') {
      return (
        <div className="qd-home">
          <section className="qd-card qd-sq-join" aria-label="Join a squad">
            <p className="qd-muted">
              {prefillRef.current ? 'Welcome back — your invite is waiting. Enter its code.' : 'Ask your friend for the six-character code from their squad board.'}
            </p>
            <CodeBoxes
              value={code}
              onChange={setCode}
              onSubmit={(six) => doJoin(six)}
              disabled={busy}
            />
            {joinError && <p className="qd-error" role="alert">{joinError}</p>}
            {notice && <p className="qd-sq-notice" role="status">{notice}</p>}
            <div className="qd-act__actions">
              <button type="button" className="qd-cta qd-cta--primary" disabled={busy || code.length !== 6} onClick={() => doJoin(code)}>
              <Icon name="hash" size={18} strokeWidth={1.75} />
              Join the squad
            </button>
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { setMode('choose'); setJoinError(''); }}>Back</button>
            </div>
          </section>
        </div>
      );
    }
    if (mode === 'create') {
      return (
        <div className="qd-home">
          <section className="qd-card qd-sq-join" aria-label="Create a squad">
            <p className="qd-muted">Name it (3–30 characters) and share the code with your people.</p>
            <input className="qd-sq-input" placeholder="Squad name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} autoFocus />
            {name.length > 0 && name.trim().length < 3 && <p className="qd-muted">A little longer — 3 to 30 characters.</p>}
            {notice && <p className="qd-sq-notice" role="status">{notice}</p>}
            <div className="qd-act__actions">
              <button type="button" className="qd-cta qd-cta--primary" disabled={busy || name.trim().length < 3} onClick={async () => {
                setBusy(true);
                try {
                  const res = await api('/squads', 'POST', { name: name.trim() });
                  setBoard(res.board);
                  load(true);
                } catch (err) { setNotice(err.message); } finally { setBusy(false); }
              }}>{busy ? 'Preparing the room…' : 'Create and get my code'}</button>
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { setMode('choose'); setName(''); }}>Back</button>
            </div>
          </section>
        </div>
      );
    }
    return (
      <div className="qd-home">
        <div className="qd-sq-hero" role="note">
          <div className="qd-sq-faces" aria-hidden="true">
            {[3, 9, 16, 27].map((n, i) => (
              <img key={n} className="qd-sq-face" src={`/avatars/${String(n).padStart(2, '0')}.webp`} alt="" style={{ zIndex: 4 - i }} />
            ))}
          </div>
          <p className="qd-sq-headline">Keep each other on track.</p>
          <p className="qd-sq-sub">In a small private squad of three to five people. Keep the daily streak, gentle nudges, nothing public.</p>

          <div className="qd-cta-row" role="group" aria-label="Join or create squad">
            <button type="button" className="qd-cta qd-cta--primary" onClick={() => setMode('create')}>
              <Icon name="plus" size={18} strokeWidth={2} />
              Create squad
            </button>
            <button type="button" className="qd-cta qd-cta--ghost" onClick={() => setMode('join')}>
              <Icon name="hash" size={18} strokeWidth={1.75} />
              Join squad
            </button>
          </div>
        </div>
        {notice && <p className="qd-sq-notice" role="status">{notice}</p>}
      </div>
    );
  }

    const notDone = board.members.filter((m) => !m.doneToday);
    const doneMembers = board.members.filter((m) => m.doneToday);
    const waiting = board.members.length < 3;

  return (
    <div className="qd-home">
      {celebrate && (
        <div className="qd-sq-celebrate" role="status">
          <b>{celebrate}-day squad streak</b>
          <span>Held. Same time tomorrow.</span>
        </div>
      )}

      <header className="qd-sq-head">
        <div>
          <p className="qd-kicker">Squad</p>
          <h2 className="qd-h2" title={board.name}>{board.name.length > 40 ? `${board.name.slice(0, 39)}…` : board.name}</h2>
        </div>
        <div className="qd-sq-menuwrap">
          <button type="button" className="qd-btn qd-btn--ghost" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>Settings</button>
          {menuOpen && (
            <div className="qd-sq-menu" role="menu">
              {board.isOwner && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); const n = window.prompt('New squad name (3–30 characters)', board.name); if (n && n.trim().length >= 3) boardAct(() => api(`/squads/${board.id}`, 'PATCH', { name: n.trim() })); }}>Rename</button>
              )}
              {board.isOwner && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); boardAct(() => api(`/squads/${board.id}/invite/reset`, 'POST')); }}>Reset invite code</button>
              )}
              {board.isOwner && (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); boardAct(() => api(`/squads/${board.id}`, 'PATCH', { freezeEnabled: !board.freeze.enabled })); }}>
                  {board.freeze.enabled ? 'Turn off this week’s freeze' : 'Turn on this week’s freeze'}
                </button>
              )}
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); boardAct(() => api(`/squads/${board.id}`, 'PATCH', { nudgesMuted: !board.members.find((m) => m.isMe)?.nudgesMuted })); }}>
                {board.members.find((m) => m.isMe)?.nudgesMuted ? 'Unmute nudges' : 'Mute nudges for me'}
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setReportOpen(true); }}>Report a member</button>
              <button type="button" role="menuitem" onClick={leave}>Leave squad</button>
            </div>
          )}
        </div>
      </header>

      <section className="qd-card qd-sq-streak" aria-label={`Shared streak ${board.streak.current} days`}>
        <p className="qd-sq-streaknum">{board.streak.current}</p>
        <p className="qd-sq-streakunit">day{board.streak.current === 1 ? '' : 's'} together</p>
        <p className="qd-sq-streakline">Everyone needs one task a day.</p>
        {board.today.complete && <span className="qd-pill qd-sq-donetoday">Day complete ✓</span>}
        {board.streak.current === 0 && !board.today.complete && (
          <p className="qd-muted">Fresh start — one complete squad day begins the streak.</p>
        )}
      </section>

      <p className="qd-sq-today" aria-live="polite">
        <b>{board.today.done} of {board.today.total}</b> done today{waiting ? ` · ${3 - board.members.length > 0 ? `${3 - board.members.length} more member${3 - board.members.length === 1 ? '' : 's'} needed to start the shared streak` : ' — the streak is running'}` : ''}
      </p>

      <section className="qd-card qd-sq-members" aria-label="Members">
        <ul className="qd-sq-list">
          {[...notDone.filter((m) => !m.away), ...notDone.filter((m) => m.away), ...doneMembers].map((m) => (
            <li key={m.id} className="qd-sq-row">
              <span className="qd-sq-avatar" aria-hidden="true">{m.initials}</span>
              <div className="qd-sq-rowmain">
                <b title={m.id}>{m.isMe ? 'You' : m.firstName}{m.role === 'owner' ? ' · owner' : ''}{m.away ? ' · away' : ''}</b>
                <span>
                  {m.away
                    ? 'Away for a while — not blocking the streak'
                    : m.doneToday
                      ? `Done, ${m.taskCount} task${m.taskCount === 1 ? '' : 's'}`
                      : m.isMe
                        ? 'Not finished yet — one task puts the squad over the line'
                        : 'Not yet'}
                </span>
              </div>
              <div className="qd-sq-rowend">
                {m.doneToday && <span className="qd-pill qd-sq-donepill">done</span>}
                {!m.isMe && !m.doneToday && !m.away && (
                  <button type="button" className="qd-btn" disabled={busy} onClick={() => boardAct(() => api(`/squads/${board.id}/nudge`, 'POST', { toId: m.id }))}>
                    Nudge
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {board.invite && (
        <section className="qd-card qd-sq-codecard" aria-label="Invite">
          <div>
            <p className="qd-sq-codelabel">Invite code — the board fills up to five</p>
            <p className="qd-sq-code">{board.code}</p>
          </div>
          <div className="qd-sq-inviteact">
            <button type="button" className="qd-btn" onClick={() => copy(board.code)}>{copied ? 'Copied' : 'Copy code'}</button>
            <button type="button" className="qd-btn" onClick={shareInvite}>Share on WhatsApp</button>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => copy(`${window.location.origin}${board.invite.joinUrl}`)}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            {board.isOwner && <button type="button" className="qd-linkish" onClick={() => boardAct(() => api(`/squads/${board.id}/invite/reset`, 'POST'))}>Reset code</button>}
          </div>
        </section>
      )}

      {(board.events.length > 0 || board.weeklyRecap) && (
        <section className="qd-card qd-sq-activity" aria-label="Recent activity">
          <h3 className="qd-iv-section" style={{ margin: '0 0 8px' }}>Recent activity</h3>
          <ul className="qd-sq-events">
            {board.weeklyRecap && <li key="recap">{board.weeklyRecap}</li>}
            {board.events.map((e, i) => <li key={`${i}-${e.text}`}>{e.text}</li>)}
          </ul>
        </section>
      )}

      {reportOpen && (
        <div className="qd-room-confirm" role="alertdialog" aria-label="Report a member">
          {!reportId ? (
            <>
              <p><b>Report a member</b></p>
              {board.members.filter((m) => !m.isMe).map((m) => (
                <button key={m.id} type="button" className="qd-sq-reportrow" onClick={() => setReportId(m.id)}>
                  {m.firstName}
                </button>
              ))}
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setReportOpen(false)}>Cancel</button>
            </>
          ) : (
            <>
              <p><b>What happened with {board.members.find((m) => m.id === reportId)?.firstName}?</b></p>
              <input className="qd-sq-input" placeholder="Short reason for a human reviewer" value={reportReason} maxLength={300} onChange={(e) => setReportReason(e.target.value)} />
              <div className="qd-act__actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { setReportOpen(false); setReportId(null); setReportReason(''); }}>Cancel</button>
                <button
                  type="button"
                  className="qd-btn qd-room-end"
                  disabled={busy || reportReason.trim().length < 3}
                  onClick={async () => {
                    boardAct(() => api(`/squads/${board.id}/report`, 'POST', { memberEmail: reportId, reason: reportReason.trim() }));
                    setReportOpen(false);
                    setReportId(null);
                    setReportReason('');
                    setNotice('Reported to a human reviewer.');
                  }}
                >
                  Send report
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {notice && <p className="qd-sq-notice" role="status">{notice}</p>}
      {joinError === '' ? null : <p className="qd-error" role="alert">{joinError}</p>}
    </div>
  );
}

function CodeBoxes({ value, onChange, onSubmit, disabled }) {
  const refs = useRef([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const spread = (text, from) => {
    const next = (value.slice(0, from) + text).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    onChange(next);
    return next;
  };
  return (
    <div className="qd-sq-boxes" role="group" aria-label="Six-character squad code">
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="qd-sq-box"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Character ${i + 1} of 6`}
          value={ch === ' ' ? '' : ch}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            if (!raw) { onChange((value.slice(0, i) + ' ' + value.slice(i + 1)).slice(0, 6)); return; }
            if (raw.length > 1) {
              const next = spread(raw, i);
              refFocusFor(refs, Math.min(5, i + raw.length - 1));
              if (next.length === 6 && !next.includes(' ')) onSubmit(next);
              return;
            }
            const next = spread(raw, i);
            refFocusFor(refs, Math.min(5, i + 1));
            if (next.length === 6 && !next.includes(' ')) onSubmit(next);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !chars[i] && i > 0) refFocusFor(refs, i - 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = (e.clipboardData.getData('text') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
            if (!pasted) return;
            const next = spread(pasted, i);
            refFocusFor(refs, Math.min(5, pasted.length - 1));
            if (next.length === 6 && !next.includes(' ')) onSubmit(next);
          }}
        />
      ))}
    </div>
  );
}

function refFocusFor(refs, index) {
  refs.current?.[index]?.focus?.();
}
