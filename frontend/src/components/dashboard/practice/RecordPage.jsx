import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import { gotoRoute } from './PracticeHome.jsx';

// Work record — the private proof: the incident, the path the student took,
// the score, the postmortem and its revisions, the defend result. Sharing
// is an explicit action: a read-only link with no identity attached.

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
  };
}

export default function RecordPage() {
  const attemptId = new URLSearchParams(window.location.search).get('attempt') || '';
  const [phase, setPhase] = useState('loading'); // loading | ready | error | missing | unresolved
  const [record, setRecord] = useState(null);
  const [share, setShare] = useState(null); // { enabled, token }
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!attemptId) { setPhase('missing'); return; }
    setPhase('loading');
    const ctrl = new AbortController();
    apiFetch(`/practice/work-record/${encodeURIComponent(attemptId)}`, { headers: authHeaders(), signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        setRecord(res.record);
        setShare(res.share);
        setPhase('ready');
      })
      .catch((e) => {
        if (ctrl.signal.aborted || e.name === 'AbortError') return;
        if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
        if (/not resolved/i.test(e.message)) { setPhase('unresolved'); return; }
        if (/No such/i.test(e.message)) { setPhase('missing'); return; }
        setNotice({ kind: 'error', text: e.message || '' });
        setPhase('error');
      });
    return ctrl;
  }, [attemptId]);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => { document.title = 'Quadly — Work record'; }, []);

  const toggleShare = async (next) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/practice/work-record/${encodeURIComponent(attemptId)}/share`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ share: next }),
      });
      setShare({ enabled: res.enabled, token: res.token });
      setNotice({ kind: 'ok', text: next ? 'The read-only link is live.' : 'The link is revoked.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-card skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  if (phase === 'missing') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">No such record</h2>
          <p className="qd-muted">Work records exist per incident attempt — yours appear under recent work on the Practice home.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
        </div>
      </div>
    );
  }

  if (phase === 'unresolved') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">Finish the incident first</h2>
          <p className="qd-muted">The record is the proof after the rescue — resolve the incident, then open it here.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute(`/app/practice/incident?attempt=${encodeURIComponent(attemptId)}`)}>Back to the incident</button>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">The record didn’t load</h2>
          <p className="qd-muted">{notice?.text || 'Check your connection and try again.'}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { setPhase('loading'); load(); }}>Retry</button>
        </div>
      </div>
    );
  }

  const s = record.scenario;
  const pm = record.postmortem;
  const pmLatest = pm?.versions?.[pm.current - 1] || null;

  return (
    <div className="qd-pr qd-pr-narrow">
      <header className="qd-pr-head">
        <div>
          <p className="qd-kicker">Work record</p>
          <h2 className="qd-h2">{s.title}</h2>
          <p className="qd-muted">
            Modeled on a public postmortem by {s.company}. {s.level ? `Level ${s.level}` : ''} · {s.minutes} minutes.
          </p>
        </div>
        <div className="qd-pr-level">
          <span className="qd-pill">{record.score ? `${record.score.total}/100` : 'Unscored'}</span>
        </div>
      </header>

      {notice && (
        <p className={`qd-pr-notice${notice.kind === 'error' ? ' is-error' : ''}`} role="status">{notice.text}</p>
      )}

      <section className="qd-card qd-pr-recsec" aria-label="The path">
        <p className="qd-kicker">The path you took</p>
        <ol className="qd-pr-tllist">
          {record.path.timeline.map((row, i) => (
            <li key={i} className={`qd-pr-tlrow qd-pr-tlrow--${row.kind}`}>
              <span className="qd-pr-tlmin">{row.atSimMin}m</span>
              <span className="qd-pr-tlbody">
                {row.kind === 'action' ? <b>{row.label}</b> : row.text}
              </span>
            </li>
          ))}
        </ol>
        {record.path.hypothesis && (
          <>
            <p className="qd-kicker">Your hypothesis</p>
            <p className="qd-pr-linelg">{record.path.hypothesis}</p>
          </>
        )}
      </section>

      <section className="qd-card qd-pr-recsec" aria-label="Postmortem">
        <p className="qd-kicker">Postmortem</p>
        {pmLatest ? (
          <>
            <dl className="qd-pr-pmview">
              <div><dt>What happened</dt><dd>{pmLatest.body.happened}</dd></div>
              <div><dt>Impact</dt><dd>{pmLatest.body.impact}</dd></div>
              <div><dt>Root cause</dt><dd>{pmLatest.body.rootCause}</dd></div>
              <div><dt>How it was fixed</dt><dd>{pmLatest.body.fix}</dd></div>
              <div><dt>Prevention</dt><dd>{pmLatest.body.prevention}</dd></div>
            </dl>
            {pm.versions.length > 1 && (
              <p className="qd-muted qd-pr-versionline">
                Revisions: {pm.versions.map((v) => `v${v.n} — ${v.score}/100`).join(' · ')}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="qd-muted">No postmortem yet. Writing one is the part interviewers actually ask about.</p>
            <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute(`/app/practice/postmortem?attempt=${encodeURIComponent(attemptId)}`)}>Write the postmortem</button>
          </>
        )}
      </section>

      {record.defend && (
        <section className="qd-card qd-pr-recsec" aria-label="Defend">
          <p className="qd-kicker">Defend</p>
          <p><b>{record.defend.score}/100</b> on the follow-up questions about your choices.</p>
        </section>
      )}

      <section className="qd-card qd-pr-recsec" aria-label="Share">
        <p className="qd-kicker">Share</p>
        <p className="qd-muted">Private by default. Sharing publishes a read-only link with the work — never your name or email.</p>
        {!share?.enabled ? (
          <button
            type="button"
            className="qd-btn qd-btn--primary"
            onClick={() => toggleShare(true)}
            disabled={busy || !pmLatest}
            title={!pmLatest ? 'Write the postmortem first — a shared record is the write-up, not the score' : undefined}
          >
            Create a read-only link
          </button>
        ) : (
          <>
            <code className="qd-pr-sharelink">{window.location.origin}/shared-record/{share.token}</code>
            <div className="qd-act__actions">
              <button
                type="button"
                className="qd-btn qd-btn--ghost"
                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/shared-record/${share.token}`).then(() => setNotice({ kind: 'ok', text: 'Link copied.' }))}
              >
                Copy link
              </button>
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => toggleShare(false)} disabled={busy}>Revoke link</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
