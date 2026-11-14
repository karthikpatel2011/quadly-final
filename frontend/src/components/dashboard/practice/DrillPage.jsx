import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import { gotoRoute } from './PracticeHome.jsx';

// Daily Drill — one moment from an incident, five minutes, one question:
// what went wrong, and what would you check next? Instant feedback, the
// one-line takeaway, and tomorrow's teaser. The streak moves only when a
// drill is actually answered.

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
  };
}

export default function DrillPage() {
  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(null);
  const [pick, setPick] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errShown, setErrShown] = useState('');

  const load = useCallback(() => {
    setPhase('loading');
    const ctrl = new AbortController();
    apiFetch('/practice/drill/today', { headers: authHeaders(), signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        setData(res);
        setResult(res.result || null);
        setPhase('ready');
      })
      .catch((e) => {
        if (ctrl.signal.aborted || e.name === 'AbortError') return;
        if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
        setErrShown(e.message || '');
        setPhase('error');
      });
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => { document.title = 'Quadly — Daily drill'; }, []);

  const answer = async () => {
    if (busy || pick === null || !data?.drill) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/practice/drill/${encodeURIComponent(data.drill.id)}/answer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ optionIndex: pick }),
      });
      setResult(res.result);
      if (res.teaser?.text) setData((d) => ({ ...d, teaserText: res.teaser.text }));
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      setErrShown(e.message || '');
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-card skeleton" style={{ height: 280 }} />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-pr qd-pr-narrow">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">The drill didn’t load</h2>
          <p className="qd-muted">{errShown || 'Check your connection and try again.'}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { setPhase('loading'); load(); }}>Retry</button>
        </div>
      </div>
    );
  }

  const { drill, season, streak } = data;
  const answered = Boolean(result);
  const m = drill.moment;

  return (
    <div className="qd-pr qd-pr-narrow">
      <header className="qd-pr-head">
        <div>
          <p className="qd-kicker">Daily drill · about 5 minutes</p>
          <h2 className="qd-h2">{m.title}</h2>
          {season?.name && <p className="qd-muted">Season: {season.name}</p>}
        </div>
        {streak?.streak > 0 && <span className="qd-pill">{streak.streak}-day streak</span>}
      </header>

      <section className="qd-card qd-pr-drill" aria-label="Today's drill">
        {(m.kind === 'log' || m.kind === 'error' || m.kind === 'config' || m.kind === 'metric') && m.lines && (
          <div className="qd-pr-snippet" aria-label="The snippet">
            {m.lines.map((line, i) => <code key={i} className="qd-pr-logline">{line}</code>)}
          </div>
        )}
        {m.data && (
          <dl className="qd-pr-metrics">
            {m.data.map((row, i) => (
              <div key={i}><dt>{row.label}</dt><dd>{row.value}</dd></div>
            ))}
          </dl>
        )}

        <p className="qd-pr-question">{m.question}</p>

        {!answered ? (
          <>
            <div className="qd-pr-opts" role="radiogroup" aria-label="Answer options">
              {m.options.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={pick === i}
                  className={`qd-pr-opt${pick === i ? ' is-on' : ''}`}
                  onClick={() => setPick(i)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button type="button" className="qd-btn qd-btn--primary" onClick={answer} disabled={busy || pick === null}>
              Answer
            </button>
          </>
        ) : (
          <div className="qd-pr-feedback">
            <p className={`qd-pr-verdict${result.correct ? ' is-ok' : ' is-no'}`} role="status">
              {result.correct ? 'Correct' : 'Not this one'}
            </p>
            <p className="qd-pr-why">{result.why}</p>
            <p className="qd-pr-takeaway">{result.takeaway}</p>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
          </div>
        )}
      </section>

      {answered && (
        <section className="qd-card qd-pr-tomorrow" aria-label="Tomorrow">
          <p className="qd-kicker">Tomorrow</p>
          <p className="qd-muted">{data.teaserText || 'A new moment from the same season of incidents.'}</p>
        </section>
      )}
    </div>
  );
}
