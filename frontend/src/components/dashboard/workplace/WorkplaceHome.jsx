import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import { Icon } from '../icons.jsx';
import gotoRoute from '../nav.js';
import './workplace.css';

/* Workplace — the simulated first job at Setu Freight (fictional; always
   labelled a job simulation). The 3-step daily flow: Company Academy lesson →
   work ticket with the character chat → voice defend + deterministic
   scorecard. The scorecard is the engine's verdict, rendered exactly as the
   backend computed it — the UI adds no opinions. Voice input is browser
   speech-to-text (en-IN) with an always-available typed fallback; only the
   transcript is sent, never audio (DPDP). */

function authHeaders() {
  let token = null;
  try {
    token = localStorage.getItem('quadly:token');
  } catch {
    /* storage unavailable */
  }
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
}

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const STEP_ORDER = ['academy', 'ticket', 'defend'];
const STEP_LABELS = { academy: '1 · Academy', ticket: '2 · The work', defend: '3 · Defend' };

function CodeBlock({ code }) {
  if (!code) return null;
  return (
    <figure className="qd-wp-code">
      <figcaption className="qd-wp-code__file">{code.file}</figcaption>
      <pre className="qd-wp-code__body">
        {code.lines.map((line, i) => (
          <span className="qd-wp-code__line" key={i}>
            <span>{i + 1}</span>
            <span>{line || ' '}</span>
          </span>
        ))}
      </pre>
    </figure>
  );
}

