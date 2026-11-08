import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* Voice interview practice (English) — speak the answer, see the score the
   code computed: key-point coverage, length, pace, fillers. The transcript
   is yours to fix before scoring, and to delete after. Audio is never stored.
   Browsers without speech recognition fall back to typing — the scoring is
   identical, which keeps the surface honest for everyone. */

const TYPE_PILL = { Behavioural: 'Behavioural', HR: 'HR' };

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function InterviewsPage() {
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [question, setQuestion] = useState(null); // { id, topic, question, timeSec }
  const [progress, setProgress] = useState({ attempted: 0, remaining: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState(null); // outline reveal
  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const recRef = useRef(null);
  const baseRef = useRef('');
  const timerRef = useRef(null);

  const load = useCallback(() => {
    setPhase('loading');
    Promise.all([
      apiFetch('/interview/next', { headers: authHeaders() }),
      apiFetch('/interview/voice/summary', { headers: authHeaders() }).catch(() => null),
    ])
      .then(([next, voiceSummary]) => {
        setQuestion(next.question);
        setProgress({ attempted: next.attempted, remaining: next.remaining, total: next.total });
        setSummary(voiceSummary);
        setTranscript('');
        setInterim('');
        setSeconds(0);
        setResult(null);
        setDetail(null);
        setPhase('ready');
        setError('');
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

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch { /* already ended */ }
    clearInterval(timerRef.current);
  }, []);

  // Auto-stop at three minutes: an interview answer is not a monologue.
  useEffect(() => {
    if (listening && seconds >= 180) stopRec();
  });

  function startRec() {
    if (!SR || listening) return;
    setTranscript('');
    setInterim('');
    baseRef.current = '';
    setSeconds(0);
    setResult(null);
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + ' ';
        else interimText += chunk;
      }
      if (finalText) baseRef.current = `${baseRef.current} ${finalText}`.trim();
      setInterim(interimText);
      setTranscript(`${baseRef.current} ${interimText}`.trim());
    };
    rec.onerror = (e) => {
      setNotice(e.error === 'not-allowed'
        ? 'Microphone permission was blocked — allow it, or type the answer instead.'
        : `Speech recognition hit an error (${e.error}). You can type the answer too.`);
      stopRec();
    };
    rec.onend = () => {
      setListening(false);
      clearInterval(timerRef.current);
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setNotice('Could not start the microphone — type the answer instead.');
    }
  }

  function stopRec() {
    try { recRef.current?.stop(); } catch { /* already ended */ }
    setListening(false);
    clearInterval(timerRef.current);
    setInterim('');
  }

  const revealOutline = async () => {
    if (detail) { setDetail(null); return; }
    setBusy(true);
    try {
      const res = await apiFetch(`/interview/questions/${question.id}`, { headers: authHeaders() });
      setDetail(res.question);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch('/interview/voice', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ qid: question.id, transcript, seconds }),
      });
      setResult(res);
      setProgress((p) => ({
        attempted: Math.min(p.total, p.attempted + 1),
        remaining: Math.max(0, p.remaining - 1),
        total: p.total,
      }));
      // Refresh only the trajectory — the fresh score panel stays up.
      apiFetch('/interview/voice/summary', { headers: authHeaders() })
        .then((s) => setSummary(s?.ok ? s : null))
        .catch(() => {});
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const nextQuestion = () => {
    setQuestion(null);
    load();
  };

  const loadQuestionById = async (qid) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(`/interview/questions/${qid}`, { headers: authHeaders() });
      setQuestion({ id: res.question.id, topic: res.question.topic, question: res.question.question });
      setResult(null);
      setTranscript('');
      setSeconds(0);
      setInterim('');
      setDetail(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const clearTranscripts = async () => {
    if (!window.confirm('Delete every stored interview transcript of yours? Scores stay; the words go.')) return;
    setBusy(true);
    try {
      await apiFetch('/interview/voice', { method: 'DELETE', headers: authHeaders() });
      setSummary(null);
      setNotice('Transcripts deleted.');
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

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
          <h2 className="qd-h2">Interviews couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  const summaryRows = summary?.rows ?? [];
  const fixPlan = summary?.fixPlan ?? [];

  return (
    <div className="qd-p">
      <header className="qd-p__head">
        <div>
          <p className="qd-kicker">Interview practice · English</p>
          <h2 className="qd-h2">Say the answer. The code scores it.</h2>
          <p className="qd-muted">
            Speak like it’s the real room — the scorer counts the key points a strong answer covers,
            how tight it is, your pace, and the fillers. No audio is ever stored; only your transcript,
            which you can delete below.
          </p>
        </div>
        <div className="qd-pills">
          <span className="qd-pill">{progress.attempted}/{progress.total} attempted</span>
          {summary?.avgScore != null && <span className="qd-pill">Avg {summary.avgScore}/100</span>}
        </div>
      </header>

      <div className="qd-p__grid">
        <aside className="qd-rail" aria-label="Your interview progress">
          <p className="qd-rail__cap">Trajectory</p>
          <div className="qd-rail__stats">
            <p className="qd-rail__statnum">{summary?.answered ?? 0}<span>/{summary?.total ?? '—'}</span></p>
            <p className="qd-rail__statlabel">questions scored{summary?.avgScore != null ? ` · avg ${summary.avgScore}/100` : ''}</p>
          </div>
          {fixPlan.length > 0 && (
            <>
              <p className="qd-rail__cap" style={{ marginTop: 8 }}>3-day fix plan</p>
              <ol className="qd-rail__list">
                {fixPlan.map((r, i) => (
                  <li key={r.qid}>
                    <button type="button" className="qd-rail__item" disabled={busy} onClick={() => loadQuestionById(r.qid)} title={r.question}>
                      <span className="qd-rail__num">{i + 1}</span>
                      <span className="qd-rail__body">
                        <span className="qd-rail__type">{r.topic}</span>
                        <span className="qd-rail__meta">last {r.score}/100 · retried {r.attempts}×</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
          <button type="button" className="qd-linkish" style={{ marginTop: 10 }} disabled={busy} onClick={clearTranscripts}>
            Delete my transcripts
          </button>
        </aside>

        <div className="qd-p__main">
          {question ? (
            <section className="qd-card qd-act" aria-label="Interview question">
              <div className="qd-act__kicker">
                <span className="qd-act__type">{TYPE_PILL[question.topic] ?? question.topic}</span>
                <span className="qd-pill qd-pill--tiny">spoken · ~2 min</span>
              </div>

              <h3 className="qd-act__q" style={{ fontSize: 19, lineHeight: 1.4 }}>{question.question}</h3>

              <div className="qd-iv__recrow">
                <button
                  type="button"
                  className={`qd-mic${listening ? ' is-live' : ''}`}
                  aria-label={listening ? 'Stop recording' : 'Start answering aloud'}
                  onClick={() => (listening ? stopRec() : startRec())}
                  disabled={!SR && !listening}
                >
                  <span className="qd-mic__dot" aria-hidden="true" />
                </button>
                <div className="qd-iv__recmeta">
                  {listening
                    ? <p className="qd-iv__live">Listening… {seconds}s — answer out loud, then stop.</p>
                    : SR
                      ? <p className="qd-iv__livestatic">Hit the mic and speak. Stop, check what it heard, then score.</p>
                      : <p className="qd-iv__livestatic">This browser can’t listen — type the answer below; the scoring is identical.</p>}
                  {seconds > 0 && !listening && <p className="qd-iv__livestatic">Recorded {seconds}s.</p>}
                  {interim && <p className="qd-iv__interim">…{interim}</p>}
                </div>
              </div>

              <textarea
                className="qd-sql"
                aria-label="Your answer transcript"
                placeholder={SR ? 'Your spoken words land here — fix mishears, then score.' : 'Type your answer — the scoring is identical to voice.'}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                spellCheck="false"
              />
              <p className="qd-muted" style={{ fontSize: 12, margin: '6px 0 0' }}>
                {transcript.split(/\s+/).filter(Boolean).length} words{seconds > 0 ? ` · ${seconds}s` : ''}
              </p>

              <div className="qd-act__actions">
                <button type="button" className="qd-btn qd-btn--primary" disabled={busy || transcript.trim().split(/\s+/).filter(Boolean).length < 5 || listening} onClick={submit}>
                  Score my answer
                </button>
                <button type="button" className="qd-btn qd-btn--ghost" disabled={busy} onClick={revealOutline}>
                  {detail ? 'Hide the outline' : 'What a strong answer covers'}
                </button>
              </div>
              {notice && <p className="qd-error" role="alert">{notice}</p>}

              {detail && (
                <div className="qd-fb is-ok" role="note">
                  <p className="qd-fb__head">A strong answer covers</p>
                  <ul className="qd-outline">
                    {detail.outline.map((o) => <li key={o}>{o}</li>)}
                  </ul>
                </div>
              )}

              {result && !result.error && (
                <div className={`qd-fb ${result.score >= 60 ? 'is-ok' : result.score >= 40 ? '' : 'is-no'}`} role="status">
                  <p className="qd-fb__head">
                    {result.score}/100
                    {result.firstScore != null && result.attemptNumber > 1 ? ` — before ${result.firstScore}, now ${result.score}.` : ' — first scored attempt.'}
                  </p>
                  <div className="qd-bar" role="img" aria-label={`Score ${result.score} of 100`}>
                    <i style={{ width: `${result.score}%` }} />
                  </div>
                  <p className="qd-fb__note"><b>Key points:</b> {result.breakdown.keyPointsHit}/{result.breakdown.keyPointsTotal} covered.</p>
                  {result.breakdown.hitPoints?.map((p) => <p key={p} className="qd-fb__note">✓ {p}</p>)}
                  {result.breakdown.missedPoints?.map((p) => <p key={p} className="qd-fb__note">✗ {p}</p>)}
                  <p className="qd-fb__note">
                    Length: {result.breakdown.wordCount} words (target ~{result.breakdown.targetWords})
                    {result.breakdown.wpm ? ` · pace ${result.breakdown.wpm} wpm` : ''} · filler words: {result.breakdown.fillers}
                  </p>
                  <p className="qd-fb__note">Time the answer aloud again — the same question, tighter. That’s the rep that moves interviews.</p>
                  <div className="qd-act__actions">
                    <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { setResult(null); setTranscript(''); setSeconds(0); setInterim(''); }}>
                      Answer again
                    </button>
                    <button type="button" className="qd-btn qd-btn--primary" onClick={nextQuestion}>
                      {progress.remaining > 0 ? 'Next question' : 'Recheck summary'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <div className="qd-card qd-done">
              <p className="qd-kicker">Interview practice</p>
              <h2 className="qd-h2">Every question has a score.</h2>
              <p className="qd-muted">
                {progress.total > 0
                  ? 'Answer again from the fix plan on the left — or re-attempt any question by reloading; the strongest attempts stay on record.'
                  : 'The question bank is unavailable right now.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
