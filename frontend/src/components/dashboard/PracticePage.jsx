import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* Daily Practice player (PRD §5/§6) — one set a day: three new activities
   plus a review item, first try counts, three hint levels, instant feedback
   with the "why", a retry that never rewrites the record, and a one-line
   takeaway to say out loud. SQL activities run in the sandbox (free) and are
   graded on submit against the backend's own engine. */

const TYPE_LABELS = {
  'predict-output': 'Predict the output',
  'fix-the-bug': 'Fix the bug',
  'read-the-error': 'Read the error',
  'catch-the-ai': 'Catch the AI',
  'write-query': 'Write the query',
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

function DiffDots({ level }) {
  return (
    <span className="qd-diff" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= level ? 'is-on' : ''} aria-hidden="true" />
      ))}
    </span>
  );
}

function RowsTable({ columns, rows, label }) {
  return (
    <div className="qd-tablewrap">
      {label && <p className="qd-tablecap">{label}</p>}
      <table className="qd-table">
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PracticePage() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [hints, setHints] = useState({});   // id → { level, text }
  const [picks, setPicks] = useState({});   // id → chosen index
  const [results, setResults] = useState({}); // id → fresh answer feedback
  const [sql, setSql] = useState({});       // id → draft text
  const [runs, setRuns] = useState({});     // id → sandbox result
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setPhase('loading');
    apiFetch('/practice/daily', { headers: authHeaders() })
      .then((res) => {
        setData(res);
        setPhase('ready');
        setError('');
        const firstOpen = (res.items ?? []).findIndex((it) => !it.answered);
        setIndex(firstOpen === -1 ? 0 : firstOpen);
      })
      .catch((err) => {
        if (/401|Not signed in/i.test(err.message)) {
          window.location.assign('/join');
          return;
        }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const items = data?.items ?? [];
  const item = items[index];

  // A fresh answer from this session shows the full feedback panel; an
  // earlier-recorded answer shows a short honest recap.
  const freshResult = item ? results[item.id] : null;

  if (phase === 'loading') {
    return (
      <div className="qd-p">
        <div className="qd-card skeleton" style={{ height: 64 }} />
        <div className="qd-card skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-p" role="alert">
        <div className="qd-card qd-p__err">
          <h2 className="qd-h2">Practice couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  // The set is complete when every served item has a record (from the GET or
  // from this session). The done card waits until the last item's feedback
  // has been seen — the takeaway moment is the end that gets remembered.
  const setComplete = items.length > 0 && items.every((it) => it.answered || results[it.id]);
  const viewingLastFeedback = Boolean(item && freshResult);
  const firstOpenIdx = items.findIndex((it) => !it.answered && !results[it.id]);
  const unlockedMax = firstOpenIdx === -1 ? items.length - 1 : firstOpenIdx;

  const applyHint = async () => {
    const next = (hints[item.id]?.level ?? 0) + 1;
    if (next > 3) return;
    setBusy(true);
    try {
      const res = await apiFetch('/practice/daily/hint', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id: item.id, level: next }),
      });
      setHints((h) => ({ ...h, [item.id]: { level: res.level, text: res.hint } }));
    } catch (err) {
      setHints((h) => ({ ...h, [item.id]: { level: next, text: err.message } }));
    } finally {
      setBusy(false);
    }
  };

  const check = async () => {
    if (busy || freshResult) return;
    if (item.options && picks[item.id] === undefined) return;
    if (item.type === 'write-query' && !(sql[item.id] || '').trim()) return;
    setBusy(true);
    try {
      const body = item.type === 'write-query'
        ? { id: item.id, sql: sql[item.id] }
        : { id: item.id, choice: picks[item.id] };
      const res = await apiFetch('/practice/daily/answer', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      setResults((r) => ({ ...r, [item.id]: res }));
      setData((d) => ({
        ...d,
        score: res.score,
        answered: res.answered,
        done: res.done,
        items: d.items.map((it) => (
          it.id === item.id
            ? { ...it, answered: { correct: res.correct, firstTry: true } }
            : it
        )),
      }));
    } catch (err) {
      setResults((r) => ({ ...r, [item.id]: { error: err.message } }));
    } finally {
      setBusy(false);
    }
  };

  const runQuery = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await apiFetch('/practice/daily/run', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ id: item.id, sql: sql[item.id] }),
      });
      setRuns((r) => ({ ...r, [item.id]: res }));
    } catch (err) {
      setRuns((r) => ({ ...r, [item.id]: { error: err.message } }));
    } finally {
      setBusy(false);
    }
  };

  const goto = (i) => {
    if (i < 0 || i > unlockedMax || i === index) return;
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (unlockedMax > index) goto(index + 1);
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (setComplete && !viewingLastFeedback) {
    return (
      <div className="qd-p">
        <div className="qd-card qd-done">
          <p className="qd-kicker">Daily practice</p>
          <h2 className="qd-h2">Today’s set is done.</h2>
          <p className="qd-muted">
            <b>{data.score} of {data.total}</b> on the first try.
            {' '}Level {data.level} of 3 — it lifts after two good days and eases after two weak ones, never mid-set.
          </p>
          <p className="qd-muted">
            {items.some((it) => it.answered?.correct === false || (results[it.id] && !results[it.id].correct))
              ? 'The ideas you missed come back in 1, 3, and 7 days — your review slot is already reserved.'
              : 'Clean sweep. A fresh set opens after 4 am IST tomorrow.'}
          </p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { window.location.assign('/app'); }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const mcq = Boolean(item.options);
  const hint = hints[item.id];

  return (
    <div className="qd-p">
      <header className="qd-p__head">
        <div>
          <p className="qd-kicker">Daily practice</p>
          <h2 className="qd-h2">
            {items.length} activities. First try counts.
          </h2>
          <p className="qd-muted">
            {data.targetMinutes > data.servedMinutes
              ? `Planned for your ${data.targetMinutes} minutes — today’s opening set covers ${data.servedMinutes}. The bank grows daily, and so will the sets.`
              : 'Sized to the practice time you committed to — fresh material, your weak spots, and a review of what bit you.'}
          </p>
        </div>
        <div className="qd-pills">
          <span className="qd-pill">Level {data.level}/3</span>
          <span className="qd-pill">{data.servedMinutes}/{data.targetMinutes} min</span>
        </div>
      </header>

      <div className="qd-p__grid">
        <aside className="qd-rail" aria-label="Today’s set">
          <p className="qd-rail__cap">Today’s set</p>
          <ol className="qd-rail__list">
            {items.map((it, i) => {
              const done = Boolean(it.answered || results[it.id]);
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    className={`qd-rail__item${i === index ? ' is-current' : ''}${done ? ' is-done' : ''}`}
                    aria-current={i === index ? 'step' : undefined}
                    disabled={i > unlockedMax}
                    onClick={() => goto(i)}
                  >
                    <span className="qd-rail__num" aria-hidden="true">{done ? '✓' : i + 1}</span>
                    <span className="qd-rail__body">
                      <span className="qd-rail__type">{TYPE_LABELS[it.type]}</span>
                      <span className="qd-rail__meta">{it.minutes} min · {it.concept}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="qd-rail__minutes">{data.servedMinutes} of {data.targetMinutes} practice minutes planned</p>
        </aside>

        <div className="qd-p__main">
          {item && (
        <section className="qd-card qd-act" aria-label={TYPE_LABELS[item.type]}>
          <div className="qd-act__kicker">
            <span className="qd-act__type">{TYPE_LABELS[item.type]}</span>
            <DiffDots level={item.difficulty} />
            <span className="qd-pill qd-pill--tiny">{item.minutes} min</span>
            <span className="qd-pill qd-pill--tiny">{item.concept}</span>
          </div>

          <p className="qd-act__sit">{item.situation}</p>
          {item.code && <pre className="qd-code"><code>{item.code}</code></pre>}
          <h3 className="qd-act__q">{item.question}</h3>

          {mcq ? (
            <div className="qd-opts" role="radiogroup" aria-label="Answer options">
              {item.options.map((opt, i) => {
                const picked = picks[item.id] === i;
                const state = freshResult && !freshResult.error
                  ? (i === freshResult.answerIndex ? ' is-right' : (picked ? ' is-wrongpick' : ''))
                  : (picked ? ' is-pick' : '');
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    className={`qd-opt${state}`}
                    disabled={busy || Boolean(freshResult)}
                    onClick={() => setPicks((p) => ({ ...p, [item.id]: i }))}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="qd-sqlwrap">
              <div className="qd-schema">
                {item.schema.tables.map((t) => (
                  <RowsTable key={t.name} label={t.name} columns={t.columns} rows={t.rows} />
                ))}
                {item.expectedColumns?.length > 0 && (
                  <p className="qd-muted qd-sqlhint">Expected columns: {item.expectedColumns.join(', ')}</p>
                )}
              </div>
              <textarea
                className="qd-sql"
                aria-label="Your SQL query"
                placeholder="SELECT …"
                value={sql[item.id] ?? ''}
                disabled={busy || Boolean(freshResult)}
                onChange={(e) => setSql((s) => ({ ...s, [item.id]: e.target.value }))}
                spellCheck="false"
              />
              <div className="qd-act__actions">
                <button type="button" className="qd-btn qd-btn--ghost" disabled={busy || Boolean(freshResult) || !(sql[item.id] ?? '').trim()} onClick={runQuery}>
                  Run (sandbox — free)
                </button>
                <button type="button" className="qd-btn qd-btn--primary" disabled={busy || Boolean(freshResult) || !(sql[item.id] ?? '').trim()} onClick={check}>
                  Submit answer
                </button>
              </div>
              {runs[item.id] && !runs[item.id].error && (
                <RowsTable label={`Result of your run (${runs[item.id].rows.length} row${runs[item.id].rows.length === 1 ? '' : 's'})`} columns={runs[item.id].columns} rows={runs[item.id].rows} />
              )}
              {runs[item.id]?.error && <p className="qd-error" role="alert">{runs[item.id].error}</p>}
            </div>
          )}

          {mcq && !freshResult && (
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--primary" disabled={busy || picks[item.id] === undefined} onClick={check}>
                Check answer
              </button>
            </div>
          )}

          {!freshResult && item.type !== 'write-query' && (
            <div className="qd-hints">
              {hint ? (
                <p className="qd-hinttext">{hint.text}</p>
              ) : null}
              {(hint?.level ?? 0) < 3 && (
                <button type="button" className="qd-btn qd-btn--ghost qd-hintbtn" disabled={busy} onClick={applyHint}>
                  Hint ({(hint?.level ?? 0) + 1}/3)
                </button>
              )}
            </div>
          )}
          {!freshResult && item.type === 'write-query' && (hint ? <p className="qd-hinttext">{hint.text}</p> : null)}
          {!freshResult && item.type === 'write-query' && (hint?.level ?? 0) < 3 && (
            <button type="button" className="qd-btn qd-btn--ghost qd-hintbtn" disabled={busy} onClick={applyHint}>
              Hint ({(hint?.level ?? 0) + 1}/3)
            </button>
          )}

          {freshResult?.error && <p className="qd-error" role="alert">{freshResult.error}</p>}

          {freshResult && !freshResult.error && (
            <div className={`qd-fb ${freshResult.correct ? 'is-ok' : 'is-no'}`} role="status">
              <p className="qd-fb__head">
                {freshResult.correct ? '✓ Correct — and the first try is what counts.' : '✗ Not quite — the first try is recorded; retries are for understanding.'}
              </p>
              {mcq && !freshResult.correct && freshResult.chosenNote && (
                <p className="qd-fb__note">Your pick: {freshResult.chosenNote}</p>
              )}
              {mcq && !freshResult.correct && (
                <p className="qd-fb__note">Correct answer: {item.options[freshResult.answerIndex]}</p>
              )}
              {!mcq && !freshResult.correct && (
                <div className="qd-fb__tables">
                  <RowsTable label="Your result" columns={freshResult.yourColumns} rows={freshResult.yourRows} />
                  <RowsTable label="Expected result" columns={freshResult.expectedColumns} rows={freshResult.expectedRows} />
                </div>
              )}
              <p className="qd-fb__note">{freshResult.explanation}</p>
              <p className="qd-take"><b>Say it out loud:</b> “{freshResult.takeaway}”</p>
              {!mcq && !freshResult.correct && (
                <p className="qd-fb__note">Fix your query and run it again — the sandbox is free; the record stays.</p>
              )}
              <div className="qd-act__actions">
                {mcq && !freshResult.correct && (
                  <button
                    type="button"
                    className="qd-btn qd-btn--ghost"
                    onClick={() => {
                      setResults((r) => { const c = { ...r }; delete c[item.id]; return c; });
                      setPicks((p) => { const c = { ...p }; delete c[item.id]; return c; });
                    }}
                  >
                    Try another
                  </button>
                )}
                {unlockedMax > index && (
                  <button type="button" className="qd-btn qd-btn--primary" onClick={next}>Next</button>
                )}
                {setComplete && index === items.length - 1 && (
                  <button
                    type="button"
                    className="qd-btn qd-btn--primary"
                    onClick={() => {
                      setResults((r) => { const c = { ...r }; delete c[item.id]; return c; });
                      setPicks((p) => { const c = { ...p }; delete c[item.id]; return c; });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Finish the set
                  </button>
                )}
              </div>
            </div>
          )}

          {item.answered && !freshResult && (
            <div className={`qd-fb ${item.answered.correct ? 'is-ok' : 'is-no'}`} role="status">
              <p className="qd-fb__head">
                {item.answered.correct ? '✓ Already answered — first try: correct.' : '✗ Already answered — first try: incorrect (recorded).'}
              </p>
              <p className="qd-fb__note">The record stands. Come back tomorrow for a fresh set{item.answered.correct ? '' : ' — this concept returns in your review slot'}.</p>
              {unlockedMax > index && (
                <div className="qd-act__actions">
                  <button type="button" className="qd-btn qd-btn--primary" onClick={next}>Next</button>
                </div>
              )}
            </div>
          )}
        </section>
          )}
        </div>
      </div>
    </div>
  );
}
