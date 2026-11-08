import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* Mistake replay — the on-demand redo surface (PRD §7: "redo what you got
   wrong — until you cannot"): the concepts missed in the last two weeks,
   back in front of you whenever you choose. A correct replay retires the
   concept from the 1/3/7-day review queue. Replay never touches the daily
   score, the streak, or the plan — it is pure repair work. */

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

export default function ReplayPage() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [picks, setPicks] = useState({});
  const [sql, setSql] = useState({});
  const [runs, setRuns] = useState({});
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setPhase('loading');
    apiFetch('/practice/replay', { headers: authHeaders() })
      .then((res) => {
        setItems(res.items ?? []);
        setPhase('ready');
        setError('');
        const firstOpen = (res.items ?? []).find((it) => !it.clearedToday);
        setActiveId(firstOpen ? firstOpen.id : null);
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

  const item = items.find((it) => it.id === activeId) || null;
  const freshResult = item ? results[item.id] : null;
  const clearedCount = items.filter((it) => it.clearedToday).length;

  const answer = async () => {
    if (busy) return;
    if (item.options && picks[item.id] === undefined) return;
    if (item.type === 'write-query' && !(sql[item.id] ?? '').trim()) return;
    setBusy(true);
    try {
      const body = item.type === 'write-query'
        ? { id: item.id, sql: sql[item.id] }
        : { id: item.id, choice: picks[item.id] };
      const res = await apiFetch('/practice/replay/answer', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      setResults((r) => ({ ...r, [item.id]: res }));
      if (res.cleared) load();
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

  if (phase === 'loading') {
    return <div className="qd-p"><div className="qd-card skeleton" style={{ height: 220 }} /></div>;
  }

  if (phase === 'error') {
    return (
      <div className="qd-p" role="alert">
        <div className="qd-card qd-p__err">
          <h2 className="qd-h2">Mistake replay couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qd-p">
      <header className="qd-p__head">
        <div>
          <p className="qd-kicker">Mistake replay</p>
          <h2 className="qd-h2">Redo what bit you — until it can’t.</h2>
          <p className="qd-muted">
            Corrections from the last two weeks, on demand. A correct replay
            retires the concept from the 1/3/7-day review queue. Replay never
            touches today’s score — it is pure repair work.
          </p>
        </div>
        <div className="qd-pills">
          <span className="qd-pill">{items.length - clearedCount} waiting</span>
          {clearedCount > 0 && <span className="qd-pill">{clearedCount} cleared today</span>}
        </div>
      </header>

      <div className="qd-p__grid">
        <aside className="qd-rail" aria-label="Missed concepts">
          <p className="qd-rail__cap">Review queue</p>
          <ol className="qd-rail__list">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={`qd-rail__item${it.id === activeId ? ' is-current' : ''}${it.clearedToday ? ' is-done' : ''}`}
                  aria-current={it.id === activeId ? 'step' : undefined}
                  onClick={() => setActiveId(it.id)}
                >
                  <span className="qd-rail__num" aria-hidden="true">{it.clearedToday ? '✓' : it.missedDaysAgo + 'd'}</span>
                  <span className="qd-rail__body">
                    <span className="qd-rail__type">{TYPE_LABELS[it.type]}</span>
                    <span className="qd-rail__meta">{it.concept} · missed {it.missedDaysAgo === 0 ? 'today' : `${it.missedDaysAgo}d ago`}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="qd-p__main">
          {item ? (
            <section className="qd-card qd-act" aria-label={TYPE_LABELS[item.type]}>
              <div className="qd-act__kicker">
                <span className="qd-act__type">{TYPE_LABELS[item.type]}</span>
                <span className="qd-pill qd-pill--tiny">{item.concept}</span>
              </div>
              <p className="qd-act__sit">{item.situation}</p>
              {item.code && <pre className="qd-code"><code>{item.code}</code></pre>}
              <h3 className="qd-act__q">{item.question}</h3>

              {item.options ? (
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
                      <div className="qd-tablewrap" key={t.name}>
                        <p className="qd-tablecap">{t.name}</p>
                        <table className="qd-table">
                          <thead><tr>{t.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                          <tbody>
                            {t.rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                  <textarea
                    className="qd-sql"
                    aria-label="Your SQL query"
                    placeholder="SELECT …"
                    value={sql[item.id] ?? ''}
                    onChange={(e) => setSql((s) => ({ ...s, [item.id]: e.target.value }))}
                    spellCheck="false"
                  />
                  <div className="qd-act__actions">
                    <button type="button" className="qd-btn qd-btn--ghost" disabled={busy} onClick={runQuery}>
                      Run (sandbox — free)
                    </button>
                  </div>
                  {runs[item.id] && !runs[item.id].error && (
                    <div className="qd-tablewrap">
                      <p className="qd-tablecap">Result of your run ({runs[item.id].rows.length} rows)</p>
                      <table className="qd-table">
                        <thead><tr>{runs[item.id].columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                        <tbody>
                          {runs[item.id].rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {runs[item.id]?.error && <p className="qd-error" role="alert">{runs[item.id].error}</p>}
                </div>
              )}

              {!freshResult && (
                <div className="qd-act__actions">
                  <button
                    type="button"
                    className="qd-btn qd-btn--primary"
                    disabled={busy || (item.options ? picks[item.id] === undefined : !(sql[item.id] ?? '').trim())}
                    onClick={answer}
                  >
                    {item.options ? 'Check answer' : 'Submit answer'}
                  </button>
                </div>
              )}

              {freshResult?.error && <p className="qd-error" role="alert">{freshResult.error}</p>}

              {freshResult && !freshResult.error && (
                <div className={`qd-fb ${freshResult.correct ? 'is-ok' : 'is-no'}`} role="status">
                  <p className="qd-fb__head">
                    {freshResult.correct
                      ? (freshResult.cleared ? '✓ Correct — this concept leaves your review queue.' : '✓ Correct — already clear from an earlier replay.')
                      : '✗ Not this time — it stays in the 1/3/7-day queue.'}
                  </p>
                  {item.options && !freshResult.correct && freshResult.chosenNote && (
                    <p className="qd-fb__note">Your pick: {freshResult.chosenNote}</p>
                  )}
                  {item.options && !freshResult.correct && (
                    <p className="qd-fb__note">Correct answer: {item.options[freshResult.answerIndex]}</p>
                  )}
                  {item.type === 'write-query' && !freshResult.correct && (
                    <div className="qd-fb__tables">
                      <div className="qd-tablewrap">
                        <p className="qd-tablecap">Your result</p>
                        <table className="qd-table">
                          <thead><tr>{freshResult.yourColumns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                          <tbody>{freshResult.yourRows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                      <div className="qd-tablewrap">
                        <p className="qd-tablecap">Expected result</p>
                        <table className="qd-table">
                          <thead><tr>{freshResult.expectedColumns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                          <tbody>{freshResult.expectedRows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <p className="qd-fb__note">{freshResult.explanation}</p>
                  <p className="qd-take"><b>Say it out loud:</b> “{freshResult.takeaway}”</p>
                </div>
              )}
            </section>
          ) : (
            <div className="qd-card qd-done">
              <p className="qd-kicker">Mistake replay</p>
              <h2 className="qd-h2">Nothing is waiting.</h2>
              <p className="qd-muted">
                The review queue is empty — misses from the daily set and the
                interviews land here as they happen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
