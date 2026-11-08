import { useState } from 'react'
import './p04.css'

const SITES = [
  { id: 'FG-0114', name: 'Cedar Ridge', loc: 'Bend, OR', kw: '412.6', status: 'producing' },
  { id: 'FG-0097', name: 'Solano Flats', loc: 'Fresno, CA', kw: '388.1', status: 'producing' },
  { id: 'FG-0121', name: 'Harlow Yard', loc: 'Boise, ID', kw: '265.0', status: 'warning' },
  { id: 'FG-0088', name: 'Two Rivers', loc: 'Spokane, WA', kw: '0.0', status: 'fault' },
  { id: 'FG-0103', name: 'Klamath North', loc: 'Klamath Falls, OR', kw: '341.9', status: 'producing' },
  { id: 'FG-0130', name: 'Owyhee Mesa', loc: 'Nampa, ID', kw: '302.4', status: 'producing' },
  { id: 'FG-0076', name: 'Juniper Flat', loc: 'Redmond, OR', kw: '198.3', status: 'warning' },
]
const STATUS = {
  producing: { cls: 'ok', label: '✓ producing' },
  warning: { cls: 'warn', label: '▲ degraded' },
  fault: { cls: 'err', label: '✕ fault' },
}
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'producing', label: 'Producing' },
  { id: 'warning', label: 'Warning' },
  { id: 'fault', label: 'Fault' },
]
// two semantic series per site: actual output vs irradiance-expected (kWh/5min bucket style)
const SERIES = {
  producing: { actual: '8,28,64,58,88,80,96', expected: '12,30,66,62,84,78,94', peak: '412.6', note: 'Cloud cover held output to 96% of expected' },
  warning: { actual: '8,22,44,50,70,66,58', expected: '12,30,60,62,84,86,90', peak: '265.0', note: 'Inverter B tripped twice under peak load — inspection scheduled' },
  fault: { actual: '0,0,0,0,0,0,0', expected: '10,28,58,70,86,80,72', peak: '0.0', note: 'Array offline since 06:12 — resolver board fault, crew dispatched' },
}

const NAV = [
  { grp: 'Fleet', items: [
    { label: 'Overview', href: '#p04-overview', n: null, on: true },
    { label: 'Sites', href: '#p04-sites', n: 24 },
    { label: 'Alerts', href: '#p04-alerts', n: 5 },
  ]},
  { grp: 'Operations', items: [
    { label: 'Maintenance', href: '#p04-maint', n: 3 },
    { label: 'Reports', href: '#p04-reports', n: null },
    { label: 'Energy ledger', href: '#p04-ledger', n: null },
  ]},
]

