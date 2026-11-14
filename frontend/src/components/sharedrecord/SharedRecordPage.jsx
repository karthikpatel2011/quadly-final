import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import Logo from '../Logo.jsx';
import './shared-record.css';

// Public work record — the read-only page a shared link opens. No sign-in,
// no identity: the link carries the work (incident, path, score, postmortem,
// defend), and nothing else. Land on 404 and the page says so, calmly.

export default function SharedRecordPage({ token }) {
  const [phase, setPhase] = useState('loading'); // loading | ready | missing
  const [record, setRecord] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/practice/work-record/shared/${encodeURIComponent(token || '')}`)
      .then((res) => { if (!cancelled) { setRecord(res.record); setPhase('ready'); } })
      .catch(() => { if (!cancelled) setPhase('missing'); });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => { document.title = 'Quadly — Shared work record'; }, []);

  return (
    <div className="srec">
      <header className="srec-top">
        <a href="/" aria-label="Quadly home"><Logo /></a>
        <span className="srec-tag">Student work record</span>
      </header>

      {phase === 'loading' && <div className="srec-card srec-skel" />}

      {phase === 'missing' && (
        <main className="srec-card" role="alert">
          <h2>This record is private or no longer shared</h2>
          <p>The student can create a new link whenever it is needed.</p>
        </main>
      )}

      {phase === 'ready' && record && (
        <main className="srec-card">
          <p className="srec-kicker">Incident handled in Quadly practice</p>
          <h2 className="srec-title">{record.scenario.title}</h2>
          <p className="srec-dim">
            Modeled on a public postmortem by {record.scenario.company}. {record.scenario.inspiredByNote}
          </p>

          <div className="srec-row"><b>Score</b><span>{record.score ? `${record.score.total}/100` : '—'}</span></div>
          <div className="srec-row"><b>Root cause</b><span>{record.scenario.lesson ? 'found and resolved' : '—'}</span></div>
          {record.path?.hypothesis && (
            <div className="srec-row"><b>Hypothesis</b><span>{record.path.hypothesis}</span></div>
          )}
          {record.defend && (
            <div className="srec-row"><b>Defend step</b><span>{record.defend.score}/100</span></div>
          )}

          {record.postmortem && (() => {
            const latest = record.postmortem.versions[record.postmortem.current - 1];
            if (!latest?.body) return null;
            return (
              <section className="srec-pm">
                <p className="srec-kicker">Postmortem</p>
                <p><b>{latest.body.happened}</b></p>
                <p><span className="srec-dim">Impact: </span>{latest.body.impact}</p>
                <p><span className="srec-dim">Root cause: </span>{latest.body.rootCause}</p>
                <p><span className="srec-dim">Fix: </span>{latest.body.fix}</p>
                <p><span className="srec-dim">Prevention: </span>{latest.body.prevention}</p>
              </section>
            );
          })()}

          <p className="srec-dim srec-foot">
            Read-only record from Quadly, a placement-practice product. <a href="/" className="srec-link">Quadly home</a>
          </p>
        </main>
      )}
    </div>
  );
}
