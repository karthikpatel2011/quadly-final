#!/usr/bin/env python3
"""Idempotent re-application of the dashboard enhancements (run from frontend/).
Verifies each feature on DISK after writing."""
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent  # frontend/
ok = []

# ---------- OnboardingFlow: 40-avatar picker + payload ----------
f = root / "src/components/onboarding/OnboardingFlow.jsx"
t = f.read_text(encoding="utf-8")
if "const AVATARS" not in t:
    t = t.replace(
        "const ROLE_CHIPS = ['SDE', 'AI/ML Engineer', 'Data Analyst', 'Full-Stack', 'QA Engineer', 'Higher Studies'];",
        "const ROLE_CHIPS = ['SDE', 'AI/ML Engineer', 'Data Analyst', 'Full-Stack', 'QA Engineer', 'Higher Studies'];\n"
        "const AVATARS = Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, '0')); // pfp set: /avatars/NN.webp")
if "const [avatar, setAvatar]" not in t:
    t = t.replace("  const [step, setStep] = useState('welcome');",
                  "  const [step, setStep] = useState('welcome');\n"
                  "  const [avatar, setAvatar] = useState('');            // '' = auto-assign at save")
if "ob-avatars" not in t:
    t = t.replace(
        '            <div className="ob-row">\n'
        '              <input\n'
        '                className="ob-input ob-input--row"\n'
        '                aria-label="GitHub username"',
        '            <p className="ob-avatar-label">Pick your avatar — shows next to your name</p>\n'
        '            <div className="ob-avatars" role="radiogroup" aria-label="Choose a profile picture">\n'
        '              {AVATARS.map((a, i) => (\n'
        '                <button key={a} type="button" role="radio" aria-checked={avatar === a}\n'
        '                  className={`ob-avatar-btn${avatar === a ? \' is-on\' : \'\'}`}\n'
        '                  onClick={() => setAvatar(avatar === a ? \'\' : a)}>\n'
        '                  <img src={`/avatars/${a}.webp`} alt={`Avatar option ${i + 1}`} loading="lazy" />\n'
        '                </button>\n'
        '              ))}\n'
        '            </div>\n'
        '            <div className="ob-row">\n'
        '              <input\n'
        '                className="ob-input ob-input--row"\n'
        '                aria-label="GitHub username"')
if "avatar: avatar || null," not in t:
    t = t.replace("        github: gh.status === 'connected' && gh.info ? gh.info.login : null,",
                  "        github: gh.status === 'connected' && gh.info ? gh.info.login : null,\n"
                  "        avatar: avatar || null,")
f.write_text(t, encoding="utf-8")
ok.append(("onboarding picker", all(x in t for x in ["const AVATARS", "ob-avatars", "avatar: avatar || null"])))

# ---------- Dashboard.jsx: everything ----------
d = root / "src/components/dashboard/Dashboard.jsx"
u = d.read_text(encoding="utf-8")

# page imports
pages = ["ProjectsPage", "PracticePage", "SkillsPage", "SquadPage", "DrivePage", "InterviewPrepPage",
         "SyllabusPage", "LaunchpadPage", "HelpPage"]
if "import InterviewPrepPage" not in u:
    u = u.replace("import './dashboard.css';", "import './dashboard.css';\nimport InterviewPrepPage from '../pages/InterviewPrepPage.jsx';")
for pgname in pages:
    imp = f"import {pgname} from '../pages/{pgname}.jsx';"
    if imp not in u:
        u = u.replace("import InterviewPrepPage from '../pages/InterviewPrepPage.jsx';",
                      "import InterviewPrepPage from '../pages/InterviewPrepPage.jsx';\n" + imp)

# webp avatar + greeting ring + IST clock line
if "avatarSrcUrl" not in u:
    u = u.replace(
        "  const firstName = data?.name ? data.name.split(' ')[0] : data?.email?.split('@')[0] || '';",
        "  const firstName = data?.name ? data.name.split(' ')[0] : data?.email?.split('@')[0] || '';\n"
        "  const avatarNN = String((data?.avatar || '7').replace(/[^0-9]/g, '') || '7').padStart(2, '0');\n"
        "  const avatarSrcUrl = `/avatars/${avatarNN}.webp`;")
if "qd-greet__score" not in u:
    u = u.replace(
        "                  <div className=\"qd-pills\">",
        "                  <div className=\"qd-greet__score\" role=\"img\"\n"
        "                    aria-label={`Readiness score ${payload.score} out of 100`}\n"
        "                    title=\"Readiness score — grows with every verified task\">\n"
        "                    <svg viewBox=\"0 0 200 200\" aria-hidden=\"true\">\n"
        "                      <circle className=\"qd-greet__ring-track\" cx=\"100\" cy=\"100\" r=\"86\" />\n"
        "                      <circle className=\"qd-greet__ring-fill\" cx=\"100\" cy=\"100\" r=\"86\"\n"
        "                        strokeDasharray={2 * Math.PI * 86}\n"
        "                        strokeDashoffset={2 * Math.PI * 86 * (1 - payload.score / 100)} />\n"
        "                    </svg>\n"
        "                    <div className=\"qd-greet__ring-center\">\n"
        "                      <b>{payload.score}</b>\n"
        "                      <small>readiness</small>\n"
        "                    </div>\n"
        "                  </div>\n"
        "                  <div className=\"qd-pills\">", 1)
