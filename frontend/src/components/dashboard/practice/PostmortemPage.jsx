import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import { gotoRoute } from './PracticeHome.jsx';

// Postmortem & Defend — the write-up after the incident. A fixed template,
// a rubric the code partly computes (the root-cause call comes from the
// attempt itself), revisions with visible score change, then the defend
// step: two or three follow-up questions about the student's own choices.
// The defend step is part of the paid plan; everything else stays free.

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
  };
}

const SECTIONS = [
  { id: 'happened', label: 'What happened', placeholder: 'The timeline, plainly: what failed, for whom, starting when.' },
  { id: 'impact', label: 'Impact', placeholder: 'Users, requests, minutes — the numbers you saw in the room.' },
  { id: 'rootCause', label: 'Root cause', placeholder: 'The one cause the evidence actually supported.' },
  { id: 'fix', label: 'How it was fixed', placeholder: 'What you did to make the service healthy again.' },
  { id: 'prevention', label: 'How to prevent it', placeholder: 'Concrete follow-up work — alerts, gates, checks, automation.' },
];

const RUBRIC_META = {
  specific: { label: 'Specific', weight: 25 },
  blameless: { label: 'Blameless', weight: 15 },
  actionable: { label: 'Actionable', weight: 20 },
  rootCause: { label: 'Correct root cause', weight: 40 },
};

