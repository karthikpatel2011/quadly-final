import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../workspace.css';
import './interviews.css';

/* The live interview room — a full-screen, Zoom-shaped stage: the interviewer
   panel above, the candidate's camera in the corner, one control bar, live
   captions. Voice out = browser TTS (en/hi/te); voice in = browser speech
   recognition in the session language, with an always-available typed input.
   No audio or video is stored anywhere. Refresh lands you back in the same
   session; the scripted director runs when no AI key is configured (honest
   chip), and switches to real conversation the moment one is. */

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const SR_LOCALE = { en: 'en-IN', 'hi-en': 'en-IN', auto: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
const TTS_LOCALE = { en: 'en-IN', 'hi-en': 'en-IN', auto: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

export default function InterviewRoom() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session') ?? '';

  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [ai, setAi] = useState(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [typed, setTyped] = useState('');
  const [turnPending, setTurnPending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [camError, setCamError] = useState('');
  const [notice, setNotice] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false); // request in flight
  const [endOpen, setEndOpen] = useState(false); // confirm dialog open
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recRef = useRef(null);
  const finalRef = useRef('');
  const startedRef = useRef(null);
  const langRef = useRef('en');

  const campreviewRef = useCallback((el) => {
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const speak = useCallback((text, language) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) { setSpeaking(false); return; }
      const locale = TTS_LOCALE[language] ?? 'en-IN';
      const u = new SpeechSynthesisUtterance(text);
      u.lang = locale;
      const voices = synth.getVoices();
      const exact = voices.find((v) => v.lang === locale)
        ?? voices.find((v) => v.lang?.startsWith(locale.split('-')[0]));
      if (exact) u.voice = exact;
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.cancel();
      synth.speak(u);
    } catch {
      setSpeaking(false);
    }
  }, []);

  const load = useCallback(async () => {
    setPhase('loading');
    try {
      const caps = await apiFetch('/interviews/capabilities', { headers: authHeaders() }).catch(() => null);
      setAi(caps?.ai ?? null);
      const res = await apiFetch(`/interviews/session/${sessionId}`, { headers: authHeaders() });
      const iv = res.interview;
      setSession(iv);
      setAi(res.ai);
      langRef.current = iv.language === 'auto' ? 'en' : (iv.language === 'hi-en' ? 'en' : iv.language === 'te-en' ? 'en' : iv.language);
      startedRef.current = iv.startedAt;
      if (iv.status === 'completed') {
        window.history.replaceState({}, '', `/app/interviews/report?session=${sessionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
      }
      setPhase('ready');
      const last = iv.transcript?.at(-1);
      if (last?.role === 'interviewer') {
        setTimeout(() => speak(last.text, iv.language), 500);
      }
    } catch (err) {
      if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
      setError(err.message);
      setPhase('error');
    }
  }, [sessionId, speak]);

  useEffect(() => { if (sessionId) load(); else { setError('No session id — start from the dashboard.'); setPhase('error'); } }, [load, sessionId]);

  // session clock
  useEffect(() => {
    const t = setInterval(() => {
      if (startedRef.current && session?.status === 'active') {
        setElapsed(Math.floor((Date.now() - Date.parse(startedRef.current)) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [session?.status]);

  // camera
  const startCam = async () => {
    if (streamRef.current) { setCamOn(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCamOn(true);
      setCamError('');
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); } }, 50);
    } catch {
      setCamOn(false);
      setCamError('Camera blocked or unavailable — audio-only mode.');
    }
  };
  const stopCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => t.stop());
    setCamOn(false);
  };

  // speech recognition — starts whenever the mic is live and the interviewer
  // is neither speaking nor thinking
  const recStateRef = useRef('off'); // off | on
  useEffect(() => {
    const want = listening;
    const can = Boolean(SR) && micOn && !speaking && !turnPending && session?.status === 'active';
    if (want && !can) {
      try { recRef.current?.stop(); } catch { /* already */ }
      recStateRef.current = 'off';
      setListening(false);
    }
    if (!want && can && micOn) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = SR_LOCALE[langRef.current] ?? 'en-IN';
      rec.onresult = (e) => {
        let finalText = '';
        let it = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const chunk = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += chunk + ' ';
          else it += chunk;
        }
        if (finalText) finalRef.current = `${finalRef.current} ${finalText}`.trim();
        setInterim(it);
      };
      rec.onend = () => { if (recStateRef.current === 'on') { setListening(false); } };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setNotice('Microphone permission blocked — unmute or type your answer.');
        }
      };
      recRef.current = rec;
      recStateRef.current = 'on';
      try { rec.start(); setListening(true); } catch { /* start race */ }
    }
  }, [listening, micOn, speaking, turnPending, session?.status, session?.language]);

  const submitTurn = async (text) => {
    const clean = String(text || '').trim();
    if (!clean || turnPending || session?.status !== 'active') return;
    setTurnPending(true);
    setInterim('');
    finalRef.current = '';
    setTyped('');
    try {
      const res = await apiFetch(`/interviews/session/${sessionId}/turn`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: clean }),
      });
      setSession(res.session);
      speak(res.turn.text, session.language);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setTurnPending(false);
    }
  };

  // autosubmit: when the recognizer finalises a sentence with 6+ words while live
  useEffect(() => {
    if (listening && finalRef.current.trim().split(/\s+/).filter(Boolean).length >= 6 && !speaking && !turnPending) {
      submitTurn(finalRef.current);
    }
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const endInterview = async () => {
    setEnding(true);
    try {
      try { recRef.current?.stop(); } catch { /* ended */ }
      window.speechSynthesis?.cancel();
      await apiFetch(`/interviews/session/${sessionId}/end`, { method: 'POST', headers: authHeaders() });
      window.history.replaceState({}, '', `/app/interviews/report?session=${sessionId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      setNotice(err.message);
      setEnding(false);
    }
  };

  const mkDownload = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${session.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase === 'loading') {
    return <div className="qd-room-root"><div className="qd-room-stage"><p className="qd-room-caps">Opening the room…</p></div></div>;
  }
  if (phase === 'error') {
    return (
      <div className="qd-room-root">
        <div className="qd-room-stage" role="alert">
          <h2 className="qd-h2">The room couldn’t open</h2>
          <p className="qd-muted">{error}</p>
          <div className="qd-act__actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => { window.history.pushState({}, '', '/app/interviews/dash'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Back to Interviews</button>
          </div>
        </div>
      </div>
    );
  }

  const turns = session?.transcript ?? [];
  const lastInterviewer = [...turns].reverse().find((t) => t.role === 'interviewer');
  const personaName = session?.personaName ?? 'Interviewer';
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const sec = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="qd-room-root">
      <header className="qd-room-bar">
        <span className="qd-room-mark">quadly · interviews</span>
        <span className="qd-room-rec">{speaking ? '● interviewer speaking' : listening ? '● listening to you' : turnoPendingLabel(turnPending)}</span>
        <span className="qd-room-timer">{m}:{sec}</span>
        <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setShowTranscript((v) => !v)}>Transcript</button>
        <button type="button" className="qd-btn qd-room-end" onClick={() => setEndOpen(true)}>End interview</button>
      </header>

      <div className="qd-room-stage">
        {!ai && <span className="qd-room-modechip" role="note">Scripted interviewer · set LLM_API_KEY for full AI conversation</span>}
        <div className={`qd-interviewer${speaking ? ' is-speaking' : ''}`}>
          <span className="qd-interviewer__avatar" aria-hidden="true">{personaName.charAt(0)}</span>
          <div>
            <b>{personaName}</b>
            <span>{session.role} · {session.company || 'practice round'}</span>
          </div>
        </div>

        <p className="qd-room-captions" aria-live="polite">
          {speaking || lastInterviewer ? `“${lastInterviewer?.text ?? ''}”` : 'The interviewer is joining…'}
        </p>
        {turnPending && <p className="qd-room-caps">The interviewer is thinking…</p>}
        {interim && captions && <p className="qd-room-interim">You: {interim}</p>}

        <div className="qd-room-actionsrow">
          {!listening ? (
            <button type="button" className="qd-room-cta" onClick={() => setMicOn(true)} disabled={!SR || speaking || turnPending}>
              {SR ? 'Answer now (voice)' : 'Listening unavailable — type below'}
            </button>
          ) : (
            <button type="button" className="qd-room-cta qd-room-cta--stop" onClick={() => setMicOn(false)}>
              Mic live — click to hush
            </button>
          )}
        </div>

        <form
          className="qd-room-typed"
          onSubmit={(e) => { e.preventDefault(); submitTurn(typed || finalRef.current); }}
        >
          <input
            className="qd-room-input"
            placeholder="…or type your answer and press Enter"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={turnPending || session.status !== 'active'}
          />
          <button type="submit" className="qd-btn qd-btn--primary" disabled={turnPending || !(typed.trim() || finalRef.current.trim())}>
            Send
          </button>
        </form>

        {camError && <p className="qd-room-camerror">{camError}</p>}
      </div>

      {camOn && <div className="qd-room-pip"><video ref={campreviewRef} muted playsInline aria-label="Your camera" /></div>}

      <footer className="qd-room-controls">
        <button type="button" className={`qd-ctrl${session.status === 'active' && micOn ? ' is-on' : ''}`} onClick={() => setMicOn((v) => !v)} aria-pressed={micOn}>
          <b>Mic</b><span>{micOn ? 'on' : 'muted'}</span>
        </button>
        <button type="button" className={`qd-ctrl${camOn ? ' is-on' : ''}`} onClick={() => (camOn ? stopCam() : startCam())}>
          <b>Camera</b><span>{camOn ? 'on' : 'off'}</span>
        </button>
        <button type="button" className={`qd-ctrl${captions ? ' is-on' : ''}`} onClick={() => setCaptions((v) => !v)} aria-pressed={captions}>
          <b>Captions</b><span>{captions ? 'on' : 'off'}</span>
        </button>
        <label className="qd-ctrl" title="Conversation language">
          <b>Language</b>
          <select
            value={session.language}
            onChange={(e) => {
              const nl = e.target.value;
              setSession((s) => ({ ...s, language: nl }));
              langRef.current = nl === 'auto' || nl === 'hi-en' || nl === 'te-en' ? 'en' : nl;
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
            <option value="hi-en">Hindi + English</option>
            <option value="te-en">Telugu + English</option>
            <option value="auto">Auto</option>
          </select>
        </label>
        <button type="button" className="qd-ctrl qd-ctrl--end" onClick={() => setEndOpen(true)}><b>End</b><span>interview</span></button>
      </footer>

      {showTranscript && (
        <div className="qd-room-transcript" role="log" aria-label="Interview transcript">
          {turns.map((t, i) => (
            <p key={i} className={t.role === 'interviewer' ? 'is-int' : 'is-cand'}>
              <b>{t.role === 'interviewer' ? personaName : 'You'}:</b> {t.text}
            </p>
          ))}
          <button type="button" className="qd-btn qd-btn--ghost" onClick={mkDownload}>Download transcript (JSON)</button>
        </div>
      )}

      {endOpen && (
        <div className="qd-room-confirm" role="alertdialog" aria-label="End interview">
          <p><b>End this interview now?</b></p>
          <p className="qd-muted">The transcript is saved and your report is generated from it.</p>
          <div className="qd-act__actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setEndOpen(false)}>Keep talking</button>
            <button type="button" className="qd-btn qd-room-end" onClick={endInterview} disabled={ending}>End and see my report</button>
          </div>
        </div>
      )}
      {notice && <p className="qd-room-notice" role="alert">{notice}</p>}
      {session.status !== 'active' && (
        <div className="qd-room-confirm">
          <p><b>This session has ended.</b></p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { window.history.replaceState({}, '', `/app/interviews/report?session=${sessionId}`); window.dispatchEvent(new PopStateEvent('popstate')); }}>
            Open the report
          </button>
        </div>
      )}
    </div>
  );
}

function turnoPendingLabel(pending) {
  return pending ? '● thinking' : '● waiting for you';
}