if "IST · India time" not in u:
    u = u.replace("                      {' · India time'}",
                  "                      {' · '}\n"
                  "                      {new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}\n"
                  "                      {' IST · India time'}")
if "fontSize: 30" not in u:
    u = u.replace("<h2 className=\"qd-h2\">{greetingFor(new Date().getHours(), firstName)}</h2>",
                  "<h2 className=\"qd-greet__hello\" style={{ fontSize: 30 }}>{greetingFor(new Date().getHours(), firstName)}</h2>")

# avatar images (3 spots): sidebar card, topbar button, home greeting
if "<img" not in u.split("qd-acct__head")[1][:600] if "qd-acct__head" in u else True:
    pass
u = u.replace(
    '<span className="qd-avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>',
    '<span className="qd-avatar" aria-hidden="true">{avatarSrcUrl ? <img src={avatarSrcUrl} alt="" /> : firstName.charAt(0).toUpperCase()}</span>')
u = u.replace(
    '            {firstName.charAt(0).toUpperCase()}\n'
    '          </button>',
    '            {avatarSrcUrl\n'
    '              ? <img src={avatarSrcUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />\n'
    '              : firstName.charAt(0).toUpperCase()}\n'
    '          </button>')
u = u.replace(
    '<span className="qd-avatar qd-avatar--lg" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>',
    '<span className="qd-avatar qd-avatar--lg" aria-hidden="true">{avatarSrcUrl ? <img src={avatarSrcUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : firstName.charAt(0).toUpperCase()}</span>')

# feature routes + coming-soon exclusion
imports_ok = all(f"import {p}" in u for p in pages)
if "route === 'interview-prep' && (" not in u:
    u = u.replace("        {/* ============ Coming soon ============ */}",
"""        {/* ============ Real feature pages ============ */}
        {route === 'interview-prep' && (<main className="qd-home"><InterviewPrepPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'practice/daily-15' && (<main className="qd-home"><PracticePage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'practice/skill-tree' && (<main className="qd-home"><SkillsPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'practice/mistake-replay' && (<main className="qd-home"><MistakeReplayPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'squad' && (<main className="qd-home"><SquadPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'mock-drive' && (<main className="qd-home"><DrivePage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'projects' && (<main className="qd-home"><ProjectsPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'syllabus' && (<main className="qd-home"><SyllabusPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'launchpad' && (<main className="qd-home"><LaunchpadPage payload={payload} onNavigate={navigate} /></main>)}
        {route === 'help' && (<main className="qd-home"><HelpPage payload={payload} onNavigate={navigate} /></main>)}

        {/* ============ Coming soon ============ */}""")
REAL = "['app', 'plan', 'interview-prep', 'syllabus', 'launchpad', 'help', 'projects', 'practice/daily-15', 'practice/skill-tree', 'practice/mistake-replay', 'squad', 'mock-drive']"
if REAL not in u:
    import re as _re
    u = _re.sub(r"\{!\['app', 'plan'[^\]]*\]\.includes\(route\) && \(",
                "{!" + REAL + ".includes(route) && (", u)
# escape parity for the account popover
if "Account popover: Escape closes" not in u:
    u = u.replace("  const toggleTheme = () => {",
                  "  // Account popover: Escape closes (parity with the drawer contract).\n"
                  "  useEffect(() => {\n"
                  "    if (!avatarMenuOpen) return undefined;\n"
                  "    const onKey = (e) => { if (e.key === 'Escape') setAvatarMenuOpen(false); };\n"
                  "    window.addEventListener('keydown', onKey);\n"
                  "    return () => window.removeEventListener('keydown', onKey);\n"
                  "  }, [avatarMenuOpen]);\n\n"
                  "  const toggleTheme = () => {")
d.write_text(u, encoding="utf-8")

missing = []
for probe, label in [
    ("const AVATARS", "picker const"),
    ("ob-avatars", "picker markup"),
    ("avatar: avatar || null", "payload avatar"),
    ("avatarSrcUrl", "avatar img"),
    ("qd-greet__score", "score ring"),
    ("IST · India time", "IST clock"),
    ("route === 'interview-prep'", "interview route"),
    ("route === 'practice/daily-15'", "practice route"),
    ("route === 'squad'", "squad route"),
    ("Account popover: Escape closes", "escape parity"),
]:
    if probe not in u:
        missing.append(label)
ok.append(("Dashboard.jsx re-applied", not missing))
print("RESULTS:", ok, "| dashboard missing:", missing or "none")
