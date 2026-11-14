import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../workspace.css';
import '../dashboard.css';
import './interviews.css';

/* Interview setup — a proper multi-step configuration flow: company → reference
   documents → role → resume → interview shape → device & final check. Files
   (PDF/DOCX/TXT) are parsed by the backend; the candidate sees exactly what
   was extracted. Nothing is fabricated from thin air. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const gotoRoute = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

const POPULAR = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte', 'Zoho', 'Freshworks'];
const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer', 'Data Analyst', 'UI/UX Designer', 'Product Manager', 'Cybersecurity Analyst', 'DevOps Engineer'];
const TYPES = ['HR', 'Technical', 'Behavioral', 'Coding', 'Managerial', 'System Design', 'Company-Specific', 'Complete Recruitment'];
const LEVELS = ['Fresher', 'Intern', 'Junior', 'Mid-level', 'Senior', 'Experienced professional'];
const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'te', label: 'తెలుగు (Telugu)' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'te-en', label: 'Telugu + English mixed' },
  { id: 'hi-en', label: 'Hindi + English mixed' },
  { id: 'auto', label: 'Let the interviewer ask me' },
];
const PERSONAS = [
  { id: 'friendly', label: 'Friendly HR Recruiter — Priya' },
  { id: 'manager', label: 'Professional Hiring Manager — Alex' },
  { id: 'strict', label: 'Strict Technical Interviewer — Rao' },
  { id: 'senior', label: 'Senior Software Engineer — Meera' },
  { id: 'analytical', label: 'Analytical Interviewer — Vikram' },
];

const STEP_LABELS = ['Company', 'Documents', 'Role', 'Resume', 'Interview shape', 'Language', 'Final check'];

async function fileToText(file) {
  const dataB64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const kind = file.name.toLowerCase().endsWith('.pdf') ? 'pdf'
    : file.name.toLowerCase().endsWith('.docx') ? 'docx' : 'txt';
  return apiFetch('/interviews/extract', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name: file.name, kind, dataB64 }),
  });
}

export default function InterviewSetup() {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [docs, setDocs] = useState([]); // {name, text, chars}
  const [docBusy, setDocBusy] = useState('');
  const [role, setRole] = useState('');
  const [resume, setResume] = useState(null); // {name, text, chars, skills}
  const [resumeBusy, setResumeBusy] = useState(false);
  const [types, setTypes] = useState(['Technical']);
  const [level, setLevel] = useState('Fresher');
  const [persona, setPersona] = useState('manager');
  const [language, setLanguage] = useState('en');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);

  // Bento presets from the studio dashboard: technical deep-dive and the quick
  // HR round land with their type and interviewer style pre-selected.
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get('preset');
    if (preset === 'technical') { setTypes(['Technical', 'System Design']); setPersona('strict'); }
    if (preset === 'hr') { setTypes(['HR', 'Behavioral']); setPersona('friendly'); }
  }, []);

  // device check
  const [devices, setDevices] = useState({ cam: 'idle', mic: 'idle' }); // idle|granted|denied
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch?.(() => {});
  }, []);

  const runDeviceCheck = async () => {
    if (devices.cam !== 'idle') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setDevices({ cam: 'granted', mic: 'granted' });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((n, v) => n + v, 0) / buf.length;
        setMicLevel(Math.min(100, Math.round((avg / 140) * 100)));
        requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setDevices({ cam: 'denied', mic: 'denied' });
    }
  };

  useEffect(() => { if (step === 6) runDeviceCheck(); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadDocs = async (fileList) => {
    for (const file of Array.from(fileList).slice(0, 5)) {
      setDocBusy(file.name);
      try {
        const res = await fileToText(file);
        setDocs((d) => [...d.filter((x) => x.name !== res.name), { name: res.name, text: res.text, chars: res.chars }]);
      } catch (err) {
        setNotice(`${file.name}: ${err.message}`);
      } finally { setDocBusy(''); }
    }
  };

  const uploadResume = async (file) => {
    setResumeBusy(true);
    try {
      const res = await fileToText(file);
      setResume({ name: file.name, text: res.text, chars: res.chars });
      setNotice('');
    } catch (err) {
      setNotice(err.message);
    } finally { setResumeBusy(false); }
  };

  const canNext = [
    company.trim().length >= 2,
    true,
    role.trim().length >= 2,
    Boolean(reserveResume()),
    types.length > 0,
    Boolean(language),
    true,
  ][step];
  function reserveResume() { return resume; } // resume is optional-with-warning; kept explicit

  const createAndJoin = async () => {
    setCreating(true);
    try {
      const res = await apiFetch('/interviews/session', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          company, role, interviewTypes: types, level, language, persona,
          resumeText: resume?.text ?? '',
          companyDocs: docs.map((d) => ({ name: d.name, text: d.text })),
        }),
      });
      gotoRoute(`/app/interviews/mock?session=${res.id}&fresh=1`);
    } catch (err) {
      setNotice(err.message);
      setCreating(false);
    }
  };

  const filteredPopular = POPULAR.filter((c) => c.toLowerCase().includes(companySearch.toLowerCase()));

  return (
    <div className="qd-ivrhome">
      <div className="qd-ivr">
        <header className="qd-iv-boardhead">
          <div>
            <p className="qd-kicker">Set up your interview</p>
            <h2 className="qd-h2">{STEP_LABELS[step]}</h2>
          </div>
          <div className="qd-setup-steps" aria-label={`Step ${step + 1} of ${STEP_LABELS.length}`}>
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`qd-setup-step${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`} title={label}>{i + 1}</span>
            ))}
          </div>
        </header>

        {notice && <p className="qd-error" role="alert">{notice}</p>}

        {step === 0 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">Which company are you preparing for?</p>
            <input className="qd-iv-input" placeholder="Search or type a company name" value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} autoFocus />
            <div className="qd-iv-chips">
              {filteredPopular.map((c) => (
                <button key={c} type="button" className={`qd-iv-chip${company === c ? ' is-on' : ''}`} onClick={() => { setCompany(c); setCompanySearch(''); setStep(1); }}>
                  {c}
                </button>
              ))}
            </div>
            {companySearch.trim().length >= 2 && !filteredPopular.some((c) => c.toLowerCase() === companySearch.toLowerCase()) && (
              <button type="button" className={`qd-iv-chip${company === companySearch.trim() ? ' is-on' : ''}`} onClick={() => { setCompany(companySearch.trim()); setStep(1); }}>
                Custom company: “{companySearch.trim()}”
              </button>
            )}
            {company && (
              <div className="qd-act__actions">
                <button type="button" className="qd-btn qd-btn--primary" onClick={() => setStep(1)}>Continue with {company}</button>
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="qd-room">
            <p className="qd-iv-question">Upload company documents <span className="qd-iv-optional">— optional</span></p>
            <p className="qd-muted">Job descriptions, recruitment PDFs, preparation notes — PDF, DOCX or TXT, up to five files. The interviewer quotes only what these documents actually say; nothing is invented.</p>
            <label className="qd-uploader">
              <input type="file" multiple accept=".pdf,.docx,.txt,.md" hidden onChange={(e) => uploadDocs(e.target.files)} />
              <b>{docBusy ? `Reading ${docBusy}…` : 'Drag files here or click to browse'}</b>
              <span>PDF · DOCX · TXT — parsed text is previewed, never guessed</span>
            </label>
            {docs.map((d) => (
              <div key={d.name} className="qd-iv-docrow">
                <b>{d.name}</b>
                <span>{d.chars.toLocaleString('en-IN')} characters extracted</span>
                <textarea className="qd-sql" rows={3} value={d.text.slice(0, 400)} readOnly aria-label={`Extracted preview of ${d.name}`} />
                <button type="button" className="qd-linkish" onClick={() => setDocs((arr) => arr.filter((x) => x.name !== d.name))}>Remove</button>
              </div>
            ))}
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(0)}>‹ Back</button>
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => setStep(2)}>{docs.length ? 'Continue' : 'Skip — no documents'}</button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">Which position are you applying for?</p>
            <div className="qd-iv-chips">
              {ROLES.map((r) => (
                <button key={r} type="button" className={`qd-iv-chip${role === r ? ' is-on' : ''}`} onClick={() => setRole(r)}>{r}</button>
              ))}
            </div>
            <input className="qd-iv-input" placeholder="Or type a custom job title" value={role} onChange={(e) => setRole(e.target.value)} maxLength={60} />
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(1)}>‹ Back</button>
              <button type="button" className="qd-btn qd-btn--primary" disabled={role.trim().length < 2} onClick={() => setStep(3)}>Continue</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">Upload your latest resume <span className="qd-iv-optional">— recommended</span></p>
            <p className="qd-muted">The interviewer asks about YOUR projects and skills — never invented ones. PDF, DOCX or TXT. The parsed text is shown before we continue.</p>
            <label className="qd-uploader">
              <input type="file" accept=".pdf,.docx,.txt,.md" hidden disabled={resumeBusy} onChange={(e) => e.target.files?.[0] && uploadResume(e.target.files[0])} />
              <b>{resumeBusy ? 'Reading your resume…' : resume ? resume.name : 'Click to browse'}</b>
              <span>{resume ? `${resume.chars.toLocaleString('en-IN')} characters parsed` : 'PDF · DOCX · TXT'}</span>
            </label>
            {resume && (
              <div className="qd-iv-docrow">
                <b>What the interviewer can see from it</b>
                <textarea className="qd-sql" rows={6} value={resume.text.slice(0, 1200)} readOnly aria-label="Parsed resume content" />
              </div>
            )}
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(2)}>‹ Back</button>
              <button type="button" className={`qd-btn ${resume ? 'qd-btn--primary' : 'qd-btn--ghost'}`} onClick={() => setStep(4)}>
                {resume ? 'Looks right — continue' : 'Skip — ask generic questions instead'}
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">What kind of interview, and at what level?</p>
            <p className="qd-muted" style={{ margin: '0 0 8px' }}>Interview types (pick any)</p>
            <div className="qd-iv-chips">
              {TYPES.map((t) => (
                <button key={t} type="button" className={`qd-iv-chip${types.includes(t) ? ' is-on' : ''}`} onClick={() => setTypes((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]))}>{t}</button>
              ))}
            </div>
            <p className="qd-muted" style={{ margin: '14px 0 8px' }}>Experience level</p>
            <div className="qd-iv-chips">
              {LEVELS.map((l) => <button key={l} type="button" className={`qd-iv-chip${level === l ? ' is-on' : ''}`} onClick={() => setLevel(l)}>{l}</button>)}
            </div>
            <p className="qd-muted" style={{ margin: '14px 0 8px' }}>Interviewer style</p>
            <div className="qd-iv-chips">
              {PERSONAS.map((p) => <button key={p.id} type="button" className={`qd-iv-chip${persona === p.id ? ' is-on' : ''}`} onClick={() => setPersona(p.id)}>{p.label}</button>)}
            </div>
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(3)}>‹ Back</button>
              <button type="button" className="qd-btn qd-btn--primary" disabled={types.length === 0 || !level} onClick={() => setStep(5)}>Continue</button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">Which language should the interview run in?</p>
            <p className="qd-muted">
              The interviewer actually speaks it (browser voices), and the speech recognition listens in it.
              Mixed modes expect natural code-switching — “actually, nenu React lo oka project build chesanu” —
              recognition is strongest one language per sentence.
            </p>
            <div className="qd-iv-chips">
              {LANGS.map((l) => <button key={l.id} type="button" className={`qd-iv-chip${language === l.id ? ' is-on' : ''}`} onClick={() => setLanguage(l.id)}>{l.label}</button>)}
            </div>
            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(4)}>‹ Back</button>
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => setStep(6)}>Continue to final check</button>
            </div>
          </section>
        )}

        {step === 6 && (
          <section className="qd-iv-room">
            <p className="qd-iv-question">Final check — then the room.</p>
            <ul className="qd-iv-summary">
              <li><span>Company</span><b>{company}</b></li>
              <li><span>Role</span><b>{role}</b></li>
              <li><span>Interview types</span><b>{types.join(', ')}</b></li>
              <li><span>Level</span><b>{level}</b></li>
              <li><span>Language</span><b>{LANGS.find((l) => l.id === language)?.label}</b></li>
              <li><span>Resume</span><b>{resume ? `${resume.name} · parsed` : 'Not uploaded — generic questions'}</b></li>
              <li><span>Company documents</span><b>{docs.length ? docs.map((d) => d.name).join(', ') : 'None uploaded'}</b></li>
              <li><span>Interviewer</span><b>{PERSONAS.find((p) => p.id === persona)?.label}</b></li>
            </ul>

            <p className="qd-muted" style={{ margin: '16px 0 8px', fontWeight: 600 }}>Devices & connection</p>
            {devices.cam === 'idle' && <button type="button" className="qd-btn qd-btn--ghost" onClick={runDeviceCheck}>Test camera & microphone</button>}
            <div className="qd-checks">
              <div className="qd-checkrow">
                <video ref={videoRef} className="qd-campreview" muted playsInline aria-label="Camera preview" />
                <div>
                  <p className={`qd-checkline${devices.cam === 'granted' ? ' is-ok' : devices.cam === 'denied' ? ' is-no' : ''}`}>
                    Camera: {devices.cam === 'granted' ? 'working' : devices.cam === 'denied' ? 'blocked — the interview still runs, you just appear as a circle' : devices.cam}
                  </p>
                  <p className={`qd-checkline${devices.mic === 'granted' ? ' is-ok' : ''}`}>
                    Microphone: {devices.mic === 'granted' ? `working — level ${micLevel}%` : devices.mic === 'denied' ? 'blocked — use the typed fallback' : devices.mic}
                  </p>
                  <div className="qd-bar" role="img" aria-label={`Microphone level ${micLevel}%`}><i style={{ width: `${micLevel}%` }} /></div>
                  <p className="qd-checkline">Connection: {navigator.onLine ? 'online' : 'offline — interviews need a connection'}</p>
                  <p className="qd-checkline">Mode: audio-first · camera stays optional</p>
                </div>
              </div>
            </div>

            <div className="qd-act__actions">
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => setStep(5)}>‹ Back</button>
              <button type="button" className="qd-btn qd-btn--primary" disabled={creating || navigator.onLine === false} onClick={createAndJoin}>
                {creating ? 'Preparing the room…' : 'Join interview'}
              </button>
            </div>
            <p className="qd-muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
              Scores are transparent coaching estimates — not hiring predictions.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
