import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* Daily Practice player — carbon/amber "code editor" skin (Linear/Raycast/Vercel
   direction): recessed IDE code block with line numbers, keycap answer cards,
   keyboard-first controls (1–4/A–D to pick, Enter to check), one-row action
   footer. Quiz logic, state and endpoints unchanged. */

const TYPE_LABELS = {
  'predict-output': 'Predict the output',
  'fix-the-bug': 'Fix the bug',
  'read-the-error': 'Read the error',
  'catch-the-ai': 'Catch the AI',
  'write-query': 'Write the query',
};

const TYPE_FILE = {
  javascript: 'snippet.js',
  python: 'snippet.py',
  sql: 'query.sql',
  log: 'output.log',
  text: 'notes.txt',
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

function DiffDots({ level }) {
  return (
    <span className="qd-diff" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'is-on' : ''} aria-hidden="true" />)}
    </span>
  );
}

function RowsTable({ columns, rows, label }) {
  return (
    <div className="qd-tablewrap">
      {label && <p className="qd-tablecap">{label}</p>}
      <table className="qd-table">
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
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
  const dotRefs = useRef([]);
  const cardRef = useRef(null);
  const [story, setStory] = useState(null);
  const [peer, setPeer] = useState(null);
  const [radar, setRadar] = useState(null);
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

  const setPrefsPatch = async (patch, label) => {
    setBusy(true);
    try {
      const r = await apiFetch('/practice/daily/prefs', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(patch),
      });
      if (r.takesEffectToday) { load(true); loadMeta(); setNotice(label + ' - set regenerated.'); }
      else setNotice(label + ' queued - your next set picks it up.');
    } catch (err) { setNotice(err.message); } finally { setBusy(false); }
  };

  const loadMeta = useCallback(() => {
    apiFetch('/practice/story', { headers: authHeaders() }).then((r) => setStory((r.stories ?? [])[0] ?? null)).catch(() => setStory(null));
    apiFetch('/practice/peer', { headers: authHeaders() }).then((r) => setPeer(r)).catch(() => setPeer(null));
    apiFetch('/practice/radar', { headers: authHeaders() }).then((r) => setRadar(r)).catch(() => setRadar(null));
  }, []);
  useEffect(() => { if (phase === 'ready') loadMeta(); }, [loadMeta, phase, data?.done, data?.level]);

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

  const goto = (i) => {
    if (i < 0 || i > unlockedMax || i === index) return;
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (unlockedMax > index) goto(index + 1);
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // keyboard-first: 1–4 / A–D pick an option, Enter checks
  useEffect(() => {
    if (phase !== 'ready' || !item || freshResult) return undefined;
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (item.options) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key) !== -1 ? Number(e.key) - 1
          : ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
        if (idx !== -1 && idx < item.options.length) {
          setPicks((p) => ({ ...p, [item.id]: idx }));
          return;
        }
      }
      if (e.key === 'Enter') check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const setComplete = items.length > 0 && items.every((it) => it.answered || results[it.id]);
  const solvedCount = items.filter((it) => it.answered || results[it.id]).length;
  const firstOpenIdx = items.findIndex((it) => !it.answered && !results[it.id]);
  const unlockedMax = firstOpenIdx === -1 ? items.length - 1 : firstOpenIdx;
  const viewingLastFeedback = Boolean(freshResult);

  // GSAP — smooth dot transitions + card swap on step change.
  useEffect(() => {
    if (phase !== 'ready') return;
    const dot = dotRefs.current[index];
    if (dot && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(dot, { scale: 0.55 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.55)', overwrite: true });
    }
    if (cardRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', overwrite: true });
    }
  }, [index, item?.id, phase]);

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
  const codeLines = (item.code || '').split('\n');

  return (
    <div className="qd-p">
      <header className="qd-p__head">
        <div>
          <p className="qd-eyebrow">Daily practice</p>
          <h2 className="qd-h2">{items.length} activities. First try counts.</h2>
          <p className="qd-muted">
            {data.targetMinutes > data.servedMinutes
              ? `Planned for your ${data.targetMinutes} minutes — today’s opening set covers ${data.servedMinutes}. The bank grows daily, and so will the sets.`
              : 'Sized to the practice time you committed to — fresh material, your weak spots, and a review of what bit you.'}
          </p>
        </div>
        <div className="qd-statusb" role="status" aria-label={`Level ${data.level} of 3, ${data.servedMinutes} of ${data.targetMinutes} minutes`}>
          <span className="qd-statusb__lv">LV {data.level}/3</span>
          <span className="qd-statusb__seg" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <i key={i} className={i <= Math.min(5, Math.round((solvedCount / Math.max(1, items.length)) * 5)) ? 'is-on' : ''} />
            ))}
          </span>
          <span className="qd-statusb__min">{data.servedMinutes}/{data.targetMinutes} min</span>
        </div>
      </header>

      <section className="qd-scopebar" role="group" aria-label="Practice scope">
        <span className="qd-scopebar__label">Tier</span>
        {[['beginner', 'Beginner'], ['intermediate', 'Int'], ['expert', 'Expert']].map(([id, l]) => (
          <button key={id} type="button" disabled={busy} className={data?.prefs?.tier === id ? 'is-on' : ''} onClick={() => setPrefsPatch({ tier: id }, l + ' tier')}>{l}</button>
        ))}
        <span className="qd-scopebar__label">Track</span>
        {[['auto', 'Auto'], ['Software Engineering', 'CS'], ['Cyber Security', 'Cyber'], ['AI & ML', 'AI/ML']].map(([id, l]) => (
          <button key={id} type="button" disabled={busy} className={data?.prefs?.track === id ? 'is-on' : ''} onClick={() => setPrefsPatch({ track: id }, l + ' track')}>{l}</button>
        ))}
      </section>

      <nav className="qd-dotpager" aria-label="Activities">
        {items.map((it, i) => {
          const done = Boolean(it.answered || results[it.id]);
          const active = i === index;
          return (
            <button
              key={it.id}
              type="button"
              ref={(el) => { dotRefs.current[i] = el; }}
              className={`qd-page__dot${active ? ' is-on' : ''}${done ? ' is-done' : ''}`}
              aria-label={`Activity ${i + 1}: ${TYPE_LABELS[it.type]}${done ? ' (answered)' : ''}`}
              aria-current={active ? 'step' : undefined}
              disabled={i > unlockedMax}
              onClick={() => goto(i)}
            />
          );
        })}
        <span className="qd-dotpager__count">{index + 1} / {items.length}</span>
      </nav>
      <div className="qd-p__grid">

        <div className="qd-p__main">
          {item && (
            <section ref={cardRef} className="qd-act" aria-label={TYPE_LABELS[item.type]}>
              <div className="qd-act__kicker">
                <span className="qd-act__type">{TYPE_LABELS[item.type]}</span>
                <DiffDots level={item.difficulty} />
                <span className="qd-act__mono">{item.minutes} min</span>
                <span className="qd-act__mono">{item.concept}</span>
              </div>

              <p className="qd-act__sit">{item.situation}</p>

              {item.code && (
                <div className="qd-codeide" role="figure" aria-label="Code snippet">
                  <div className="qd-codeide__chrome">
                    <span>{TYPE_FILE[item.language] ?? 'snippet.txt'}</span>
                    <span className="qd-codeide__lang">{item.language}</span>
                  </div>
                  <div className="qd-codeide__body">
                    <div className="qd-codeide__gutter" aria-hidden="true">
                      {codeLines.map((_, i) => <span key={i}>{i + 1}</span>)}
                    </div>
                    <pre className="qd-codeide__code"><code>{item.code}</code></pre>
                  </div>
                </div>
              )}

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
                        <span className="qd-opt__key" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                        <span className="qd-opt__text">{opt}</span>
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
                    <button type="button" className="qd-hintbtn" disabled={busy || Boolean(freshResult) || !(sql[item.id] ?? '').trim()} onClick={runQuery}>
                      Run (sandbox — free)
                    </button>
                    <button type="button" className="qd-cta qd-cta--primary" disabled={busy || Boolean(freshResult) || !(sql[item.id] ?? '').trim()} onClick={check}>
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
                <div className="qd-act__foot">
                  <button type="button" className="qd-hintbtn" disabled={busy} onClick={applyHint}>
                    Hint {(hint?.level ?? 0)}/3
                  </button>
                  <button type="button" className="qd-checkbtn" disabled={busy || picks[item.id] === undefined} onClick={check}>
                    Check answer
                  </button>
                </div>
              )}

              {!mcq && !freshResult && (
                <div className="qd-act__foot">
                  <span className="qd-hintbtn qd-hintbtn--passive">{(hint?.level ?? 0) > 0 ? hint.text.slice(0, 60) + (hint.text.length > 60 ? '…' : '') : ''}</span>
                  <button type="button" className="qd-hintbtn" disabled={busy || (hint?.level ?? 0) >= 3} onClick={applyHint}>
                    {(hint?.level ?? 0) >= 3 ? 'No more hints' : `Hint ${(hint?.level ?? 0) + 1}/3`}
                  </button>
                </div>
              )}

              {hint && !freshResult && (
                <p className="qd-hinttext">{hint.text}</p>
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
                  <div className="qd-act__actions">
                    {mcq && !freshResult.correct && (
                      <button type="button" className="qd-hintbtn" onClick={() => {
                        setResults((r) => { const c = { ...r }; delete c[item.id]; return c; });
                        setPicks((p) => { const c = { ...p }; delete c[item.id]; return c; });
                      }}>
                        Try another
                      </button>
                    )}
                    {unlockedMax > index && (
                      <button type="button" className="qd-cta qd-cta--primary" onClick={next}>Next</button>
                    )}
                    {setComplete && index === items.length - 1 && (
                      <button
                        type="button"
                        className="qd-cta qd-cta--primary"
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
                      <button type="button" className="qd-cta qd-cta--primary" onClick={next}>Next</button>
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
