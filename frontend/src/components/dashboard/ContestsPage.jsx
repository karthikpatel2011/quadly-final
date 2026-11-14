import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './workspace.css';
import './dashboard.css';

/* Contests — the weekly Mock Drive's schedule and seats. The full multi-student
   drive (timed sections, group discussions) is deliberately parked until the
   product has that scale (PRD §4); this surface keeps the recurring Saturday
   slot real: seat, withdraw, and the live window. No invented content. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

function istDay(dateISO) {
  return new Date(dateISO).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });
}

export default function ContestsPage() {
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [drive, setDrive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setPhase('loading');
    apiFetch('/drive/next', { headers: authHeaders() })
      .then((res) => { setDrive(res); setPhase('ready'); setError(''); })
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

  const act = async (path) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(path, { method: 'POST', headers: authHeaders() });
      setDrive(res);
    } catch (err) {
      setNotice(err.message);
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
          <h2 className="qd-h2">Contests couldn’t load</h2>
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
          <p className="qd-kicker">Contests · Mock Drive</p>
          <h2 className="qd-h2">One slot a week, against the clock.</h2>
          <p className="qd-muted">
            Every Saturday, 15:00 IST — the week’s prep meets real pressure, with other students
            driving at the same time. Seats are limited and honest.
          </p>
        </div>
        {drive?.live && <span className="qd-pill qd-live">Live now</span>}
      </header>

      <section className="qd-card qd-drive" aria-label="Next mock drive">
        <div className="qd-drive__when">
          <p className="qd-drive__day">{istDay(drive.startsAt)}</p>
          <p className="qd-muted">
            {drive.registered} of {drive.capacity} seats taken
            {drive.registeredByMe ? ' · you hold one' : ''}
          </p>
        </div>
        <div className="qd-drive__cta">
          {drive.live ? (
            <span className="qd-pill">The room is open — your daily practice and interviews are the sections.</span>
          ) : drive.registeredByMe ? (
            <button type="button" className="qd-btn qd-btn--ghost" disabled={busy} onClick={() => act('/drive/withdraw')}>
              Withdraw my seat
            </button>
          ) : (
            <button type="button" className="qd-btn qd-btn--primary" disabled={busy} onClick={() => act('/drive/register')}>
              Take a seat
            </button>
          )}
        </div>
        {notice && <p className="qd-error" role="alert">{notice}</p>}
      </section>

      <div className="qd-card qd-p__note">
        <p className="qd-muted">
          The full multi-student drive format (timed sections and group
          discussions) is parked until the cohort is big enough to fill rooms
          honestly — it returns the moment that scale is real (PRD §4).
          Meanwhile the Saturday slot is where the week gets tested.
        </p>
      </div>
    </div>
  );
}
