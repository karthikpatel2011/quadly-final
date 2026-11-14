import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../workspace.css';
import './interviews.css';

/* Post-interview performance report — every claim is derived from the stored
   transcript; scores are transparent coaching estimates, not hiring
   predictions. Download keeps the full JSON. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const gotoRoute = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

export default function InterviewReport() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session') ?? '';
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(null); // which answer's detail is expanded

  const load = useCallback(() => {
    setPhase('loading');
    apiFetch(`/interviews/session/${sessionId}`, { headers: authHeaders() })
      .then((res) => { setSession(res.interview); setPhase('ready'); })
      .catch((err) => {
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        setError(err.message);
        setPhase('error');
      });
  }, [sessionId]);

  useEffect(() => { if (sessionId) load(); else { setError('No session id.'); setPhase('error'); } }, [load, sessionId]);

  const download = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${session.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase === 'loading') {
    return <div className="qd-ivrhome"><div className="qd-iv-room skeleton" style={{ height: 260 }} /></div>;
  }
  if (phase === 'error') {
    return (
      <div className="qd-ivrhome" role="alert">
        <div className="qd-ivr"><div className="qd-iv-room qd-p__err">
          <h2 className="qd-h2">The report couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div></div>
      </div>
    );
  }

  const rep = session.report;
  const candTurns = session.transcript.filter((t) => t.role === 'candidate');

  if (session.status !== 'completed' || !rep) {
    return (
      <div className="qd-ivrhome">
        <div className="qd-ivr">
          <div className="qd-iv-room">
            <p className="qd-iv-question">This interview hasn’t been completed yet.</p>
            <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute(`/app/interviews/mock?session=${session.id}`)}>Back to the room</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qd-ivrhome">
      <div className="qd-ivr">
        <header className="qd-iv-boardhead">
          <div>
            <p className="qd-kicker">Performance report · {session.company} · {session.role}</p>
            <h2 className="qd-h2">{rep.overall}/100 — {rep.verdict}</h2>
            <p className="qd-muted">{rep.summary}{rep.mode === 'ai' ? ' · evaluated by AI' : ' · evaluated by transparent rules (formula shown per answer)'}</p>
          </div>
          <button type="button" className="qd-btn qd-btn--ghost" onClick={download}>Download report</button>
        </header>

        <p className="qd-iv-capsnote" role="note">
          Coaching estimates from your actual words — not a prediction of any hiring decision.
        </p>

        <div className="qd-iv-stats">
          {(rep.skills ?? []).map((s) => (
            <div key={s.name} className="qd-iv-stat">
              <b>{s.score}/100</b>
              <span>{s.name}</span>
              <div className="qd-bar"><i style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }} /></div>
            </div>
          ))}
        </div>

        <h3 className="qd-iv-section">Answer by answer</h3>
        {(rep.answers ?? []).map((a, i) => (
          <div key={i} className="qd-iv-answer">
            <button type="button" className="qd-iv-answerhead" onClick={() => setOpen(open === i ? null : i)}>
              <b>Q{i + 1} · {a.score}/100</b>
              <span>{a.question.length > 80 ? a.question.slice(0, 80) + '…' : a.question}</span>
            </button>
            {open === i && (
              <div className="qd-iv-answerbody">
                <p className="qd-fb__note"><b>You said:</b> “{a.answer}”</p>
                <p className="qd-fb__note">✓ {a.good}</p>
                <p className="qd-fb__note">✗ {a.missing}</p>
                <p className="qd-fb__note">{a.improve}</p>
              </div>
            )}
          </div>
        ))}

        {/* One debrief card: strengths, gaps, and the next plan are one story. */}
        <div className="qd-iv-room">
          <h3 className="qd-iv-section" style={{ marginTop: 0 }}>Top strengths</h3>
          <ul className="qd-outline">{(rep.strengths ?? []).map((x) => <li key={x}>{x}</li>)}</ul>
          <h3 className="qd-iv-section">Gaps to close</h3>
          <ul className="qd-outline">{(rep.gaps ?? []).map((x) => <li key={x}>{x}</li>)}</ul>
          {rep.nextSteps?.length > 0 && (
            <>
              <h3 className="qd-iv-section">Your plan for the next attempt</h3>
              <ul className="qd-outline">{rep.nextSteps.map((x) => <li key={x}>{x}</li>)}</ul>
            </>
          )}
        </div>

        <div className="qd-act__actions">
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/interviews/setup')}>Run another interview</button>
          <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/interviews/dash')}>Back to Interviews</button>
          <span className="qd-iv-words">{candTurns.length} answers in the transcript</span>
        </div>
      </div>
    </div>
  );
}
