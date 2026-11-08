import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './squad.css';
import './dashboard.css';

/* Squad — study groups of 2–4 with a shareable join code and honest
   accountability: "done today" comes only from a squadmate's live session
   (no live session ⇒ shown as offline, never guessed). Nudges are polite by
   design: 2 per sender per day, quiet hours 10 PM–6 AM IST. The page polls
   while open so presence stays fresh (the backend contract expects it). */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

function memberName(m) {
  return m.name || (m.email ? m.email.split('@')[0] : 'Squadmate');
}

export default function SquadPage() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [state, setState] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const load = useCallback(() => {
    apiFetch('/squad/state', { headers: authHeaders() })
      .then((res) => { setState(res); setPhase('ready'); setError(''); })
      .catch((err) => {
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 45000); // keep presence fresh while the page is open
    return () => clearInterval(timerRef.current);
  }, [load]);

  const act = async (path, body, successNote) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body ?? {}) });
      setState(res);
      if (successNote) setNotice(successNote);
      return true;
    } catch (err) {
      setNotice(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(state.squad.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice('Copy failed — select the code manually.');
    }
  };

  if (phase === 'loading') {
    return <div className="qd-home"><div className="qd-card skeleton" style={{ height: 240 }} /></div>;
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

  const squad = state?.squad ?? null;

  return (
    <div className="qd-home">
      <header className="qd-sq-head">
        <div>
          <p className="qd-kicker">Squad</p>
          <h2 className="qd-h2">{squad ? squad.name : 'Study with two to four friends.'}</h2>
          <p className="qd-muted">
            One code, honest accountability: see who finished today’s work, and nudge —
            politely — who didn’t. Two nudges a day, nobody gets buzzed after 10 PM IST.
          </p>
        </div>
      </header>
      {notice && <p className="qd-sq-notice" role="status">{notice}</p>}

      {!squad ? (
        <section className="qd-card qd-sq-join" aria-label="Start or join a squad">
          <p className="qd-muted">Create a squad and share the code with up to three friends — or join theirs. Same streak, same rules.</p>

          <div className="qd-sq-option">
            <b className="qd-sq-optiontitle">Start a new one</b>
            <input
              className="qd-sq-input"
              placeholder="Squad name (optional)"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="button"
              className="qd-btn qd-btn--primary qd-btn--block"
              disabled={busy}
              onClick={() => act('/squad/create', { name }, 'Squad created — share the code below.')}
            >
              {busy ? 'Working…' : 'Create my squad'}
            </button>
          </div>

          <div className="qd-sq-divider" role="separator"><span>or join with a code</span></div>

          <div className="qd-sq-option">
            <div className="qd-sq-coderow">
              <input
                className="qd-sq-input qd-sq-codeinput"
                placeholder="A1B2C3"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              />
              <button
                type="button"
                className="qd-btn"
                disabled={busy || code.trim().length !== 6}
                onClick={() => act('/squad/join', { code: code.trim() }, 'You\u2019re in the squad.')}
              >
                Join
              </button>
            </div>
          </div>
        </section>
            ) : (
        <>
          <section className="qd-card qd-sq-codecard" aria-label="Squad code">
            <div>
              <p className="qd-sq-codelabel">Join code — share it with up to {Math.max(0, squad.maxMembers - squad.members.length)} more friend{Math.max(0, squad.maxMembers - squad.members.length) === 1 ? '' : 's'}</p>
              <p className="qd-sq-code">{squad.code}</p>
            </div>
            <button type="button" className="qd-btn" onClick={copyCode}>{copied ? 'Copied ✓' : 'Copy code'}</button>
          </section>

          <section className="qd-card qd-sq-members" aria-label="Squad members">
            <div className="qd-sq-membershead">
              <h3 className="qd-iv-section" style={{ margin: 0 }}>{squad.members.length}/{squad.maxMembers} members</h3>
              <span className="qd-pill">{squad.nudgesLeft}/{squad.nudgeCap} nudges left today</span>
            </div>
            <ul className="qd-sq-list">
              {squad.members.map((m) => (
                <li key={m.email} className="qd-sq-row">
                  <span className={`qd-sq-dot${m.online ? ' is-online' : ''}`} aria-hidden="true" />
                  <div className="qd-sq-rowmain">
                    <b>{m.isMe ? 'You' : memberName(m)}</b>
                    <span>
                      {m.online
                        ? (m.doneToday ? 'Finished today ✓' : 'Hasn’t finished today yet')
                        : 'Offline — no live session, no judgement'}
                    </span>
                  </div>
                  <div className="qd-sq-rowend">
                    {m.doneToday && <span className="qd-pill qd-pill--tiny qd-sq-donepill">done</span>}
                    {!m.isMe && (
                      <button
                        type="button"
                        className="qd-btn"
                        disabled={busy || squad.nudgesLeft <= 0 || squad.quiet.active}
                        title={squad.quiet.active ? `Quiet hours ${squad.quiet.window}` : `Nudge ${memberName(m)}`}
                        onClick={() => act('/squad/nudge', { member: m.email }, `Nudged ${memberName(m)}.`)}
                      >
                        Nudge
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {squad.quiet.active && (
              <p className="qd-sq-quiet" role="status">
                Quiet hours ({squad.quiet.window}) — nudges reopen after 6 AM IST.
              </p>
            )}
            <button
              type="button"
              className="qd-linkish"
              style={{ marginTop: 10 }}
              disabled={busy}
              onClick={() => { if (window.confirm('Leave this squad? The code keeps working for the rest.')) act('/squad/leave'); }}
            >
              Leave squad
            </button>
          </section>
        </>
      )}
    </div>
  );
}