function Scorecard({ verdict, onNext, nextLabel, onBack, hasOpen }) {
  const axes = Object.entries(verdict.rubric || {});
  return (
    <div className="qd-wp-score-wrap">
      <div className="qd-wp-score">
        <span className={`qd-wp-score__num${verdict.pass ? ' is-pass' : ''}`}>{verdict.overall}</span>
        <div className="qd-wp-score__meta">
          <b className={verdict.pass ? 'qd-notified' : ''}>{verdict.pass ? 'Verified — logged to your work record' : 'Not yet — specific, like production'}</b>
          <span className="qd-muted">
            {verdict.taskMarked ? 'Today’s plan task is done — your streak knows.' : 'Deterministic engine verdict — no AI graded this.'}
          </span>
        </div>
      </div>
      {axes.length > 0 && (
        <div className="qd-wp-axes">
          {axes.map(([axis, score]) => (
            <div className="qd-wp-axis" key={axis}>
              <div className="qd-wp-axis__top">
                <span>{axis.replace('_', ' ')}</span>
                <b>{score}</b>
              </div>
              <div className="qd-wp-axis__bar">
                <div className={`qd-wp-axis__fill${score >= 100 ? ' is-pass' : ''}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <ul className="qd-wp-checks">
        {(verdict.checks || []).map((c, i) => (
          <li key={i}>
            <Icon name="check" size={14} />
            <span className={c.pass ? 'is-pass' : 'is-fail'}>{c.note}</span>
          </li>
        ))}
      </ul>
      {verdict.feedback?.manager && <p className="qd-wp-manager">{verdict.feedback.manager}</p>}
      <div className="qd-caught__actions">
        {verdict.pass && hasOpen && (
          <button type="button" className="qd-btn qd-btn--primary" onClick={onNext}>
            {nextLabel || 'Open the next day'}
          </button>
        )}
        {verdict.pass && !hasOpen && (
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/workplace/record')}>
            See your work record
          </button>
        )}
        {!verdict.pass && (
          <button type="button" className="qd-btn qd-btn--primary" onClick={onBack}>
            Back to the ticket
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkplaceHome({ tab = 'today' }) {
  const [phase, setPhase] = useState('loading'); // loading | error | start | ready
  const [story, setStory] = useState(null);
  const [open, setOpen] = useState(null); // today's episode (server-shaped)
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [error, setError] = useState('');

  // flow state
  const [step, setStep] = useState('academy');
  const [quizPicks, setQuizPicks] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [thread, setThread] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [work, setWork] = useState('');
  const [choiceId, setChoiceId] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tierPick, setTierPick] = useState('guided');
  const [passport, setPassport] = useState(null);
  const recRef = useRef(null);
  const threadEndRef = useRef(null);

  const load = useCallback(() => {
    setPhase('loading');
    setError('');
    apiFetch('/workplace/story', { headers: authHeaders() })
      .then((res) => {
        setStory(res);
        const openEp = res.episodes.find((e) => e.status === 'open') || null;
        setOpen(openEp);
        setVerifiedCount(res.episodes.filter((e) => e.status === 'verified').length);
        setPhase(openEp ? 'ready' : (res.tier ? 'ready' : 'start'));
        setBusy(false);
        if (openEp) {
          setStep(openEp.academyDone ? 'ticket' : 'academy');
          setVerdict(null);
          setQuizPicks([]);
          setQuizResult(null);
          setWork('');
          setChoiceId(null);
          setTranscript('');
          setThread([{ who: 'them', name: openEp.ticket?.persona?.name || 'Manager', text: openEp.ticket?.intro || '' }]);
        }
      })
      .catch((err) => {
        if (err.message.includes('401') || /Not signed in/i.test(err.message)) {
          window.location.assign('/join');
          return;
        }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => { load(); }, [load, tab]);

  useEffect(() => {
    if (tab !== 'record' || phase !== 'ready') return;
    apiFetch('/workplace/passport', { headers: authHeaders() })
      .then(setPassport)
      .catch(() => setPassport(null));
  }, [tab, phase, verifiedCount]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [thread]);

  const start = (tier) => {
    setBusy(true);
    apiFetch('/workplace/start', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ tier }) })
      .then(load)
      .catch((e) => { setError(e.message); setBusy(false); });
  };

  const submitQuiz = () => {
    if (quizPicks.filter((p) => p !== undefined).length < open.academy.quiz.length) return;
    setBusy(true);
    apiFetch('/workplace/academy/complete', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ episodeId: open.id, answers: open.academy.quiz.map((_, i) => quizPicks[i]) }),
    })
      .then((res) => {
        setQuizResult(res);
        setBusy(false);
        if (res.unlocked) setStep('ticket');
      })
      .catch((e) => { setError(e.message); setBusy(false); });
  };

  const sendChat = () => {
    const message = chatInput.trim();
    if (!message) return;
    setThread((t) => [...t, { who: 'me', name: 'You', text: message }]);
    setChatInput('');
    apiFetch('/workplace/chat', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ episodeId: open.id, message }),
    })
      .then((res) => setThread((t) => [...t, { who: 'them', name: res.personaName || 'Manager', text: res.reply }]))
      .catch((e) => setThread((t) => [...t, { who: 'them', name: 'Setu Freight', text: e.message }]));
  };

  const toggleMic = () => {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!SR) return;
    const rec = new SR();
    recRef.current = rec;
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (event) => {
      let text = '';
      for (const res of event.results) text += res[0].transcript;
      setTranscript(text);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    rec.start();
    setRecording(true);
  };

  const submitWork = () => {
    if (open.ticket.inputKind === 'choice' ? !choiceId : work.trim().length < 5) return;
    setStep('defend');
  };

  const submitDefend = () => {
    if (transcript.trim().length < 10) return;
    setBusy(true);
    apiFetch('/workplace/submit', {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ episodeId: open.id, work, choiceId, defend: transcript.trim() }),
    })
      .then((res) => {
        setVerdict({ ...res.verdict, taskMarked: res.verdict.taskMarked });
        setBusy(false);
        if (res.verdict.pass) {
          setVerifiedCount((n) => n + 1);
          // Refresh the story in place so the Next-day label tells the truth;
          // the scorecard stays on screen (load() would wipe it).
          apiFetch('/workplace/story', { headers: authHeaders() })
            .then((fresh) => setStory(fresh))
            .catch(() => {});
        }
      })
      .catch((e) => { setError(e.message); setBusy(false); });
  };

  if (phase === 'error') {
    return (
      <div className="qd-center" role="alert">
        <h2 className="qd-h2">The workplace didn’t load</h2>
        <p className="qd-muted">{error || 'Check your connection and try again.'}</p>
        <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="qd-wp" aria-busy="true">
        <div className="skeleton" style={{ height: 90 }} />
        <div className="skeleton" style={{ height: 260 }} />
      </div>
    );
  }

  // -------------------------------------------------------- start screen --
  if (phase === 'start') {
    const tiers = story?.entitlement?.tiers || ['guided', 'standard'];
    const expertLocked = !(story?.entitlement?.tiers || []).includes('expert');
    return (
      <div className="qd-wp qd-wp-start">
        <section className="qd-card">
          <p className="qd-wp-lesson__kicker">Job simulation · Training, never work experience</p>
          <h2 className="qd-h2">Your first two weeks at {story?.story?.company || 'Setu Freight'}</h2>
          <p className="qd-wp-start__brief">{story?.story?.brief}</p>
          <p className="qd-wp-start__brief">
            Two weeks, one episode a day — a Company Academy lesson, a real-shaped ticket from your
            manager, and a spoken defend. The engine grades the work; the characters just talk.
          </p>
        </section>
        <section className="qd-card">
          <div className="qd-card__head">
            <h3 className="qd-card__title">How much scaffolding do you want?</h3>
          </div>
          <div className="qd-wp-tiers" role="radiogroup" aria-label="Difficulty tier">
            <button type="button" role="radio" aria-checked={tierPick === 'guided'} className={`qd-wp-tier${tierPick === 'guided' ? ' is-on' : ''}`} onClick={() => setTierPick('guided')}>
              <span><b>Guided</b><span>For beginners — the manager hints early, defends are lenient.</span></span>
            </button>
            <button type="button" role="radio" aria-checked={tierPick === 'standard'} className={`qd-wp-tier${tierPick === 'standard' ? ' is-on' : ''}`} onClick={() => setTierPick('standard')}>
              <span><b>Standard</b><span>The intended experience — hints on request, honest defends.</span></span>
            </button>
            <button type="button" role="radio" aria-checked={tierPick === 'expert'} disabled={expertLocked} className={`qd-wp-tier${tierPick === 'expert' ? ' is-on' : ''}`} onClick={() => setTierPick('expert')}>
              <span><b>Expert{expertLocked ? ' — paid plan' : ''}</b><span>Less help, tighter defends, manager gives you almost nothing.</span></span>
            </button>
          </div>
          <button type="button" className="qd-btn qd-btn--primary" disabled={busy} onClick={() => start(tierPick)}>
            Begin week 1 — day 1 is about 8 minutes
          </button>
          {error && <p className="qd-error" style={{ marginTop: 10 }}>{error}</p>}
        </section>
      </div>
    );
  }

  // ------------------------------------------------------- work record ----
  if (tab === 'record') {
    const eps = story?.episodes || [];
    return (
      <div className="qd-wp qd-wp-record">
        <section className="qd-card">
          <div className="qd-card__head">
            <h2 className="qd-card__title">Work record — {story?.story?.company}</h2>
            <span className="qd-badge">{verifiedCount} of {eps.length} verified</span>
          </div>
          {eps.length === 0 && <p className="qd-muted">Nothing yet — the simulation starts at the workplace.</p>}
          <div>
            {eps.map((e) => (
              <div className="qd-wp-eprow" key={e.id}>
                <span className="qd-wp-eprow__day">W{e.week} · D{e.day}</span>
                <span className="qd-wp-eprow__title">{e.title}</span>
                {e.lockedByPlan && <span className="qd-badge">Paid plan</span>}
                {e.attempt && !e.attempt.pass && <span className="qd-wp-eprow__score is-try">{e.attempt.overall} — retry</span>}
                {e.attempt?.pass && <span className="qd-wp-eprow__score is-pass">{e.attempt.overall} verified</span>}
                {!e.attempt && e.status !== 'locked' && <span className="qd-wp-eprow__score is-try">open</span>}
                {e.status === 'locked' && !e.lockedByPlan && <span className="qd-wp-eprow__score is-try">locked</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="qd-card">
          <div className="qd-card__head">
            <h3 className="qd-card__title">Interview stories (STAR)</h3>
          </div>
          <span className="qd-wp-label">{passport?.label || 'Job simulation — training record (never work experience)'}</span>
          {(!passport?.star || passport.star.length === 0) && (
            <p className="qd-muted" style={{ marginTop: 10 }}>
              Verified episodes become interview stories here — situation, action, result, in your own words.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {(passport?.star || []).map((s) => (
              <div className="qd-wp-star" key={s.episodeId}>
                <b>{s.title}</b>
                <p><b>Situation.</b> {s.situation}</p>
                <p><b>Action.</b> {s.action}</p>
                <p><b>Result.</b> {s.result}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="qd-card">
          <div className="qd-card__head">
            <h3 className="qd-card__title">This week’s gaps, from Priya</h3>
          </div>
          {(!passport?.gaps || passport.gaps.length === 0) && (
            <p className="qd-muted">Gaps appear after your first verified episode — one or two, never a wall of shame.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(passport?.gaps || []).map((g) => (
              <div className="qd-wp-star" key={g.axis}>
                <b>{g.axis.replace('_', ' ')} — {g.avg}/100 average</b>
                <p>{g.gap}</p>
                <p><b>This week:</b> {g.plan}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------- today flow ----
  const stepDone = { academy: step !== 'academy', ticket: step === 'defend', defend: Boolean(verdict?.pass) };

  return (
    <div className="qd-wp">
      <div className="qd-wp-head">
        <span className="qd-wp-head__count">
          {open ? `W${open.week}·D${open.day}` : '—'}
          <small> / {story?.story?.activeWeeks || 1}w</small>
        </span>
        <div>
          <h2 className="qd-wp-head__title">{open ? open.title : 'All caught up at work'}</h2>
          {open && (
            <p className="qd-muted">
              {open.weekday} · about {open.minutes} min · {open.ticket?.persona?.name}, {open.ticket?.persona?.role}
            </p>
          )}
        </div>
        <span className="qd-wp-head__spacer" />
        {story?.tier && <span className="qd-pill">{story.tier} tier</span>}
      </div>

      {!open && (
        <section className="qd-card">
          <h3 className="qd-h2">You’re verified through the starter story.</h3>
          <p className="qd-muted" style={{ marginTop: 8 }}>
            {verifiedCount} episodes verified. The next weeks of the story are being written — your
            work record and interview stories are ready in the meantime.
          </p>
          <div className="qd-caught__actions">
            <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/workplace/record')}>
              Open your work record
            </button>
          </div>
        </section>
      )}

      {open && (
        <div className="qd-wp-steps" role="tablist" aria-label="Episode steps">
          {STEP_ORDER.map((s) => (
            <span key={s} className={`qd-wp-step-dot${step === s ? ' is-on' : ''}${stepDone[s] ? ' is-done' : ''}`}>
              {stepDone[s] ? <Icon name="check" size={13} /> : null}
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>
      )}

      {open && step === 'academy' && (
        <section className="qd-card qd-wp-lesson">
          <p className="qd-wp-lesson__kicker">Company Academy · {open.academy.minutes} min</p>
          <h3 className="qd-card__title">{open.academy.title}</h3>
          {open.academy.body.map((p, i) => <p key={i}>{p}</p>)}
          <div className="qd-wp-quiz">
            {open.academy.quiz.map((q, qi) => (
              <div key={qi}>
                <p className="qd-wp-quiz__q">{q.q}</p>
                <div className="qd-wp-quiz" style={{ marginTop: 6 }}>
                  {q.options.map((opt, oi) => {
                    const picked = quizPicks[qi] === oi;
                    const graded = quizResult?.results?.[qi];
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={`qd-wp-quiz__opt${picked ? ' is-pick' : ''}${graded && oi === open.academy.quiz[qi].answer ? ' is-right' : ''}${graded && picked && !graded.correct ? ' is-wrong' : ''}`}
                        onClick={() => setQuizPicks((p) => { const n = [...p]; n[qi] = oi; return n; })}
                        disabled={Boolean(quizResult?.unlocked)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizResult?.results?.[qi] && (
                  <p className="qd-wp-quiz__why" style={{ marginTop: 6 }}>{quizResult.results[qi].why}</p>
                )}
              </div>
            ))}
          </div>
          {!quizResult?.unlocked && (
            <button type="button" className="qd-btn qd-btn--primary" disabled={busy || quizPicks.filter((p) => p !== undefined).length < open.academy.quiz.length} onClick={submitQuiz}>
              Check and open the ticket
            </button>
          )}
          {quizResult?.unlocked && (
            <button type="button" className="qd-btn qd-btn--primary" onClick={() => setStep('ticket')}>
              The ticket is open — go to work
            </button>
          )}
        </section>
      )}

      {open && step === 'ticket' && (
        <div className="qd-wp-ticket">
          <section className="qd-card">
            <div className="qd-card__head">
              <h3 className="qd-card__title">{open.ticket.channel === 'email' ? 'Email' : 'Chat'} — {open.ticket.persona?.name}</h3>
              <span className="qd-badge">{open.ticket.persona?.role}</span>
            </div>
            <div className="qd-wp-thread">
              {thread.map((m, i) => (
                <div key={i} className={`qd-wp-msg ${m.who === 'me' ? 'qd-wp-msg--me' : 'qd-wp-msg--them'}`}>
                  <span className="qd-wp-msg__who">{m.name}</span>
                  {m.text}
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
            <form className="qd-wp-chatrow" onSubmit={(e) => { e.preventDefault(); sendChat(); }}>
              <input
                className="qd-input"
                placeholder={`Ask ${open.ticket.persona?.name?.split(' ')[0] || 'your manager'} something…`}
                value={chatInput}
                maxLength={500}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="qd-btn qd-btn--ghost" disabled={!chatInput.trim()}>Send</button>
            </form>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {open.ticket.code && <CodeBlock code={open.ticket.code} />}
            <section className="qd-card">
              <div className="qd-wp-ask">
                <span className="qd-wp-ask__label">{open.ticket.ask}</span>
                {open.ticket.inputKind === 'choice' && open.ticket.choices && (
                  <div className="qd-wp-choices" role="radiogroup" aria-label="Pick your answer">
                    {open.ticket.choices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={choiceId === c.id}
                        className={`qd-wp-quiz__opt${choiceId === c.id ? ' is-pick' : ''}`}
                        onClick={() => setChoiceId(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  className="qd-input"
                  style={{ minHeight: 96, borderRadius: 12 }}
                  placeholder={open.ticket.inputKind === 'choice' ? 'And the why, in your own words…' : 'Write your answer…'}
                  value={work}
                  maxLength={4000}
                  onChange={(e) => setWork(e.target.value)}
                />
                <button
                  type="button"
                  className="qd-btn qd-btn--primary"
                  disabled={open.ticket.inputKind === 'choice' ? !choiceId : work.trim().length < 5}
                  onClick={submitWork}
                >
                  Defend this answer
                </button>
                <p className="qd-wp-defend__hint">Next step: you’ll say your reasoning out loud — that defend is the anti-copy-paste check.</p>
              </div>
            </section>
          </div>
        </div>
      )}

      {open && step === 'defend' && !verdict && (
        <section className="qd-card qd-wp-defend">
          <div className="qd-card__head">
            <h3 className="qd-card__title">Voice defend</h3>
            <span className="qd-badge">transcript only — audio is never stored</span>
          </div>
          <div className="qd-wp-defend__row">
            {SR && (
              <button type="button" className={`qd-wp-mic${recording ? ' is-rec' : ''}`} onClick={toggleMic}>
                <Icon name="mics" size={16} />
                {recording ? 'Stop' : 'Record your defend'}
              </button>
            )}
            {!SR && <span className="qd-muted">No mic support in this browser — type your defend below; same credit.</span>}
          </div>
          <div className="qd-wp-transcript">
            {SR && !recording && transcript
              ? <p>{transcript}</p>
              : (
                <textarea
                  aria-label="Your defend, typed"
                  placeholder={transcript || 'Say it here: what you did, and the one thing you checked before trusting it.'}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              )}
          </div>
          <p className="qd-wp-defend__hint">
            Your spoken or typed reasoning is checked against the episode’s key ideas — pasted work alone never passes.
          </p>
          <div className="qd-caught__actions">
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep('ticket')}>Back to the ticket</button>
            <button type="button" className="qd-btn qd-btn--primary" disabled={busy || transcript.trim().length < 10} onClick={submitDefend}>
              Submit for review
            </button>
          </div>
          {busy && <p className="qd-muted">The engine is checking your work…</p>}
        </section>
      )}

      {open && step === 'defend' && verdict && (
        <section className="qd-card">
          <div className="qd-card__head">
            <h3 className="qd-card__title">Manager review — {open.title}</h3>
          </div>
          <Scorecard
            verdict={verdict}
            hasOpen={Boolean(story?.episodes?.some((e) => e.status === 'open'))}
            nextLabel={story?.episodes?.find((e) => e.status === 'open') ? `Next: W${story.episodes.find((e) => e.status === 'open').week}·D${story.episodes.find((e) => e.status === 'open').day} — ${story.episodes.find((e) => e.status === 'open').title}` : undefined}
            onNext={load}
            onBack={() => { setVerdict(null); setStep('ticket'); }}
          />
        </section>
      )}
    </div>
  );
}