export default function P04Fieldgrid() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState('FG-0114')
  const [sideOpen, setSideOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const rows = SITES.filter(s => filter === 'all' || s.status === filter)
  const sel = SITES.find(s => s.id === selected) || SITES[0]
  const chart = SERIES[sel.status]
  const counts = Object.fromEntries(FILTERS.map(f =>
    [f.id, f.id === 'all' ? SITES.length : SITES.filter(s => s.status === f.id).length]))

  return (
    <div className="p04">
      {sideOpen && <div className="backdrop" onClick={() => setSideOpen(false)} aria-hidden="true" />}
      <nav className={`side ${sideOpen ? 'open' : ''}`} aria-label="Primary">
        <span className="logo"><i />Fieldgrid</span>
        {NAV.map(g => (
          <div key={g.grp}>
            <div className="grp">{g.grp}</div>
            {g.items.map(it => (
              <a key={it.label} href={it.href} className={it.on ? 'on' : ''} onClick={() => setSideOpen(false)}>
                {it.label}{it.n !== null && <span className="n">{it.n}</span>}
              </a>
            ))}
          </div>
        ))}
        <span className="spacer" />
        <button className="acct" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen}>
          <span className="av">DK</span>
          <span><b>Dana Kwon</b><small>Fleet ops · Fieldgrid</small></span>
          <span className="chev">⌄</span>
        </button>
        {menuOpen && (
          <div className="menu" role="menu">
            <a href="#p04-settings" role="menuitem">Account settings</a>
            <a href="#p04-billing" role="menuitem">Plan &amp; billing</a>
            <a href="#p04-signout" role="menuitem">Sign out</a>
          </div>
        )}
      </nav>

      <main className="main">
        <div className="top">
          <button className="burger" onClick={() => setSideOpen(o => !o)} aria-expanded={sideOpen}
            aria-label={sideOpen ? 'Close menu' : 'Open menu'}>☰</button>
          <div>
            <h1>Fleet overview</h1>
            <span className="crumb">7 sites · Pacific region</span>
          </div>
          <span className="grow" />
          <span className="range">Today ▾</span>
          <button className="btn btn-primary">Export report</button>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div>
              <small>Fleet output now</small>
              <b>1,908.3 kW</b>
              <span className="m">across {counts.producing} producing sites</span>
            </div>
            <span className="delta">▲ 6.2% vs same hour yesterday</span>
          </div>
          <div className="kpi">
            <div>
              <small>Expected by 12:00</small>
              <b>2,044 kW</b>
              <span className="m">irradiance-adjusted · updates 5 min</span>
            </div>
            <svg width="120" height="36" aria-label="Output trend this morning">
              <polyline fill="none" stroke="var(--hue-500)" strokeWidth="2"
                points="0,26 20,22 40,24 60,16 80,18 100,10 120,12" />
            </svg>
          </div>
        </div>

        <div className="filters" role="toolbar" aria-label="Site status filters">
          {FILTERS.map(f => (
            <button key={f.id} className={`chip ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label} ({counts[f.id]})
            </button>
          ))}
          <span className="count">Showing {rows.length} of {SITES.length}</span>
        </div>

        <div className="cols">
          <section className="card" aria-label="Sites">
            <div className="card-h">
              <b>Sites {filter !== 'all' && `· ${filter}`}</b>
              <a className="act" href="#p04-manage">Manage</a>
            </div>
            <table>
              <thead>
                <tr><th>Site</th><th className="hide-m">Location</th><th>Health</th><th className="num">Now (kW)</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.id} className={s.id === selected ? 'on' : ''}
                    onClick={() => { setSelected(s.id); setSideOpen(false) }}>
                    <td><span className="mono">{s.id}</span><br /><span style={{ fontWeight: 600 }}>{s.name}</span></td>
                    <td className="mut hide-m">{s.loc}</td>
                    <td><span className={`pill ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span></td>
                    <td className="num">{s.kw}</td>
                    <td><span className="dots" role="button" aria-label="Site actions">⋯</span></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5}><span className="mut">No sites in this state right now — clear the filter to see the full fleet.</span></td></tr>
                )}
              </tbody>
            </table>
          </section>

          <div style={{ display: 'grid', gap: 12 }}>
            <section className="card" aria-label={`Output chart for ${sel.name}`}>
              <div className="card-h">
                <b>{sel.id} · {sel.name}<span className="sub">output vs irradiance-expected, last 7 h</span></b>
                <a className="act" href="#p04-site">Site detail</a>
              </div>
              <div className="legend">
                <span><i style={{ background: 'var(--hue-500)' }} />actual</span>
                <span><i style={{ background: 'var(--border-strong)' }} />expected</span>
              </div>
              <svg viewBox="0 0 320 110" width="100%" height="118" role="img"
                aria-label={`Output for ${sel.name}: peak ${chart.peak} kW`}>
                <defs>
                  <linearGradient id="p04fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--hue-500)" stopOpacity=".28" />
                    <stop offset="100%" stopColor="var(--hue-500)" stopOpacity=".02" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#p04fill)" stroke="none"
                  points={`0,110 ${chart.actual.split(',').map((y, i) => `${i * 53.3},${110 - Number(y)}`).join(' ')} 320,110`} />
                <polyline fill="none" stroke="var(--hue-500)" strokeWidth="2.4"
                  points={chart.actual.split(',').map((y, i) => `${i * 53.3},${110 - Number(y)}`).join(' ')} />
                <polyline fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="5 4"
                  points={chart.expected.split(',').map((y, i) => `${i * 53.3},${110 - Number(y)}`).join(' ')} />
              </svg>
              <div className="insight">
                Insight · {chart.note}. Peak now {chart.peak} kW.
              </div>
            </section>

            <section className="card" aria-label="Open alerts">
              <div className="card-h"><b>Open alerts</b><a className="act" href="#p04-alerts">View all</a></div>
              <ul className="list">
                <li><span className="sev" style={{ background: 'var(--err)' }} />
                  <span><b style={{ fontWeight: 600 }}>FG-0088 · resolver board fault</b><br />
                  <span className="mut">crew dispatched, ETA 14:30</span></span>
                  <span className="when">06:12</span></li>
                <li><span className="sev" style={{ background: 'var(--warn)' }} />
                  <span><b style={{ fontWeight: 600 }}>FG-0121 · inverter B trips</b><br />
                  <span className="mut">2 trips in 7 days, watch</span></span>
                  <span className="when">09:58</span></li>
                <li><span className="sev" style={{ background: 'var(--warn)' }} />
                  <span><b style={{ fontWeight: 600 }}>FG-0076 · string underperforming</b><br />
                  <span className="mut">−11% vs expected, cleaning candidate</span></span>
                  <span className="when">Yesterday</span></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
