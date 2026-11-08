import { useState } from 'react'
import './p03.css'

const GOALS = [
  { t: 'Build the habit', s: '3 short runs a week, no pace pressure' },
  { t: 'First 5K', s: 'Couch to a continuous 5K in 8 weeks' },
  { t: 'Get faster', s: 'Tempo work and progression weeks' },
  { t: 'Half marathon', s: 'Long-run focused, 12-week plan' },
  { t: 'Lose weight', s: 'Zone 2 base plus weekly targets' },
  { t: 'Come back from injury', s: 'Walk-run ramps, conservative build' },
]

export default function P03Stridebook() {
  const [picked, setPicked] = useState([GOALS[0].t, GOALS[1].t])
  const toggle = (t) =>
    setPicked(p => (p.includes(t) ? p.filter(x => x !== t) : [...p, t]))

  return (
    <div className="p03">
      <div className="stepbar" aria-label="Onboarding progress: step 2 of 3">
        <i className="seg on" /><i className="seg on" /><i className="seg" />
        <span>2 / 3 · setup</span>
      </div>

      <div className="shell">
        <section className="setup">
          <div>
            <div className="meta">Stridebook · setup</div>
            <h2 className="display" style={{ marginTop: 10 }}>What are you training for? Pick all that fit.</h2>
            <p className="lede">
              Your plan, reminders, and the stats we celebrate adapt to these — change them any time.
            </p>
            <div className="why">
              Multi-select beats a single choice: you get a plan that fits without a 20-question
              interview. We'll propose one on the next screen.
            </div>
          </div>

          <div>
            <div className="chips" role="group" aria-label="Training goals">
              {GOALS.map(g => (
                <button
                  key={g.t}
                  className={`chip ${picked.includes(g.t) ? 'on' : ''}`}
                  aria-pressed={picked.includes(g.t)}
                  onClick={() => toggle(g.t)}
                >
                  <b>{g.t}</b><span>{g.s}</span>
                </button>
              ))}
            </div>
            <div className="actions">
              <button className="btn btn-primary" disabled={picked.length === 0}>
                Continue — build my plan {picked.length > 0 && `· ${picked.length} selected`}
              </button>
              <button className="skip">Skip for now</button>
            </div>
            <div className="count">Step 2 of 3 · next: connect your watch (optional)</div>
          </div>
        </section>

        <section aria-label="Stridebook home — what you unlock after setup" style={{ marginTop: 72 }}>
          <div className="top">
            <span className="logo"><i />Stridebook</span>
            <span className="tag">demo data · your real week starts Monday</span>
          </div>

          <div className="grid">
            <div className="hero">
              <div className="arc" role="img" aria-label="Weekly goal progress ring: 3 of 4 runs">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--hue-200)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--hue-600)" strokeWidth="12"
                    strokeDasharray="245 327" strokeLinecap="round" />
                </svg>
                <b>3/4<small>runs this week</small></b>
              </div>
              <div className="text">
                <h2 className="display">Streak: 5 weeks · longest in 2 years</h2>
                <p>
                  Two easy runs left before Sunday's long run. Conditions look best Saturday
                  morning — we'll move your tempo there if you keep the plan on auto.
                </p>
                <button className="btn btn-primary">Export week to calendar</button>
              </div>
            </div>

            <div className="card">
              <div className="card-h"><h2>Weekly mileage</h2><a href="#p03-export">Export CSV</a></div>
              <div className="bars" role="img" aria-label="Weekly mileage, 6 weeks, building">
                {[['32%', '12'], ['40%', '15'], ['42%', '16'], ['55%', '21'], ['68%', '26'], ['80%', '31']].
                  map(([h, n], i) => (
                    <div key={i} className="col">
                      <i className={i === 5 ? '' : 't'} style={{ height: h }} />
                      <em>{n}</em>
                    </div>
                  ))}
              </div>
              <div className="insight">
                Insight: your long-run share is 38% — right in the club's healthy band (30–40%).
              </div>
            </div>

            <div className="card">
              <div className="card-h"><h2>Next up</h2><a href="#p03-plan">Full plan</a></div>
              <ul className="rungs">
                <li><span>Thu · easy 4 km + strides</span><span className="num">09:20/km</span></li>
                <li><span>Sat · long run 10 km</span><span className="num">06:10/km</span></li>
                <li><span>Sun · optional recovery walk</span><span className="num">—</span></li>
              </ul>
              <div className="insight" style={{ borderLeftColor: 'var(--cta)' }}>
                Reminder set for tomorrow 07:00 · skips are fine, streaks survive planned rest.
              </div>
            </div>
          </div>
        </section>

        <footer>
          Practice exercise 03 — applies measured onboarding patterns (multi-select setup,
          counted CTA, insight-beside-chart, one visual device, seeded demo state).
        </footer>
      </div>
    </div>
  )
}
