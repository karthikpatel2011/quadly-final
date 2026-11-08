import './p02.css'

const DEPLOYS = [
  { h: '40%', c: '' }, { h: '70%', c: 'ok' }, { h: '30%', c: '' }, { h: '80%', c: 'ok' },
  { h: '60%', c: 'ok' }, { h: '45%', c: '' }, { h: '25%', c: 'err' }, { h: '75%', c: 'ok' },
  { h: '50%', c: '' }, { h: '85%', c: 'ok' }, { h: '38%', c: '' }, { h: '66%', c: 'ok' },
]

const RELEASES = [
  { ver: 'v2.15.0-rc.3', when: 'today 14:02', sha: '9f31c0a', st: 'st-run', label: '◐ canary 25%', who: 'mika' },
  { ver: 'v2.14.1', when: 'yesterday 09:40', sha: '1d77e22', st: 'st-ok', label: '✓ healthy', who: 'sam' },
  { ver: 'v2.14.0', when: 'Mar 2, 11:15', sha: 'c02ab31', st: 'st-err', label: '✕ rolled back', who: 'mika' },
  { ver: 'v2.13.9', when: 'Feb 27, 16:48', sha: 'b41cf99', st: 'st-warn', label: '▲ degraded · p95 +38%', who: 'ana' },
]

export default function P02Relay() {
  return (
    <div className="p02">
      <div className="topbar">
        <span className="logo"><i />Relay</span>
        <span className="env"><b>●</b> production · <span className="pill">v2.14.1</span></span>
        <span style={{ flex: 1 }} />
        <button className="btn btn-quiet">Activity log</button>
        <button className="btn btn-primary">Deploy v2.15.0</button>
      </div>

      <div className="page">
        <div className="head">
          <div>
            <h1>Releases</h1>
            <div className="sub">api-service · us-east-1</div>
          </div>
          <span className="range">Last 30 days ▾</span>
        </div>

        <div className="filters" role="toolbar" aria-label="Release filters">
          <button className="chip on">All (24)</button>
          <button className="chip">Healthy (19)</button>
          <button className="chip">Degraded (3)</button>
          <button className="chip">Failed (2)</button>
          <span className="count">Showing <b>24 of 24</b> releases</span>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div>
              <small>Change failure rate</small>
              <b>8.3%</b>
              <span className="m">2 of 24 releases failed</span>
            </div>
            <svg className="trend" width="140" height="44" aria-label="Failure rate trend, falling">
              <polyline fill="none" stroke="var(--sem-err)" strokeWidth="2"
                points="0,10 20,14 40,12 60,22 80,18 100,30 120,28 140,38" />
            </svg>
          </div>
          <div className="kpi">
            <div>
              <small>Median lead time</small>
              <b>41 min</b>
              <span className="m">commit → production, per release</span>
            </div>
            <svg className="trend" width="140" height="44" aria-label="Lead time trend, improving">
              <polyline fill="none" stroke="var(--accent-600)" strokeWidth="2"
                points="0,34 20,30 40,32 60,24 80,26 100,16 120,18 140,8" />
            </svg>
          </div>
        </div>

        <div className="grid">
          <section className="card" aria-label="Recent releases">
            <div className="card-h">
              <b>Recent releases</b>
              <div className="h-act">
                <a href="#relays-top">Export</a>
                <select className="iconish" aria-label="Rows"><option>10 rows</option></select>
              </div>
            </div>
            <table>
              <thead>
                <tr><th>Release</th><th className="hide-m">Commit</th><th>Checks</th><th>Owner</th><th></th></tr>
              </thead>
              <tbody>
                {RELEASES.map(r => (
                  <tr key={r.ver}>
                    <td><span className="ver">{r.ver}</span><br /><span className="who">{r.when}</span></td>
                    <td className="hide-m"><span className="sha">{r.sha}</span></td>
                    <td><span className={`st ${r.st}`}>{r.label}</span></td>
                    <td className="who">{r.who}</td>
                    <td><span className="dots" role="button" aria-label="Release actions">⋯</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <aside style={{ display: 'grid', gap: 14 }}>
            <section className="card envcard" aria-label="Environment health">
              <div className="card-h"><b>Environments</b></div>
              <div className="row2">
                <span><i className="dot" style={{ background: 'var(--accent-600)' }} />production</span>
                <span className="pill">v2.14.1 · 41d uptime</span>
              </div>
              <div className="row2">
                <span><i className="dot" style={{ background: 'var(--sem-warn)' }} />staging</span>
                <span className="pill">failing 1 e2e test</span>
              </div>
              <div className="row2">
                <span><i className="dot" style={{ background: '#7FA6D9' }} />preview</span>
                <span className="pill">12 PR environments</span>
              </div>
            </section>

            <section className="card" aria-label="Deploys per day">
              <div className="card-h"><b>Deploys per day</b><span className="pill">4-wk</span></div>
              <div className="bar" role="img" aria-label="Deploys per day, last 4 weeks">
                {DEPLOYS.map((d, i) => (
                  <i key={i} className={d.c} style={{ height: d.h }} />
                ))}
              </div>
              <div className="empty" style={{ borderTop: '1px solid var(--border)' }}>
                <b>No deploys this weekend</b>
                <p>Weekend freeze is on for <span className="pill">main</span>. Release trains resume Monday 09:00.</p>
                <button className="btn btn-quiet">Override freeze</button>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <footer>Relay — practice exercise 02 (dark dashboard pole). Static mock for design-system evaluation.</footer>
    </div>
  )
}
