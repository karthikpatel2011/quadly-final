import './p01.css'

const SPARK = [22, 35, 28, 44, 40, 58, 92, 52, 63, 70, 84, 78]

export default function P01Ledgerline() {
  return (
    <div className="p01">
      <div className="wrap">
        <nav>
          <a className="logo" href="#p01top">Ledgerline</a>
          <div className="navlinks">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
          </div>
          <a className="btn btn-primary" href="#pricing">Start invoicing free</a>
        </nav>

        <header className="hero" id="p01top">
          <div>
            <div className="kicker">Invoicing for freelancers</div>
            <h1>Send the invoice.<br />Actually get paid.</h1>
            <p className="lede">
              Ledgerline writes, sends, and chases your invoices — polite reminders go out
              on schedule, late payers escalate gently, and you watch the money land.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#pricing">Start invoicing free</a>
              <a className="btn btn-quiet" href="#how">See how it works ↓</a>
            </div>
            <p className="trust">
              <strong>4,180 freelancers</strong> invoiced <strong>$36M</strong> last year — paid{' '}
              <strong>6.2 days faster</strong> on average than their old workflow.
            </p>
          </div>
          <figure className="mock" aria-label="Ledgerline invoice dashboard mock">
            <div className="mock-head">
              <span>Outstanding this month</span>
              <span className="mono">8,420 · $12,930</span>
            </div>
            <div className="inv">
              <div className="row"><span>Client</span><span className="hide-m">Invoice</span><span className="hide-m">Amount</span><span>Status</span></div>
              <div className="row"><span>Halcyon Studio</span><span className="mono hide-m">INV-2214</span><span className="mono hide-m">$4,200</span><span className="pill pill-paid">✓ Paid · 2d</span></div>
              <div className="row"><span>Cartwright&amp;Co</span><span className="mono hide-m">INV-2213</span><span className="mono hide-m">$1,850</span><span className="pill pill-due">Due Fri</span></div>
              <div className="row"><span>Meridian Labs</span><span className="mono hide-m">INV-2209</span><span className="mono hide-m">$6,880</span><span className="pill pill-overdue">9 days late · escalated</span></div>
            </div>
            <div className="spark" role="img" aria-label="Payments received over the last 12 weeks">
              {SPARK.map((h, i) => (
                <i key={i} className={h >= 78 ? 'hot' : ''} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mock-cap">Collected per week — reminders on, last quarter</div>
          </figure>
        </header>

        <section className="features" id="how">
          <div className="feature">
            <div className="copy">
              <div className="kicker">Reminders that don't feel robotic</div>
              <h2>The follow-up you keep postponing, on autopilot</h2>
              <ul className="flist">
                <li>Three gentle steps: polite nudge, firm note, curiosity-safe pause on new work</li>
                <li>Tone set once, applied to every client — no rewriting late-night emails</li>
                <li>Escalation stops the moment payment lands</li>
              </ul>
            </div>
            <figure className="board" aria-label="Reminder schedule preview">
              <div className="stat-row">
                <div className="stat"><b>92%</b><span>paid without a manual email</span></div>
                <div className="stat"><b>6.2d</b><span>faster than your old way</span></div>
              </div>
              <div className="remind">
                Meridian Labs · <span className="mono">INV-2209</span><br />
                Day 3 — polite nudge <span className="when">sent ✓</span><br />
                Day 7 — firm note <span className="when">tomorrow 09:00</span><br />
                Day 14 — pause new work <span className="when">scheduled</span>
              </div>
            </figure>
          </div>

          <div className="feature flip">
            <figure className="board" aria-label="Cash position preview">
              <div className="stat-row">
                <div className="stat"><b>$12,930</b><span>outstanding now</span></div>
                <div className="stat"><b>$38,410</b><span>cleared this quarter</span></div>
              </div>
              <div className="remind">
                <b style={{ fontSize: 14 }}>Friday forecast</b><br />
                $4,050 expected (2 invoices due) · 1 at risk (overdue 9 days)<br />
                <span style={{ color: '#93A0B4' }}>based on each client's actual payment history</span>
              </div>
            </figure>
            <div className="copy">
              <div className="kicker">Cash you can forecast</div>
              <h2>Know what lands this Friday, not "eventually"</h2>
              <p className="lede" style={{ fontSize: 16 }}>
                Every invoice carries its client's real payment track record, so your
                dashboard shows expected dates and risk — not wishful due dates.
              </p>
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="kicker">Pricing</div>
          <h2>One cup of coffee a month, once the money actually flows</h2>
          <div className="plans">
            <div className="plan">
              <div className="plan-name">Solo</div>
              <div className="price">$0<small>/month</small></div>
              <div className="plan-sub">For your first five clients</div>
              <ul>
                <li>5 active invoices</li>
                <li>Standard reminder sequence</li>
                <li>Bank-transfer tracking</li>
              </ul>
              <div className="delta">Upgrade unlocks: unlimited invoices, reminders that escalate, cash forecast</div>
              <a className="btn btn-outline" href="#p01top">Start free</a>
            </div>
            <div className="plan hot">
              <span className="badge">Most freelancers</span>
              <div className="plan-name">Studio</div>
              <div className="price">$9<small>/month</small></div>
              <div className="plan-sub">Billed yearly, or $12 monthly</div>
              <ul>
                <li><b style={{ color: 'var(--ink)', fontWeight: 600 }}>Everything in Solo, plus:</b></li>
                <li>Unlimited invoices &amp; clients</li>
                <li>Smart escalation + cash forecast</li>
                <li>Late fees you control</li>
              </ul>
              <a className="btn btn-primary" href="#p01top">Start 30-day trial</a>
            </div>
            <div className="plan">
              <div className="plan-name">Agency</div>
              <div className="price">Custom</div>
              <div className="plan-sub">Multi-team, multi-currency</div>
              <ul>
                <li><b style={{ color: 'var(--ink)', fontWeight: 600 }}>Everything in Studio, plus:</b></li>
                <li>Shared team inventory</li>
                <li>Approval chains</li>
                <li>Priority support</li>
              </ul>
              <a className="btn btn-outline" href="#p01top">Talk to us</a>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <span>Ledgerline — invoicing that chases so you don't have to.</span>
            <span><a href="#p01top">Back to top</a> · Practice exercise 01 (original design)</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
