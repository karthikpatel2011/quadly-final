import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import gsap from 'gsap';
import { gotoRoute } from './PracticeHome.jsx';

// Incident Room — the student is the on-call. Evidence is server-scripted;
// every action costs simulated minutes; the reveal happens once. Keyboard
// first: actions, evidence, the hypothesis and the resolution are all real
// controls; the only motion is the reveal.

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
  };
}

const query = () => new URLSearchParams(window.location.search);

export default function IncidentRoom() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error | missing | paywall
  const [err, setErr] = useState('');
  const [scenario, setScenario] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [page, setPage] = useState('room'); // room | reveal
  const [reveal, setReveal] = useState(null);
  const [busy, setBusy] = useState(null);
  const [hintText, setHintText] = useState(null);
  const [latest, setLatest] = useState(null);
  const [hypothesis, setHypothesis] = useState('');
  const [notes, setNotes] = useState('');
  const [rootPick, setRootPick] = useState(null);
  const [fixPick, setFixPick] = useState(null);
  const [notice, setNotice] = useState(null);
  const [levelChanged, setLevelChanged] = useState(null);
  const revealRef = useRef(null);

  const load = useCallback(() => {
    setPhase('loading');
    const ctrl = new AbortController();
    (async () => {
      try {
        const attQ = query().get('attempt');
        if (attQ) {
          const res = await apiFetch(`/practice/incidents/${encodeURIComponent(attQ)}`, { headers: authHeaders(), signal: ctrl.signal });
          setScenario(res.scenario);
          setAttempt(res.attempt);
          setHypothesis(res.attempt.hypothesis || '');
          setNotes(res.attempt.notes || '');
          // A resumed room opens with the last evidence still on screen.
          const lastReveal = [...(res.attempt.timeline || [])].reverse().find((r) => r.reveal);
          if (lastReveal) setLatest({ ...lastReveal.reveal, atSimMinutes: lastReveal.atSimMin });
          if (res.attempt.status === 'resolved') {
            // A resolved attempt opens straight to the work record.
            gotoRoute(`/app/practice/record?attempt=${encodeURIComponent(attQ)}`);
            return;
          }
          setPhase('ready');
          return;
        }
        const scQ = query().get('scenario');
        if (!scQ) { setPhase('missing'); return; }
        const res = await apiFetch(`/practice/incidents/${encodeURIComponent(scQ)}/start`, { method: 'POST', headers: authHeaders(), signal: ctrl.signal });
        setScenario(res.scenario);
        setAttempt(res.attempt);
        setPhase('ready');
        const pad = query();
        pad.set('attempt', res.attempt.attemptId);
        window.history.replaceState({}, '', `/app/practice/incident?${pad.toString()}`);
      } catch (e) {
        if (e.name === 'AbortError') return;
        if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
        if (/not in the library|No such/i.test(e.message)) { setPhase('missing'); return; }
        if (/free plan includes a few incidents/i.test(e.message)) { setPhase('paywall'); return; }
        setErr(typeof e.message === 'string' ? e.message : '');
        setPhase('error');
      }
    })();
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => { document.title = 'Quadly — Incident room'; }, []);

  // The one motion in Practice: the incident reveal, staggered in, and
  // never when the student prefers reduced motion.
  useEffect(() => {
    if (page !== 'reveal' || !revealRef.current) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(revealRef.current.querySelectorAll('.qd-pr-revealrow'), {
        y: 14, opacity: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out',
      });
    }, revealRef);
    return () => ctx.revert();
  }, [page]);

  const runAction = async (actionId) => {
    if (busy || !attempt) return;
    setBusy(actionId);
    setNotice(null);
    try {
      const res = await apiFetch(`/practice/incidents/${encodeURIComponent(attempt.attemptId)}/action`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ actionId }),
      });
      setAttempt(res.attempt);
      if (res.reveal) setLatest(res.reveal);
      if (res.events?.length) setNotice({ kind: 'event', text: res.events.map((e) => e.text).join(' ') });
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  const askHint = async () => {
    if (busy || !attempt) return;
    setBusy('hint');
    try {
      const res = await apiFetch(`/practice/incidents/${encodeURIComponent(attempt.attemptId)}/hint`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({}),
      });
      setHintText(res.hint);
      if (res.hintsUsed) setAttempt((a) => ({ ...a, hintsUsed: res.hintsUsed }));
    } catch (e) {
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  const saveHypothesis = async () => {
    if (busy || !attempt) return;
    setBusy('hypothesis');
    try {
      const res = await apiFetch(`/practice/incidents/${encodeURIComponent(attempt.attemptId)}/hypothesis`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ text: hypothesis, notes }),
      });
      setAttempt(res.attempt);
      setNotice({ kind: 'ok', text: 'Hypothesis saved to the record.' });
    } catch (e) {
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  const resolve = async () => {
    if (busy || !attempt || !rootPick || !fixPick) return;
    setBusy('resolve');
    try {
      const res = await apiFetch(`/practice/incidents/${encodeURIComponent(attempt.attemptId)}/resolve`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ rootCauseId: rootPick, fixId: fixPick }),
      });
      setAttempt(res.attempt);
      setReveal(res.reveal);
      setLevelChanged(res.levelChanged || null);
      setPage('reveal');
    } catch (e) {
      if (/401|Not signed in/i.test(e.message)) { window.location.assign('/join'); return; }
      setNotice({ kind: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="qd-pr">
        <div className="qd-card skeleton" style={{ height: 90 }} />
        <div className="qd-pr-roomgrid">
          <div className="qd-card skeleton" style={{ height: 260 }} />
          <div className="qd-card skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  if (phase === 'missing') {
    return (
      <div className="qd-pr">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">That incident is not available</h2>
          <p className="qd-muted">It may have been removed from the library. Pick one from the Practice home.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
        </div>
      </div>
    );
  }

  if (phase === 'paywall') {
    return (
      <div className="qd-pr">
        <div className="qd-p__err qd-card" role="note">
          <h2 className="qd-h2">That’s this week’s free incidents used</h2>
          <p className="qd-muted">The free plan includes a few incident rooms a week; the next window opens on Monday. The daily drill stays free every day, and unfinished rooms can always be resumed.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-pr">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">The incident room didn’t load</h2>
          <p className="qd-muted">{err || 'Check your connection and try again.'}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { setPhase('loading'); load(); }}>Retry</button>
        </div>
      </div>
    );
  }

  if (page === 'reveal' && reveal) {
    const score = attempt.resolution?.score;
    return (
      <div className="qd-pr" ref={revealRef}>
        <section className="qd-card qd-pr-reveal">
          <p className="qd-kicker">The reveal</p>
          <h2 className="qd-h2">What actually happened</h2>
          <div className="qd-pr-revealrows">
            <div className="qd-pr-revealrow">
              <p className="qd-kicker">True root cause</p>
              <p className="qd-pr-linelg">{reveal.trueRootCause?.label}</p>
            </div>
            <div className="qd-pr-revealrow">
              <p className="qd-kicker">What the real company did</p>
              <p>{reveal.realAction}</p>
              <a className="qd-pr-srcline" href={reveal.source.url} target="_blank" rel="noreferrer noopener">{reveal.source.title}</a>
            </div>
            <div className="qd-pr-revealrow">
              <p className="qd-kicker">Your score</p>
              {score ? (
                <div className="qd-pr-score">
                  <span className="qd-pr-scorenum">{score.total}<i>/100</i></span>
                  <dl className="qd-pr-scorebrk">
                    <div><dt>Found the root cause</dt><dd>{score.rootCause ? 40 : 0}</dd></div>
                    <div><dt>Action efficiency</dt><dd>{score.efficiency}</dd></div>
                    <div><dt>Sim time</dt><dd>{score.time}</dd></div>
                    <div><dt>Fix was safe</dt><dd>{score.fixSafety}</dd></div>
                    <div><dt>Checked before acting</dt><dd>{score.checkedFirst}</dd></div>
                    <div><dt>Escalation timing</dt><dd>{score.escalation}</dd></div>
                    <div><dt>Hints</dt><dd>{score.hints}</dd></div>
                  </dl>
                </div>
              ) : null}
              <p className="qd-pr-fixnote">{reveal.fixes.find((f) => f.id === attempt.resolution?.fixId)?.note}</p>
            </div>
            <div className="qd-pr-revealrow">
              <p className="qd-kicker">The lesson</p>
              <p className="qd-pr-takeaway">{reveal.lesson}</p>
            </div>
          </div>
          {levelChanged && (
            <p className="qd-pr-levelnote">Level moved quietly: <b>{levelChanged.label}</b>.</p>
          )}
          <p className="qd-muted qd-pr-inspired">{reveal.inspiredByNote}</p>
          <div className="qd-act__actions">
            <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute(`/app/practice/postmortem?attempt=${encodeURIComponent(attempt.attemptId)}`)}>Write the postmortem</button>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/practice')}>Back to Practice</button>
          </div>
        </section>
      </div>
    );
  }

  const evidenceActions = scenario.actions.filter((a) => a.group === 'evidence' || a.group === 'check');
  const changeActions = scenario.actions.filter((a) => a.group === 'change');
  const escalateActions = scenario.actions.filter((a) => a.group === 'escalate');
  const taken = new Set(attempt.actionsTaken || []);
  const timeLeft = scenario.timeLimitMinutes ? scenario.timeLimitMinutes - attempt.simMinutes : null;

  return (
    <div className="qd-pr">
      <header className="qd-pr-alert qd-card">
        <div>
          <p className="qd-kicker">Incoming alert</p>
          <h2 className="qd-h2">{scenario.title}</h2>
          <p className="qd-muted">{scenario.story}</p>
        </div>
        <div className="qd-pr-alertmeta">
          <span className="qd-pill">{scenario.level.label}</span>
          <span className="qd-pill">{attempt.simMinutes} sim-min used</span>
          {scenario.timeLimitMinutes && (
            <span className={`qd-pill${timeLeft <= 5 ? ' qd-pr-pillwarning' : ''}`}>{timeLeft} min to resolve</span>
          )}
          <a className="qd-pr-sourceline" href={scenario.source.url} target="_blank" rel="noreferrer noopener">{scenario.source.company}</a>
        </div>
      </header>

      {notice && (
        <p className={`qd-pr-notice${notice.kind === 'error' ? ' is-error' : ''}`} role="status">{notice.text}</p>
      )}

      <div className="qd-pr-roomgrid">
        <div className="qd-pr-roomcol">
          <section className="qd-card qd-pr-actions" aria-label="Available actions">
            <p className="qd-kicker">Available actions</p>
            <p className="qd-muted qd-pr-actionsnote">Each action costs simulated minutes. Read before you change.</p>
            <div className="qd-pr-actgroup">
              <p className="qd-pr-actlabel">Investigate</p>
              <ul className="qd-pr-actlist">
                {evidenceActions.map((a) => (
                  <li key={a.id}>
                    <button type="button" disabled={busy === a.id || (a.once && taken.has(a.id))} data-busy={busy === a.id || undefined} className="qd-pr-act" onClick={() => runAction(a.id)}>
                      <span>{a.label}</span>
                      <span className="qd-pill">{taken.has(a.id) && a.once ? 'done' : `${a.costMinutes} min`}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {changeActions.length > 0 && (
              <div className="qd-pr-actgroup">
                <p className="qd-pr-actlabel">Changes</p>
                <ul className="qd-pr-actlist">
                  {changeActions.map((a) => (
                    <li key={a.id}>
                      <button type="button" disabled={busy === a.id || (a.once && taken.has(a.id))} className="qd-pr-act" onClick={() => runAction(a.id)}>
                        <span>{a.label}</span>
                        <span className="qd-pill">{taken.has(a.id) && a.once ? 'done' : `${a.costMinutes} min`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {escalateActions.length > 0 && (
              <div className="qd-pr-actgroup">
                <p className="qd-pr-actlabel">Escalate</p>
                <ul className="qd-pr-actlist">
                  {escalateActions.map((a) => (
                    <li key={a.id}>
                      <button type="button" disabled={busy === a.id || (a.once && taken.has(a.id))} className="qd-pr-act" onClick={() => runAction(a.id)}>
                        <span>{a.label}</span>
                        <span className="qd-pill">{taken.has(a.id) && a.once ? 'done' : `${a.costMinutes} min`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {attempt.guidance && (
              <p className="qd-pr-guidance" role="note">{attempt.guidance}</p>
            )}
            {scenario.tier !== 'expert' && (
              <div className="qd-pr-hints">
                <button type="button" className="qd-btn qd-btn--ghost" onClick={askHint} disabled={busy === 'hint'}>
                  Ask for a hint (−5 score)
                </button>
                {hintText && <p className="qd-pr-hinttext" role="note">{hintText}</p>}
              </div>
            )}
          </section>

          <section className="qd-card qd-pr-latest" aria-label="Latest evidence">
            <p className="qd-kicker">Latest evidence</p>
            {latest ? (
              <>
                <p className="qd-pr-latesttitle">{latest.title}</p>
                {(latest.lines || []).map((line, i) => (
                  <code key={i} className="qd-pr-logline">{line}</code>
                ))}
                {latest.kind === 'metrics' && (
                    <p className="qd-muted qd-pr-latestnote">Numbers here are synthetic, written for this scenario.</p>
                )}
              </>
            ) : (
              <p className="qd-muted">Nothing gathered yet. The dashboard is usually the cheapest first read.</p>
            )}
          </section>

          <section className="qd-card qd-pr-notes" aria-label="Notes and hypothesis">
            <label className="qd-pr-fieldlabel" htmlFor="qd-pr-hypothesis">State your hypothesis</label>
            <textarea
              id="qd-pr-hypothesis"
              className="qd-input qd-pr-notesarea"
              placeholder="What do you think is failing, and why?"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={3}
            />
            <label className="qd-pr-fieldlabel" htmlFor="qd-pr-notes">Scratch notes</label>
            <textarea
              id="qd-pr-notes"
              className="qd-input qd-pr-notesarea"
              placeholder="Times, service names, half-ideas — anything you want in the record."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <button type="button" className="qd-btn qd-btn--ghost" onClick={saveHypothesis} disabled={busy === 'hypothesis' || !hypothesis.trim()}>
              Save to the record
            </button>
          </section>
        </div>

        <div className="qd-pr-roomcol">
          <section className="qd-card qd-pr-timeline" aria-label="Incident timeline">
            <p className="qd-kicker">Timeline</p>
            <ol className="qd-pr-tllist">
              {attempt.timeline.map((row, i) => (
                <li key={`${row.kind}-${row.actionId || row.text}-${i}`} className={`qd-pr-tlrow qd-pr-tlrow--${row.kind}`}>
                  <span className="qd-pr-tlmin">{row.atSimMin}m</span>
                  <span className="qd-pr-tlbody">
                    {row.kind === 'action' ? (
                      <>
                        <b>{row.label}</b>
                        {row.reveal && <span className="qd-pr-tlreveal">{row.reveal.title}</span>}
                      </>
                    ) : row.text}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="qd-card qd-pr-resolve" aria-label="State your resolution">
            <p className="qd-kicker">State your resolution</p>
            <fieldset className="qd-pr-fieldset">
              <legend className="qd-pr-fieldlabel">Root cause</legend>
              <div className="qd-pr-opts">
                {scenario.rootCauses.map((rc) => (
                  <button
                    key={rc.id}
                    type="button"
                    className={`qd-pr-opt${rootPick === rc.id ? ' is-on' : ''}`}
                    onClick={() => setRootPick(rc.id)}
                    aria-pressed={rootPick === rc.id}
                  >
                    {rc.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="qd-pr-fieldset">
              <legend className="qd-pr-fieldlabel">Fix</legend>
              <div className="qd-pr-opts">
                {scenario.fixes.map((fx) => (
                  <button
                    key={fx.id}
                    type="button"
                    className={`qd-pr-opt${fixPick === fx.id ? ' is-on' : ''}`}
                    onClick={() => setFixPick(fx.id)}
                    aria-pressed={fixPick === fx.id}
                  >
                    {fx.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" className="qd-btn qd-btn--primary" onClick={resolve} disabled={busy === 'resolve' || !rootPick || !fixPick}>
              Resolve the incident
            </button>
            <p className="qd-muted qd-pr-resolvenote">Some fixes are safe, some do nothing, and some make things worse. The reveal scores the call you make.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
