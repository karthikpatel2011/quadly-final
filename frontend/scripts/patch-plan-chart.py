#!/usr/bin/env python3
"""Swap the Plan page's number-only week tiles for the chart kit's height-driven bars."""
import pathlib

p = pathlib.Path(__file__).resolve().parent.parent / "src/components/dashboard/Dashboard.jsx"
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)

# locate the section (1-based line 1063 as verified)
start = next(i for i, l in enumerate(lines) if 'aria-labelledby="qd-plan-week"' in l)
# end: the section's closing </section> — first occurrence at or after start
end = next(i for i in range(start, len(lines)) if "</section>" in lines[i])

new = '''            <section className="qd-card" aria-labelledby="qd-plan-week">
              <div className="qd-card__head">
                <h3 className="qd-card__title" id="qd-plan-week">Last 7 days</h3>
              </div>
              <SevenDayBars
                data={Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(Date.now() - (6 - i) * 864e5);
                  const key = d.toISOString().slice(0, 10);
                  return {
                    key,
                    label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
                    count: ((payload.history || {})[key] || []).length,
                    today: i === 6,
                  };
                })}
              />
            </section>
'''
lines[start:end + 1] = [new]
p.write_text("".join(lines), encoding="utf-8")
print("plan 7-day chart wired:", "SevenDayBars" in "".join(lines[start:start + 3]))
