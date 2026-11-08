#!/usr/bin/env python3
"""Convert plangenerator.js task templates to profile-driven factories."""
import pathlib

p = pathlib.Path(__file__).resolve().parent.parent / "backend/src/lib/plangenerator.js"
s = p.read_text(encoding="utf-8")

s = s.replace("learn: (role) => [", "learn: (p) => [")
s = s.replace("interview: (role) => [", "interview: (p) => [")
s = s.replace("ship: (role, github) => [", "ship: (p) => [")
s = s.replace("apply: (company) => [", "apply: (p) => [")
s = s.replace("network: (amb) => [", "network: (p) => [")
s = s.replace("${role}", "${p.target?.role || 'SDE'}")
s = s.replace("${github ? github + '`s GitHub' : 'your GitHub'}", "${p.github ? p.github + '`s GitHub' : 'your GitHub'}")
s = s.replace("${company || 'your dream'}", "${p.target?.company || 'your dream'}")
s = s.replace("${amb} one specific question about recruiting at your circle companies",
              "${p.ambassador?.name || 'one senior from your college'} one specific question about recruiting at your circle companies")
s = s.replace("'Reach out to one senior from your college who works where you want to work'",
              "'Reach out to one senior from your college who works where you want to work'")
s = s.replace(
    "      const pool = TASK_TEMPLATES[cat] || TASK_TEMPLATES.learn;\n"
    "      const variant = (day * 3 + slot) % pool.length;\n"
    "      const t = pool[variant];\n"
    "      let title = t.title;\n"
    "      if (cat === 'ship' && github) title = title.replace('your GitHub', github + '`s GitHub');\n"
    "      if ((cat === 'learn' || cat === 'interview') && role) title = title.replace(/SDE/g, role);\n"
    "      if (cat === 'apply' && company) title = title.replace('your dream', company);\n"
    "      if (cat === 'network' && amb) title = title.replace('one senior from your college', amb);",
    "      const pool = (TASK_TEMPLATES[cat] || TASK_TEMPLATES.learn)(p);\n"
    "      const variant = (day * 3 + slot) % pool.length;\n"
    "      const t = pool[variant];")
p.write_text(s, encoding="utf-8")

print("factories converted:", "TASK_TEMPLATES[cat] || TASK_TEMPLATES.learn)(p)" in s)
print("no stale refs:", "${role}" not in s and "${github" not in s and "${company" not in s and "${amb}" not in s)
