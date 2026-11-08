import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './admin.css';

/* Admin control surface — application queue, onboarding profiles, ambassador
   roster, careers management and the mail center. Reached at /admin; never
   linked from the public pages.
   Sign-in: email + password from backend/.env (ADMIN_EMAIL / ADMIN_PASSWORD);
   the issued session token travels as a Bearer header and lives in
   sessionStorage. Delivery adapter for mail: SMTP envs (see lib/mailer.js). */

const TABS = [
  ['applications', 'Applications'],
  ['profiles', 'Profiles'],
  ['roster', 'Roster'],
  ['careers', 'Careers'],
  ['official-items', 'Official items'],
  ['mail', 'Mail'],
];

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${sessionStorage.getItem('quadly:admintoken') || ''}`,
});

export default function AdminApp() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('quadly:admintoken');
    } catch {
      return null;
    }
  });
  const [login, setLogin] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('applications');

  const [apps, setApps] = useState(null);
  const [profiles, setProfiles] = useState(null);
  const [roster, setRoster] = useState(null);
  const [careers, setCareers] = useState(null);
  const [mail, setMail] = useState(null);

  // Careers create form
  const [job, setJob] = useState({ title: '', team: '', type: 'Full-time', location: '', description: '' });
  // Mail compose
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  // Official college items (Home "Your college this week")
  const [official, setOfficial] = useState(null);
  const [noticeItem, setNoticeItem] = useState({ title: '', body: '', link: '', college: 'all', startsAt: '', endsAt: '' });

  async function load(which) {
    try {
      const res = await apiFetch(`/admin/${which}`, { headers: authHeaders() });
      if (which === 'applications') setApps(res);
      if (which === 'profiles') setProfiles(res);
      if (which === 'roster') setRoster(res);
      if (which === 'careers') setCareers(res);
      if (which === 'mail') setMail(res);
      if (which === 'official-items') setOfficial(res);
      setNotice('');
    } catch (err) {
      if (err.message.includes('403')) {
        sessionStorage.removeItem('quadly:admintoken');
        setToken(null);
      }
      setNotice('Could not load ' + which + ' — ' + err.message);
    }
  }

  useEffect(() => {
    if (token) load(tab);
  }, [token, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(e) {
    e.preventDefault();
    setBusy(true);
    setLoginErr('');
    try {
      const res = await apiFetch('/admin/login', { method: 'POST', body: JSON.stringify(login) });
      try {
        sessionStorage.setItem('quadly:admintoken', res.token);
      } catch {
        /* storage unavailable */
      }
      setToken(res.token);
    } catch (err) {
      setLoginErr(err.message);
    }
    setBusy(false);
  }

  function logout() {
    sessionStorage.removeItem('quadly:admintoken');
    setToken(null);
    setNotice('');
  }

  async function act(url, body, after) {
    setBusy(true);
    try {
      const res = await apiFetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body || {}) });
      setNotice(res.ok ? 'Done ✓' : 'Done.');
    } catch (err) {
      setNotice('Error: ' + err.message);
    }
    await load(after);
    setBusy(false);
  }

  async function sendMail() {
    setBusy(true);
    try {
      const res = await apiFetch('/admin/mail/send', { method: 'POST', headers: authHeaders(), body: JSON.stringify(compose) });
      setNotice(
        res.mail.status === 'sent'
          ? 'Sent ✓ delivered via SMTP.'
          : 'Queued ✓ — add SMTP_HOST, SMTP_USER and SMTP_PASS to backend/.env to deliver queued mail.',
      );
      setCompose({ to: '', subject: '', body: '' });
    } catch (err) {
      setNotice('Error: ' + err.message);
    }
    await load('mail');
    setBusy(false);
  }

  if (!token) {
    return (
      <main className="adm-page">
        <form className="adm-login" onSubmit={signIn}>
          <p className="adm-kicker">
            quadly <span className="adm-pill">Admin</span>
          </p>
          <h1 className="adm-title">Admin panel</h1>
          <p className="adm-sub">
            Enter the admin credentials to open the application queue, onboarding profiles, ambassador roster, careers and the mail center.
          </p>
          <input
            className="adm-input"
            type="email"
            aria-label="Admin email"
            placeholder="Admin email"
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
            autoComplete="username"
          />
          <input
            className="adm-input"
            type="password"
            aria-label="Admin password"
            placeholder="Admin password"
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
            autoComplete="current-password"
          />
          {loginErr && <p className="adm-error">{loginErr}</p>}
          <button className="adm-btn" type="submit" disabled={busy || !login.email || !login.password}>
            {busy ? 'Checking…' : 'Unlock panel'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="adm-page adm-page--panel">
      <header className="adm-topbar">
        <p className="adm-brand">
          quadly <span className="adm-pill">Admin</span>
        </p>
        <nav className="adm-tabs">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" className={`adm-tab ${tab === id ? 'is-on' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
          <button type="button" className="adm-tab adm-tab--ghost" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>
      {notice && <p className="adm-notice">{notice}</p>}

      <div className="adm-section-head">
        <h1 className="adm-h1">{TABS.find(([id]) => id === tab)?.[1]}</h1>
        <button type="button" className="adm-btn adm-btn--mini" onClick={() => load(tab)}>
          Refresh
        </button>
      </div>

      {tab === 'applications' && (
        <div className="adm-cards">
          {(apps || []).map((a) => (
            <article className="adm-card" key={a.id}>
              <div className="adm-card-head">
                <strong>{a.name}</strong>
                <span className={`adm-pill adm-pill--${a.status === 'promoted' ? 'primary' : a.status}`}>{a.status}</span>
              </div>
              <p className="adm-line">
                {a.email} · {a.college} · {a.year}
              </p>
              {a.handle && <p className="adm-line">Handle: {a.handle}</p>}
              {a.reach && <p className="adm-line">Reach: {a.reach}</p>}
              {a.message && <p className="adm-quote">{a.message}</p>}
              <p className="adm-line">
                Consent: privacy {a.consents?.privacy ? '✓' : '✗'} · updates {a.consents?.updates ? '✓' : '—'}
              </p>
              <div className="adm-actions">
                {a.status === 'pending' && (
                  <>
                    <button className="adm-btn adm-btn--mini" disabled={busy} onClick={() => act('/admin/applications/' + a.id + '/status', { status: 'approved' }, 'applications')}>
                      Approve
                    </button>
                    <button className="adm-btn adm-btn--mini adm-btn--danger" disabled={busy} onClick={() => act('/admin/applications/' + a.id + '/status', { status: 'rejected' }, 'applications')}>
                      Reject
                    </button>
                  </>
                )}
                {a.status === 'approved' && !a.promoted && (
                  <button className="adm-btn adm-btn--mini" disabled={busy} onClick={() => act('/admin/applications/' + a.id + '/promote', {}, 'applications')}>
                    Promote to roster
                  </button>
                )}
                {a.status === 'promoted' && <span className="adm-pill adm-pill--primary">On roster</span>}
              </div>
            </article>
          ))}
          {apps && apps.length === 0 && <p className="adm-empty">No applications yet.</p>}
        </div>
      )}

      {tab === 'profiles' && (
        <div className="adm-cards">
          {(profiles || []).map((p) => (
            <article className="adm-card" key={p.email + p.createdAt}>
              <div className="adm-card-head">
                <strong>{p.name}</strong>
                <span className="adm-pill">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="adm-line">{p.email}</p>
              <p className="adm-line">{p.college}</p>
              {p.target?.company || p.target?.role ? (
                <p className="adm-line">Target: {[p.target?.company, p.target?.role].filter(Boolean).join(' · ')}</p>
              ) : null}
              {p.github && <p className="adm-line">GitHub: @{p.github}</p>}
            </article>
          ))}
          {profiles && profiles.length === 0 && <p className="adm-empty">No onboarding profiles yet.</p>}
        </div>
      )}

      {tab === 'roster' && (
        <div className="adm-cards">
          {(roster || []).map((a) => (
            <article className="adm-card" key={a.id}>
              <div className="adm-card-head">
                <strong>{a.name}</strong>
                <span className="adm-pill">ambassador</span>
              </div>
              <p className="adm-line">
                {a.college}
                {a.handle ? ' · ' + a.handle : ''}
              </p>
              {a.email && <p className="adm-line">{a.email}</p>}
              <div className="adm-actions">
                <button className="adm-btn adm-btn--mini adm-btn--danger" disabled={busy} onClick={() => act('/admin/ambassadors/delete', { id: a.id }, 'roster')}>
                  Remove
                </button>
              </div>
            </article>
          ))}
          {roster && roster.length === 0 && <p className="adm-empty">Roster is empty — promote an approved application.</p>}
        </div>
      )}

      {tab === 'careers' && (
        <>
          <form
            className="adm-card adm-compose"
            onSubmit={(e) => {
              e.preventDefault();
              act('/admin/careers', job, 'careers').then(() => setJob({ title: '', team: '', type: 'Full-time', location: '', description: '' }));
            }}
          >
            <p className="adm-form-title">Add a role</p>
            <input className="adm-input" placeholder="Job title" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} required />
            <div className="adm-grid2">
              <input className="adm-input" placeholder="Team" value={job.team} onChange={(e) => setJob({ ...job, team: e.target.value })} />
              <input className="adm-input" placeholder="Type (Full-time / Internship)" value={job.type} onChange={(e) => setJob({ ...job, type: e.target.value })} />
            </div>
            <input className="adm-input" placeholder="Location" value={job.location} onChange={(e) => setJob({ ...job, location: e.target.value })} />
            <textarea className="adm-input adm-textarea" placeholder="Description" value={job.description} onChange={(e) => setJob({ ...job, description: e.target.value })} />
            <button className="adm-btn" type="submit" disabled={busy || !job.title}>
              Publish role
            </button>
          </form>

          <div className="adm-cards">
            {(careers || []).map((j) => (
              <article className="adm-card" key={j.id}>
                <div className="adm-card-head">
                  <strong>{j.title}</strong>
                  <span className={`adm-pill adm-pill--${j.status === 'open' ? 'success' : 'danger'}`}>{j.status}</span>
                </div>
                <p className="adm-line">
                  {j.team} · {j.type} · {j.location}
                </p>
                {j.description && <p className="adm-quote">{j.description}</p>}
                <div className="adm-actions">
                  <button className="adm-btn adm-btn--mini" disabled={busy} onClick={() => act('/admin/careers/' + j.id + '/update', { status: j.status === 'open' ? 'closed' : 'open' }, 'careers')}>
                    {j.status === 'open' ? 'Close role' : 'Reopen'}
                  </button>
                  <button className="adm-btn adm-btn--mini adm-btn--danger" disabled={busy} onClick={() => act('/admin/careers/' + j.id + '/delete', {}, 'careers')}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {careers && careers.length === 0 && <p className="adm-empty">No roles yet — publish one above.</p>}
          </div>
        </>
      )}

      {tab === 'official-items' && (
        <>
          <form
            className="adm-card adm-compose"
            onSubmit={(e) => {
              e.preventDefault();
              act('/admin/official-items', noticeItem, 'official-items').then(() => setNoticeItem({ title: '', body: '', link: '', college: 'all', startsAt: '', endsAt: '' }));
            }}
          >
            <p className="adm-form-title">Schedule an official item (Home — Your college this week)</p>
            <input className="adm-input" placeholder="Title" value={noticeItem.title} onChange={(e) => setNoticeItem({ ...noticeItem, title: e.target.value })} required />
            <textarea className="adm-input adm-textarea" placeholder="Short text (what happened / what to do)" value={noticeItem.body} onChange={(e) => setNoticeItem({ ...noticeItem, body: e.target.value })} required />
            <input className="adm-input" placeholder="Link (optional, https)" value={noticeItem.link} onChange={(e) => setNoticeItem({ ...noticeItem, link: e.target.value })} />
            <div className="adm-grid2">
              <input className="adm-input" placeholder="College (blank = all colleges)" value={noticeItem.college === 'all' ? '' : noticeItem.college} onChange={(e) => setNoticeItem({ ...noticeItem, college: e.target.value || 'all' })} />
              <input className="adm-input" placeholder="Link again — ignore" hidden />
            </div>
            <div className="adm-grid2">
              <label className="adm-line">Starts
                <input className="adm-input" type="datetime-local" value={noticeItem.startsAt} onChange={(e) => setNoticeItem({ ...noticeItem, startsAt: e.target.value })} required />
              </label>
              <label className="adm-line">Ends
                <input className="adm-input" type="datetime-local" value={noticeItem.endsAt} onChange={(e) => setNoticeItem({ ...noticeItem, endsAt: e.target.value })} required />
              </label>
            </div>
            <button className="adm-btn" type="submit" disabled={busy || !noticeItem.title || !noticeItem.startsAt}>
              Schedule item
            </button>
          </form>

          <div className="adm-cards">
            {(official?.items || []).map((n) => (
              <article className="adm-card" key={n.id}>
                <div className="adm-card-head">
                  <strong>{n.title}</strong>
                  <span className="adm-pill">{n.college === 'all' ? 'All colleges' : n.college}</span>
                </div>
                <p className="adm-line">{n.body}</p>
                <p className="adm-line adm-muted">
                  {new Date(n.startsAt).toLocaleString('en-IN')} → {new Date(n.endsAt).toLocaleString('en-IN')}
                </p>
                <button className="adm-btn" type="button" onClick={() => act(`/admin/official-items/${n.id}/delete`, {}, 'official-items')}>
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="adm-card">
            <p className="adm-form-title">Audit log (latest)</p>
            {(official?.audit || []).map((a) => (
              <p className="adm-line" key={a.id}>
                {new Date(a.at).toLocaleString('en-IN')} — {a.action} — {a.title || a.itemId}
              </p>
            ))}
          </div>
        </>
      )}

      {tab === 'mail' && (
        <>
          <form
            className="adm-card adm-compose"
            onSubmit={(e) => {
              e.preventDefault();
              sendMail();
            }}
          >
            <p className="adm-form-title">New mail</p>
            <input className="adm-input" type="email" placeholder="To" value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} required />
            <input className="adm-input" placeholder="Subject" value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} required />
            <textarea className="adm-input adm-textarea" placeholder="Message" value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} required />
            <button className="adm-btn" type="submit" disabled={busy}>
              {busy ? 'Working…' : 'Send'}
            </button>
            <p className="adm-sub">
              SMTP not configured yet? Mail lands as <strong>queued</strong> — it delivers the moment SMTP_HOST, SMTP_USER and SMTP_PASS are added to backend/.env.
            </p>
          </form>

          <div className="adm-cards">
            {(mail || []).map((m) => (
              <article className="adm-card" key={m.id}>
                <div className="adm-card-head">
                  <strong>{m.subject}</strong>
                  <span className={`adm-pill adm-pill--${m.status === 'sent' ? 'success' : m.status === 'failed' ? 'danger' : ''}`}>{m.status}</span>
                </div>
                <p className="adm-line">
                  To {m.to} · {m.provider}
                  {m.error ? ' — ' + m.error : ''}
                </p>
                <p className="adm-quote">{m.body.slice(0, 240)}{m.body.length > 240 ? '…' : ''}</p>
                <div className="adm-actions">
                  <button className="adm-btn adm-btn--mini adm-btn--danger" disabled={busy} onClick={() => act('/admin/mail/' + m.id + '/delete', {}, 'mail')}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {mail && mail.length === 0 && <p className="adm-empty">Outbox is empty.</p>}
          </div>
        </>
      )}
    </main>
  );
}