export default function PostmortemPage() {
  const attemptId = new URLSearchParams(window.location.search).get('attempt') || '';
  const [phase, setPhase] = useState(attemptId ? 'ready' : 'missing');
  const [body, setBody] = useState({ happened: '', impact: '', rootCause: '', fix: '', prevention: '' });
  const [saved, setSaved] = useState(null);      // { version, score, scoreChange, review, defendQuestions }
  const [defends, setDefends] = useState({});    // questionId -> answer text
  const [defendResult, setDefendResult] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [existing, setExisting] = useState(null); // earlier versions from the work record

  const load = useCallback(async (fillFromRecord) => {
    setBusy('load');
    try {
      const rec = await apiFetch(`/practice/work-record/${encodeURIComponent(attemptId)}`, { headers: authHeaders() });
      const latest = rec.record?.postmortem?.versions?.[rec.record.postmortem.current - 1] || null;
      if (latest?.body) setBody(latest.body);
      setExisting(rec.record?.postmortem || null);
      if (fillFromRecord && rec.record) setPhase('ready');
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      if (/No such attempt|not resolved/i.test(e.message)) { setNotice({ kind: 'error', text: e.message }); return; }
      setNotice({ kind: 'error', text: e.message || 'The practice server could not be reached.' });
    } finally {
      setBusy(null);
    }
  }, [attemptId]);

  useEffect(() => {
    if (attemptId) load(true);
  }, [attemptId, load]);

  useEffect(() => { document.title = 'Quadly — Postmortem'; }, []);

  const save = async () => {
    if (busy) return;
    setBusy('save');
    setNotice(null);
    try {
      const res = await apiFetch('/practice/postmortems', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ attemptId, body }),
      });
      setSaved(res);
      setNotice({ kind: 'ok', text: `Version ${res.version} saved.` });
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  const defend = async () => {
    if (busy || !saved) return;
    const answers = saved.defendQuestions
      .map((q) => ({ questionId: q.id, text: defends[q.id] || '' }))
      .filter((a) => a.text.trim().length >= 10);
    if (answers.length === 0) {
      setNotice({ kind: 'error', text: 'Answer at least one question first.' });
      return;
    }
    setBusy('defend');
    try {
      const res = await apiFetch(`/practice/postmortems/${encodeURIComponent(attemptId)}/defend`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ answers }),
      });
      setDefendResult(res.result);
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  const viewRecord = () => gotoRoute(`/app/practice/record?attempt=${encodeURIComponent(attemptId)}`);

  if (!attemptId) {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">No incident selected</h2>
          <p className="qd-muted">Resolve an incident first — the postmortem is the write-up after it.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qd-pr">
      <header className="qd-pr-head">
        <div>
          <p className="qd-kicker">Postmortem</p>
          <h2 className="qd-h2">Write down what happened.</h2>
          <p className="qd-muted">A blameless record of the incident scores on four things: specific, blameless, actionable, and the root cause your own evidence pointed to.</p>
        </div>
        <div className="qd-pr-level">
          {existing && existing.current > 0 && <span className="qd-pill">Version {existing.current}</span>}
        </div>
      </header>

      {notice && (
        <p className={`qd-pr-notice${notice.kind === 'error' ? ' is-error' : ''}`} role="status">{notice.text}</p>
      )}

      <div className="qd-pr-pmgrid">
        <section className="qd-card qd-pr-pmeditor" aria-label="Postmortem editor">
          {SECTIONS.map((s) => (
            <div key={s.id} className="qd-pr-pmsection">
              <label className="qd-pr-fieldlabel" htmlFor={`qd-pm-${s.id}`}>{s.label}</label>
              <textarea
                id={`qd-pm-${s.id}`}
                className="qd-input qd-pr-pmarea"
                placeholder={s.placeholder}
                rows={s.id === 'happened' || s.id === 'prevention' ? 5 : 3}
                value={body[s.id] || ''}
                onChange={(e) => setBody((b) => ({ ...b, [s.id]: e.target.value }))}
              />
            </div>
          ))}
          <div className="qd-act__actions">
            <button type="button" className="qd-btn qd-btn--primary" onClick={save} disabled={busy === 'save'}>
              {saved ? 'Save a new version' : 'Save and get the critique'}
            </button>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={viewRecord}>Open the work record</button>
          </div>
        </section>

        <div className="qd-pr-pmside">
          <section className="qd-card qd-pr-critique" aria-label="Critique">
            <p className="qd-kicker">The rubric</p>
            {!saved ? (
              <p className="qd-muted">Save a draft and the critique appears here. Without an AI key, a plain rules checklist grades it — the numbers always come from code.</p>
            ) : (
              <>
                <p className="qd-pr-scoreline">
                  <b>{saved.score}/100</b>
                  {saved.scoreChange !== null && (
                    <span className={`qd-pr-delta${saved.scoreChange >= 0 ? ' is-ok' : ' is-no'}`}>
                      {saved.scoreChange >= 0 ? '+' : ''}{saved.scoreChange} since the last version
                    </span>
                  )}
                </p>
                <ul className="qd-pr-rubriclist">
                  {Object.entries(RUBRIC_META).map(([id, meta]) => {
                    const met = saved.review.dims[id];
                    return (
                      <li key={id} className={`qd-pr-rubric${met ? ' is-met' : ' is-missed'}`}>
                        <span className="qd-pr-rubrichead">{meta.label}<i>{met ? `+${meta.weight}` : '+0'}</i></span>
                        <span>{saved.review.notes[id]}</span>
                      </li>
                    );
                  })}
                </ul>
                {saved.review.summary && <p className="qd-pr-critique">{saved.review.summary}</p>}
                <p className="qd-muted qd-pr-sourceline">Critique by {saved.review.source === 'ai' ? 'the AI reviewer' : 'the rules checklist'} — the score is computed by code.</p>
              </>
            )}
          </section>

          {saved && (
            <section className="qd-card qd-pr-defend" aria-label="Defend your postmortem">
              <p className="qd-kicker">Defend it</p>
              <p className="qd-muted">Your reviewer asks {saved.defendQuestions.length} follow-ups about the choices you made. Answers score by the points they actually cover.</p>
              <ol className="qd-pr-dqlist">
                {saved.defendQuestions.map((q) => (
                  <li key={q.id} className="qd-pr-dq">
                    <p className="qd-pr-dqtext">{q.question}</p>
                    <textarea
                      className="qd-input qd-pr-pmarea"
                      rows={3}
                      placeholder="Say it the way you would in the room."
                      value={defends[q.id] || ''}
                      onChange={(e) => setDefends((d) => ({ ...d, [q.id]: e.target.value }))}
                    />
                  </li>
                ))}
              </ol>
              {saved.entitlements?.defendStep ? (
                <button type="button" className="qd-btn qd-btn--primary" onClick={defend} disabled={busy === 'defend'}>
                  Submit answers
                </button>
              ) : (
                <p className="qd-pr-gate" role="note">Defending the write-up is part of the paid plan. Writing, revising, and every incident stay free.</p>
              )}
              {defendResult && (
                <div className="qd-pr-defresult" role="status">
                  <p><b>{defendResult.score}/100</b> on the defend step.</p>
                  <ul className="qd-pr-defperq">
                    {defendResult.per.map((p) => (
                      <li key={p.questionId}>{p.covered}/{p.total} key points covered</li>
                    ))}
                  </ul>
                  <button type="button" className="qd-btn qd-btn--ghost" onClick={viewRecord}>Open the work record</button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
