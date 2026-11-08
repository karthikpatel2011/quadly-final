import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* Daily Practice — "Midnight Slate & Emerald" layout: compact top bar with a
   horizontal 5-step stepper, then a 12-col split (scenario + IDE code window
   left; question, options and actions right). Palette is deep midnight slate
   with a single emerald accent. Quiz state, endpoints and scoring unchanged. */

const TYPE_LABELS = {
  'predict-output': 'Predict the output',
  'fix-the-bug': 'Fix the bug',
  'read-the-error': 'Read the error',
  'catch-the-ai': 'Catch the AI',
  'write-query': 'Write the query',
};

const EXT_BY_LANG = { javascript: 'js', python: 'py', sql: 'sql', log: 'log', text: 'txt' };

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

function DiffDots({ level }) {
  return (
    <span className="qv2-dots" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'is-on' : ''} aria-hidden="true" />)}
    </span>
  );
}

function RowsTable({ columns, rows, label }) {
  return (
    <div className="qv2-tablewrap">
      {label && <p className="qv2-tablecap">{label}</p>}
      <table className="qv2-table">
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function fileNameFor(item) {
  const concept = String(item.concept || 'snippet');
  const lang = EXT_BY_LANG[item.language] ?? 'txt';
  const stripped = concept.replace(/^(js|py|sql)-/, '');
  if (item.type === 'write-query' || item.language === 'sql') return `${stripped}.${lang}`;
  return `${stripped}.${lang}`;
}

export default function PracticePage() {
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [hints, setHints] = useState({});
  const [picks, setPicks] = useState({});
  const [results, setResults] = useState({});
  const [sql, setSql] = useState({});
  const [runs, setRuns] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

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
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const items = data?.items ?? [];
  const item = items[index];
  const freshResult = item ? results[item.id] : null;

  const applyHint = async () => {
    const next = (hints[item.id]?.level ?? 0) + 1;
    if (next > 3 || busy) return;
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
    if (busy || freshResult || !item) return;
    if (item.options && picks[item.id] === undefined) return;
    if (item.type === 'write-query' && !(sql[item.id] ?? '').trim()) return;
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
        items: d.items.map((it) => (it.id === item.id ? { ...it, answered: { correct: res.correct, firstTry: true } } : it)),
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

  const solvedCount = items.filter((it) => it.answered || results[it.id]).length;
  const firstOpenIdx = items.findIndex((it) => !it.answered && !results[it.id]);
  const unlockedMax = firstOpenIdx === -1 ? items.length - 1 : firstOpenIdx;
  const setComplete = items.length > 0 && items.every((it) => it.answered || results[it.id]);
  const freshFeedbackUp = Boolean(freshResult);
  const goto = (i) => {
    if (i < 0 || i > unlockedMax || i === index) return;
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (unlockedMax > index) goto(index + 1);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (phase !== 'ready' || !item || freshResult) return undefined;
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (item.options) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key) !== -1 ? Number(e.key) - 1
          : ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
        if (idx !== -1 && idx < item.options.length) { setPicks((p) => ({ ...p, [item.id]: idx })); return; }
      }
      if (e.key === 'Enter') check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps


  if (phase === 'loading') {
    return (
      <div className="qv2">
        <div className="qv2-inner">
          <div className="qv2-card skeleton" style={{ height: 64 }} />
          <div className="qv2-grid"><div className="qv2-card skeleton" style={{ height: 340 }} /><div className="qv2-card skeleton" style={{ height: 340 }} /></div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qv2" role="alert">
        <div className="qv2-inner">
          <div className="qv2-card qd-p__err">
            <h2 className="qv2-heading">Practice couldn’t load</h2>
            <p className="qv2-dim">{error}</p>
            <button type="button" className="qv2-cta" onClick={load}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (setComplete && !freshFeedbackUp) {
    return (
      <div className="qv2">
        <div className="qv2-inner">
          <div className="qv2-card qv2-done">
            <p className="qv2-kicker">Daily practice</p>
            <h2 className="qv2-heading">{data.score} of {data.total} on the first try.</h2>
            <p className="qv2-dim">Level {data.level} of 3 — it lifts after two good days and eases after two weak ones, never mid-set.</p>
            <p className="qv2-dim">
              {items.some((it) => it.answered?.correct === false || (results[it.id] && !results[it.id].correct))
                ? 'The ideas you missed come back in 1, 3, and 7 days — your review slot is already reserved.'
                : 'Clean sweep. A fresh set opens after 4 am IST tomorrow.'}
            </p>
            <div className="qv2-actions">
              <button type="button" className="qv2-cta" onClick={() => { window.location.assign('/app'); }}>Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mcq = Boolean(item?.options);
  const hint = item ? hints[item.id] : undefined;
  const codeLines = (item?.code || '').split('\n');

  return (
    <div className="qv2">
      <div className="qv2-inner">
        <header className="qv2-bar">
          <div className="qv2-bar__title">
            <b>Daily Practice</b>
            <span className="qv2-chip">{data.servedMinutes}/{data.targetMinutes} min planned</span>
          </div>
          <nav className="qv2-steps" aria-label="Activities">
            {items.map((it, i) => {
              const done = Boolean(it.answered || results[it.id]);
              const cls = i === index ? ' is-active' : done ? ' is-done' : '';
              return (
                <button
                  key={it.id}
                  type="button"
                  className={`qv2-step${cls}${i > unlockedMax ? ' is-locked' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  disabled={i > unlockedMax}
                  onClick={() => goto(i)}
                >
                  {i === index && <span className="qv2-step__dot" aria-hidden="true" />}
                  {done && i !== index && <span className="qv2-step__check" aria-hidden="true">✓</span>}
                  <span className="qv2-step__label">{TYPE_LABELS[it.type]}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {item ? (
          <div className="qv2-grid">
            <section className="qv2-card qv2-left" aria-label="Scenario and code">
              <div className="qv2-meta">
                <span className="qv2-tag">{TYPE_LABELS[item.type]}</span>
                <DiffDots level={item.difficulty} />
                <span className="qv2-mono">{item.minutes} min</span>
                <span className="qv2-mono">{item.concept}</span>
              </div>
              <p className="qv2-scenario">{item.situation}</p>
              {item.code && (
                <div className="qv2-code">
                  <div className="qv2-code__head">
                    <span className="qv2-code__dots" aria-hidden="true"><i /><i /><i /></span>
                    <span className="qv2-code__name">{fileNameFor(item)}</span>
                    <span className="qv2-code__lang">{item.language}</span>
                  </div>
                  <div className="qv2-code__body">
                    <div className="qv2-code__gutter" aria-hidden="true">
                      {codeLines.map((_, i) => <span key={i}>{i + 1}</span>)}
                    </div>
                    <pre className="qv2-code__text"><code>{item.code}</code></pre>
                  </div>
                </div>
              )}
              {item.type === 'write-query' && (
                <>
                  <div className="qv2-meta" style={{ marginTop: 16 }}>
                    {item.schema.tables.map((t) => (
                      <RowsTable key={t.name} label={t.name} columns={t.columns} rows={t.rows} />
                    ))}
                  </div>
                  <textarea
                    className="qv2-sql"
                    aria-label="Your SQL query"
                    placeholder="SELECT …"
                    value={sql[item.id] ?? ''}
                    onChange={(e) => setSql((s) => ({ ...s, [item.id]: e.target.value }))}
                    spellCheck="false"
                  />
                  <div className="qv2-actions" style={{ marginTop: 10 }}>
                    <button type="button" className="qv2-ghost" disabled={busy || !(sql[item.id] ?? '').trim()} onClick={runQuery}>
                      Run (sandbox — free)
                    </button>
                  </div>
                  {runs[item.id] && !runs[item.id].error && (
                    <RowsTable label={`Result of your run (${runs[item.id].rows.length} rows)`} columns={runs[item.id].columns} rows={runs[item.id].rows} />
                  )}
                  {runs[item.id]?.error && <p className="qv2-err" role="alert">{runs[item.id].error}</p>}
                </>
              )}
            </section>

            <section className="qv2-card qv2-right" aria-label="Question and options">
              <h3 className="qv2-question">{item.question}</h3>
              {mcq && (
                <>
                  <div className="qv2-opts" role="radiogroup" aria-label="Answer options">
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
                          className={`qv2-opt${state}`}
                          disabled={busy || Boolean(freshResult)}
                          onClick={() => setPicks((p) => ({ ...p, [item.id]: i }))}
                        >
                          <span className="qv2-opt__badge" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                          <span className="qv2-opt__text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="qv2-foot">
                    <button type="button" className="qv2-ghost" disabled={busy} onClick={applyHint}>
                      Hint {(hint?.level ?? 0)}/3
                    </button>
                    <button type="button" className="qv2-cta" disabled={busy || picks[item.id] === undefined} onClick={check}>
                      Check answer
                    </button>
                  </div>
                </>
              )}
              {!mcq && (
                <>
                  <textarea
                    className="qv2-sql"
                    aria-label="Your SQL query"
                    placeholder="SELECT …"
                    value={sql[item.id] ?? ''}
                    onChange={(e) => setSql((s) => ({ ...s, [item.id]: e.target.value }))}
                    spellCheck="false"
                  />
                  <div className="qv2-foot">
                    <button type="button" className="qv2-ghost" disabled={busy} onClick={applyHint}>
                      Hint {(hint?.level ?? 0)}/3
                    </button>
                    <button type="button" className="qv2-cta" disabled={busy || !(sql[item.id] ?? '').trim()} onClick={check}>
                      Submit answer
                    </button>
                  </div>
                </>
              )}
              {hint && <p className="qv2-hinttext">{hint.text}</p>}
              {notice && <p className="qv2-err" role="alert">{notice}</p>}
              <p className="qv2-privacy">First try counts. Retries are for understanding — the record never changes.</p>
            </section>
          </div>
        ) : null}

        {freshResult && !freshResult.error && (
          <section className={`qv2-card qv2-debrief ${(freshResult.correct ? 'is-ok' : 'is-no')}`} role="status">
            <p className="qv2-debrief__head">
              {freshResult.correct ? '✓ Correct — first try recorded.' : '✗ Not quite — first try recorded; retries are for understanding.'}
            </p>
            <div className="qv2-debrief__body">
              {mcq && !freshResult.correct && freshResult.chosenNote && <p className="qv2-dim">Your pick: {freshResult.chosenNote}</p>}
              {mcq && !freshResult.correct && <p className="qv2-dim">Correct answer: {item.options[freshResult.answerIndex]}</p>}
              {!mcq && !freshResult.correct && (
                <div className="qv2-debrief__tables">
                  <RowsTable label="Your result" columns={freshResult.yourColumns} rows={freshResult.yourRows} />
                  <RowsTable label="Expected result" columns={freshResult.expectedColumns} rows={freshResult.expectedRows} />
                </div>
              )}
              <p className="qv2-dim">{freshResult.explanation}</p>
              <p className="qv2-take"><b>Say it out loud:</b> “{freshResult.takeaway}”</p>
              <div className="qv2-actions">
                {mcq && !freshResult.correct && (
                  <button type="button" className="qv2-ghost" onClick={() => {
                    setResults((r) => { const c = { ...r }; delete c[item.id]; return c; });
                    setPicks((p) => { const c = { ...p }; delete c[item.id]; return c; });
                  }}>
                    Try another
                  </button>
                )}
                {unlockedMax > index && (
                  <button type="button" className="qv2-cta" onClick={next}>Next</button>
                )}
                {setComplete && index === items.length - 1 && (
                  <button
                    type="button"
                    className="qv2-cta"
                    onClick={() => {
                      setResults((r) => { const c = { ...r }; delete c[item.id]; return c; });
                      setPicks((p) => { const c = { ...p }; delete c[item.id]; return c; });
                    }}
                  >
                    Finish the set
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {item && item.answered && !freshResult && (
          <section className={`qv2-card qv2-debrief ${(item.answered.correct ? 'is-ok' : 'is-no')}`} role="status">
            <p className="qv2-debrief__head">
              {item.answered.correct ? '✓ Already answered — first try: correct.' : '✗ Already answered — first try: incorrect (recorded).'}
            </p>
            {unlockedMax > index && (
              <div className="qv2-actions">
                <button type="button" className="qv2-cta" onClick={next}>Next</button>
              </div>
            )}
          </section>
        )}

        {notice && <p className="qv2-err" role="alert">{notice}</p>}
      </div>
    </div>
  );
}

