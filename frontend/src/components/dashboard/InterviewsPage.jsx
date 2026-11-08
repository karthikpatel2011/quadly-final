import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './practice.css';
import './dashboard.css';

/* The mock interview room — built to feel like the real thing: the question
   is framed as the interviewer speaking it, the mic is the only furniture on
   the stage, and the outline ("what a strong answer covers") appears only in
   the debrief AFTER you answer. Scores are computed by code (key-point
   coverage, length, pace, fillers). No audio is stored; the transcript is
   yours to fix, and to delete. Typed answers are the honest fallback where
   speech recognition is missing — identical scoring. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function InterviewsPage() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState({ attempted: 0, remaining: 0, total: 0 });
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState(null); // outline — debrief only
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
      <div className="qd-ivrhome">
        <div className="qd-ivr">
          <div className="qd-iv-room skeleton" style={{ height: 280 }} />
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-ivrhome" role="alert">
        <div className="qd-ivr">
          <div className="qd-iv-room qd-p__err">
            <h2 className="qd-h2">The interview room couldn’t load</h2>
            <p className="qd-muted">{error}</p>
            <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const answeredById = Object.fromEntries((summary?.rows ?? []).map((r) => [r.qid, r]));
  const retryRound = question && answeredById[question.id];
  const counter = question
    ? (retryRound
        ? `Retry · ${retryRound.attempts} attempt${retryRound.attempts === 1 ? '' : 's'} so far · last ${retryRound.score}/100`
        : `Question ${Math.min(progress.attempted + 1, progress.total)} of ${progress.total}`)
    : '';
  const fixPlan = summary?.fixPlan ?? [];
  const debrief = result && !result.error ? result : null;

  return (
    <div className="qd-ivrhome">
      <div className="qd-ivr">
        {question ? (
          <section className="qd-iv-room" aria-label="Interview room">
            <div className="qd-iv-roomhead">
              <span className="qd-iv-topic">{question.topic}</span>
              {counter && <span className="qd-iv-count">{counter}</span>}
            </div>

            <div className="qd-iv-interviewer">
              <span className="qd-iv-avatar" aria-hidden="true">Q</span>
              <span className="qd-iv-name">Interviewer</span>
            </div>
            <p className="qd-iv-question">“{question.question}”</p>

            <div className="qd-iv-stagefoot">
              <button
                type="button"
                className={`qd-mic${listening ? ' is-live' : ''}`}
                aria-label={listening ? 'Stop answering' : 'Start answering aloud'}
                onClick={() => (listening ? stopRec() : startRec())}
                disabled={Boolean(debrief)}
              >
                <span className="qd-mic__dot" aria-hidden="true" />
              </button>
              <p className="qd-iv-stagestatus">
                {listening
                  ? <>Listening — {seconds}s. Answer out loud; stop when you’ve finished.</>
                  : SR
                    ? <>Hit the mic, say your answer, stop. One take counts.</>
                    : <>This browser can’t listen — write the answer below; it scores identically.</>}
                {seconds > 0 && !listening ? ` Recorded ${seconds}s.` : ''}
              </p>
            </div>
          </section>
        ) : (
          <section className="qd-iv-room" aria-label="Round complete">
            <div className="qd-iv-roomhead">
              <span className="qd-iv-topic">Round complete</span>
              <span className="qd-iv-count">{progress.attempted}/{progress.total} scored</span>
            </div>
            <p className="qd-iv-question">“That’s the round. Take this into the fix plan below.”</p>
          </section>
        )}

        {question && (
          <section className="qd-iv-transcriptbox" aria-label="Your answer transcript">
            <p className="qd-iv-transcap">
              {SR ? 'Your words land here — fix any mishears, then submit for scoring.' : 'Type your answer — the scoring is identical to voice.'}
            </p>
            <textarea
              className="qd-sql"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak your answer above, or type it here…"
              spellCheck="false"
            />
            <div className="qd-act__actions" style={{ marginTop: 10 }}>
              <button type="button" className="qd-btn qd-btn--primary" disabled={busy || Boolean(debrief) || listening || transcript.trim().split(/\s+/).filter(Boolean).length < 5} onClick={submit}>
                Submit — get scored
              </button>
              <span className="qd-iv-words">{transcript.split(/\s+/).filter(Boolean).length} words{seconds > 0 && !listening ? ` · ${seconds}s` : ''}</span>
            </div>
            {notice && <p className="qd-error" role="alert">{notice}</p>}
          </section>
        )}

        {debrief && (
          <section className={`qd-fb ${debrief.score >= 60 ? 'is-ok' : debrief.score >= 40 ? '' : 'is-no'}`} role="status" aria-label="Debrief">
            <p className="qd-fb__head">
              Debrief — {debrief.score}/100
              {debrief.firstScore != null && debrief.attemptNumber > 1 ? ` (before ${debrief.firstScore})` : ' (first attempt)'}
            </p>
            <div className="qd-bar" role="img" aria-label={`Score ${debrief.score} of 100`}>
              <i style={{ width: `${debrief.score}%` }} />
            </div>
            <p className="qd-fb__note"><b>Key points:</b> {debrief.breakdown.keyPointsHit}/{debrief.breakdown.keyPointsTotal} covered.</p>
            {debrief.breakdown.hitPoints?.map((p) => <p key={p} className="qd-fb__note">✓ {p}</p>)}
            {debrief.breakdown.missedPoints?.map((p) => <p key={p} className="qd-fb__note">✗ {p}</p>)}
            <p className="qd-fb__note">
              Length: {debrief.breakdown.wordCount} of ~{debrief.breakdown.targetWords} words
              {debrief.breakdown.wpm ? ` · pace ${debrief.breakdown.wpm} wpm` : ''} · fillers: {debrief.breakdown.fillers}
            </p>
            {detail && (
              <>
                <p className="qd-fb__head" style={{ marginTop: 12 }}>What a strong answer covers</p>
                <ul className="qd-outline">
                  {detail.outline.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </>
            )}
            <div className="qd-act__actions">
              {!detail && (
                <button type="button" className="qd-btn qd-btn--ghost" disabled={busy} onClick={async () => {
                  setBusy(true);
                  try {
                    const res = await apiFetch(`/interview/questions/${question.id}`, { headers: authHeaders() });
                    setDetail(res.question);
                  } finally { setBusy(false); }
                }}>
                  Show what a strong answer covers
                </button>
              )}
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { setResult(null); setTranscript(''); setSeconds(0); setInterim(''); }}>
                Answer again
              </button>
              {progress.remaining > 0 && (
                <button type="button" className="qd-btn qd-btn--primary" onClick={nextQuestion}>Next question</button>
              )}
            </div>
          </section>
        )}

        <div className="qd-iv-strip">
          <span className="qd-iv-strippill">{summary?.answered ?? 0}/{summary?.total ?? '—'} scored</span>
          {summary?.avgScore != null && <span className="qd-iv-strippill">avg {summary.avgScore}/100</span>}
          {fixPlan.map((r, i) => (
            <button key={r.qid} type="button" className="qd-iv-chip" disabled={busy} onClick={() => loadQuestionById(r.qid)} title={r.question}>
              Fix {i + 1}: {String(r.score)}/100 — {r.question.length > 34 ? r.question.slice(0, 34) + '…' : r.question}
            </button>
          ))}
          <button type="button" className="qd-linkish" disabled={busy} onClick={clearTranscripts}>
            Delete my transcripts
          </button>
        </div>
        <p className="qd-iv-privacy">No audio is stored — only your transcript, deletable above. Answers are scored by code: key-point coverage, length, pace, fillers.</p>
      </div>
    </div>
  );
}
