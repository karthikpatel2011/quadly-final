-- Workplace — the Supabase schema for the simulated first job ("Setu Freight").
-- The app today persists these as per-student JSON documents under
-- backend/data/workplace-*.json (the documented pre-beta store; see
-- backend/src/lib/workplace/store.js — its accessors map 1:1 onto these
-- tables). This file is the migration target, same convention as
-- practice.sql. Every student-owned row is readable and writable ONLY by
-- its own student, by policy; story and episode content is admin-written
-- and world-readable. Deterministic rule/rubric JSON here is authoritative:
-- scores and state transitions are computed in application code
-- (src/lib/workplace/evaluator.js), never by the AI.

-- ---------------------------------------------------------------- content --

create table if not exists workplace_stories (
  id            text primary key,                 -- slug, e.g. 'backend-starter'
  role_track    text not null check (role_track in ('backend', 'ai_ml', 'security')),
  title         text not null,
  company_name  text not null,
  company_brief text not null,
  total_weeks   int  not null default 8,
  active_weeks  int  not null default 2,          -- the shipped starter story
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists workplace_episodes (
  id                      text primary key,       -- e.g. 'w1d1'
  story_id                text not null references workplace_stories(id),
  week_number             int  not null,
  day_number              int  not null,
  kind                    text not null check (kind in ('fix', 'communicate', 'prioritize', 'review', 'one-one')),
  title                   text not null,
  manager_line            text not null,
  estimated_minutes       int  not null check (estimated_minutes between 5 and 15),
  academy_lesson_md       text not null,          -- the 2-minute Company Academy read
  academy_quiz_json       jsonb not null,         -- [{q, options[], answer, why}] graded in code
  scenario_payload_json   jsonb not null,         -- ticket intro template, code, choices; (seed) => text
  character_persona_json  jsonb not null,         -- from/voice of the day's character
  deterministic_rules_json jsonb not null,        -- { work: [checks], defend: {covers[], k, minWords} }
  rubric_json             jsonb not null,         -- axis weights, must sum to 100
  unique (story_id, week_number, day_number)
);

-- ------------------------------------------------------------- students ----

create table if not exists student_workplace_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,                 -- accounts.email (auth uid at migration time)
  story_id         text not null references workplace_stories(id),
  difficulty_level text not null check (difficulty_level in ('guided', 'standard', 'expert')),
  current_week     int  not null default 1,
  current_day      int  not null default 1,
  current_episode_id text not null,
  status           text not null default 'active' check (status in ('active', 'starter_complete', 'paused')),
  academy_done     jsonb not null default '{}'::jsonb,  -- { episodeId: true }
  attempts         jsonb not null default '{}'::jsonb,  -- { episodeId: { day, n } } — capped 3/day in code
  started_at       timestamptz not null default now(),
  last_active_at   timestamptz not null default now(),
  unique (user_id, story_id)
);

create table if not exists workplace_submissions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null,
  episode_id          text not null references workplace_episodes(id),
  submission_type     text not null check (submission_type in ('text', 'code_review', 'voice_defend')),
  student_input       text,                       -- sanitized, length-capped in code
  choice_id           text,                       -- for choice episodes
  voice_transcript    text,                       -- transcript only; audio is NEVER stored (DPDP)
  deterministic_eval_json jsonb not null,        -- the engine's per-check results
  rubric_scores_json  jsonb not null,             -- { impact, ownership, communication, prioritization, ai_collaboration, teamwork }
  overall             int  not null,
  verified            boolean not null,
  manager_feedback_md text not null,
  created_at          timestamptz not null default now()
);

create table if not exists workplace_skills_passport (
  id                     uuid primary key default gen_random_uuid(),
  user_id                text not null,
  story_id               text not null references workplace_stories(id),
  interview_stories_json jsonb not null default '{}'::jsonb,  -- { episodeId: { situation, action, result } }
  identified_gaps_json   jsonb not null default '[]'::jsonb,  -- 1–2 weekly gaps + micro-plan, from weakest axes
  label                  text not null default 'Job simulation — training record (never work experience)',
  updated_at             timestamptz not null default now(),
  unique (user_id, story_id)
);

-- ------------------------------------------------------------------- RLS --

alter table student_workplace_progress enable row level security;
alter table workplace_submissions enable row level security;
alter table workplace_skills_passport enable row level security;

create policy own_workplace_progress on student_workplace_progress
  for all using (user_id = auth.jwt() ->> 'email');
create policy own_workplace_submissions on workplace_submissions
  for all using (user_id = auth.jwt() ->> 'email');
create policy own_workplace_passport on workplace_skills_passport
  for all using (user_id = auth.jwt() ->> 'email');

-- Story + episode content: admin-written (service role writes), students read.
alter table workplace_stories enable row level security;
alter table workplace_episodes enable row level security;
create policy anyone_reads_published_stories on workplace_stories
  for select using (is_published = true);
create policy anyone_reads_story_episodes on workplace_episodes
  for select using (true);

-- ------------------------------------------------------------- seed data --
-- The Week 1 + Week 2 Backend starter story. Scenario payloads embed
-- per-student seed templates (shipment id, city, customer, function names)
-- so no two students receive the same ticket and a copied answer fails the
-- deterministic checks. The canonical full prose lives in
-- src/lib/workplace/content.js; this seed is the same shape.

insert into workplace_stories (id, role_track, title, company_name, company_brief, total_weeks, active_weeks, is_published)
values
  ('backend-starter', 'backend',
   'Your first two weeks on the Platform team',
   'Setu Freight',
   'A fictional B2B freight-tracking company. Fifty engineers, one platform team, and you — a job simulation, clearly labelled as training, never work experience.',
   8, 2, true)
on conflict (id) do nothing;

insert into workplace_episodes (id, story_id, week_number, day_number, kind, title, manager_line, estimated_minutes, academy_lesson_md, academy_quiz_json, scenario_payload_json, character_persona_json, deterministic_rules_json, rubric_json)
values
  ('w1d1', 'backend-starter', 1, 1, 'fix',
   'The label that lies',
   'Welcome to Setu Freight. First ticket is small on purpose — I want to see how you work, not how much you know.',
   8,
   'How we use AI here|Give context; verify everything; you own the result.',
   '[{"q":"An AI tool rewrites your customer update and appends ''guaranteed fixed by Friday''. What do you do?","options":["Send it","Check what we actually know, then send only what is true","Write nothing"],"answer":1,"why":"Verification is the job; guarantees belong after the fix."}]',
   '{"from":"priya","ask":"Reply with the corrected ''booked'' mapping and where you verified it.","template":"The shipments card labels confirmed bookings ''Dispatched''. STATUS_LABELS in dashboard/labels.js is the source of truth; customer {customer} in {city} asked about {shipId}."}',
   '{"priya":{"name":"Priya Menon","role":"Engineering Manager"}}',
   '{"work":[{"op":"regex","pattern":"booked[''']?\\s*:\\s*[\"'']?confirmed","axis":"impact","note":"Sets booked → Confirmed"},{"op":"includesAny","values":["constants","config","comment","contract","source of truth"],"axis":"ownership","note":"Names where the truth lives"},{"op":"minWords","n":12,"axis":"communication","note":"Explains, not just pastes"},{"op":"excludesAny","values":["guaranteed"],"axis":"communication","note":"No invented promises"}],"defend":{"covers":["constant","config","comment","truth","file","dashboard"],"k":1,"minWords":20}}',
   '{"impact":30,"ownership":30,"communication":20,"prioritization":0,"ai_collaboration":10,"teamwork":10}'),
  ('w1d2', 'backend-starter', 1, 2, 'fix',
   'The clock that is five and a half hours off',
   'Ticket two. Same dashboard, new symptom — and this one is a classic. Read the bug report first.',
   8,
   'Read the bug report before the code|Symptom, scope, when — ''sometimes'' is a timezone bug in costume.',
   '[{"q":"A date label is wrong ''sometimes, for evening bookings only''. First instinct?","options":["Rewrite with an AI suggestion","Suspect a timezone boundary","Ask the customer to reinstall"],"answer":1,"why":"Time-dependent ''sometimes'' bugs straddle a boundary."}]',
   '{"from":"arjun","ask":"Pick the correct fix and defend the choice.","choices":[{"id":"a","label":"Convert to Asia/Kolkata, then take the calendar date"},{"id":"b","label":"Always add 5h30 before slicing"},{"id":"c","label":"Trust the customer device timezone"}],"template":"Booking {shipId} created at {hour}:40 IST shows the previous day; toISOString slices the UTC date."}',
   '{"arjun":{"name":"Arjun Rao","role":"Senior Engineer, your buddy"}}',
   '{"work":[{"op":"choiceEquals","choice":"a","axis":"impact","note":"Picks the real timezone conversion"},{"op":"includesAny","values":["utc","ist","timezone","midnight","+05:30","5:30"],"axis":"ownership","note":"Explains the boundary"},{"op":"minWords","n":15,"axis":"communication","note":"Says why the others are traps"}],"defend":{"covers":["utc","ist","timezone","5:30","midnight","evening"],"k":2,"minWords":25}}',
   '{"impact":30,"ownership":25,"communication":20,"prioritization":0,"ai_collaboration":10,"teamwork":15}'),
  ('w1d3', 'backend-starter', 1, 3, 'communicate',
   'Meera needs an answer, not a maybe',
   'Different muscle today: writing to a human who is having a bad day. Meera runs customer ops.',
   10,
   'Bad news travels with a plan|What happened, who is affected, what we are doing, when you will write next. Never promise what you do not control.',
   '[{"q":"The sync is stalled, cause unknown. Best next update?","options":["Say nothing until understood","State impact, what the team is doing, next-update time","Promise a fix within the hour"],"answer":1,"why":"You can always be honest about impact and next contact."}]',
   '{"from":"meera","ask":"Draft the reply Meera can send: four beats.","template":"{customer}''s {city} warehouse: dashboard stale ~3h, {shipId} shows no scans since morning, escalating to their COO."}',
   '{"meera":{"name":"Meera Kulkarni","role":"Customer Operations lead"}}',
   '{"work":[{"op":"includesAny","values":["stalled","delay","stale","issue"],"axis":"communication","note":"Names the problem plainly"},{"op":"includesAny","values":["next update","hear from","by ","within","update at"],"axis":"ownership","note":"Commits to a next-contact time"},{"op":"excludesAny","values":["guaranteed","100%","definitely fixed"],"axis":"communication","note":"No promises we do not control"},{"op":"minWords","n":30,"axis":"impact","note":"Covers all four beats"}],"defend":{"covers":["customer","update","impact","next","plan"],"k":2,"minWords":25}}',
   '{"impact":20,"ownership":25,"communication":35,"prioritization":0,"ai_collaboration":5,"teamwork":15}'),
  ('w1d4', 'backend-starter', 1, 4, 'prioritize',
   'Three fires, one afternoon',
   'No code today. I am in a leadership sync and something has to give — you triage.',
   8,
   'Triage by blast radius|Users hit now × damage growing × reversibility. Production wins almost every tie.',
   '[{"q":"A live sync job fails while a stakeholder pings about a report. First?","options":["The report — a person is waiting","The failing job — damage compounds","Flip a coin"],"answer":1,"why":"Blast radius and compounding damage win."}]',
   '{"from":"priya","ask":"Order the three items, then defend in two sentences.","choices":[{"id":"a","label":"Sync job → Meera''s report → Arjun''s review"},{"id":"b","label":"Report → sync job → review"},{"id":"c","label":"Review → sync job → report"}],"template":"{city} sync failing since 11:50 (manual re-scans); Meera wants a {metric} report EOD-ish; Arjun''s PR review whenever."}',
   '{"priya":{"name":"Priya Menon","role":"Engineering Manager"}}',
   '{"work":[{"op":"choiceEquals","choice":"a","axis":"prioritization","note":"Production first"},{"op":"includesAny","values":["production","failing","users","customers","manual","growing"],"axis":"impact","note":"Reasons from blast radius"},{"op":"minWords","n":18,"axis":"communication","note":"Says something to whoever waits"}],"defend":{"covers":["production","first","failing","sync","customers","manual"],"k":2,"minWords":25}}',
   '{"impact":25,"ownership":15,"communication":25,"prioritization":30,"ai_collaboration":0,"teamwork":5}'),
  ('w1d5', 'backend-starter', 1, 5, 'one-one',
   'Your first week, in Priya''s words',
   'Friday 1:1. Come with one thing you did well and one thing to work on — both in your words.',
   10,
   'Feedback is data|Say what you did well specifically, name your own gap, agree one concrete next step.',
   '[{"q":"Which self-assessment is usable in a 1:1?","options":["''I did pretty well overall.''","''The Wednesday update — I led with impact and gave a next-update time.''","''I need to communicate better.''"],"answer":1,"why":"Specific moments repeat; vague ones evaporate."}]',
   '{"from":"priya","ask":"Answer both 1:1 questions in one message, then defend out loud.","template":"Two questions: proudest moment + why; one gap + what you will do next week."}',
   '{"priya":{"name":"Priya Menon","role":"Engineering Manager"}}',
   '{"work":[{"op":"includesAny","values":["i ","my "],"axis":"ownership","note":"Owns it in first person"},{"op":"includesAny","values":["i will","next week","practice","habit","checklist"],"axis":"prioritization","note":"Names a concrete next step"},{"op":"minWords","n":35,"axis":"communication","note":"Both answers, specifically"}],"defend":{"covers":["gap","improve","next","week","practice"],"k":1,"minWords":20}}',
   '{"impact":10,"ownership":30,"communication":30,"prioritization":15,"ai_collaboration":0,"teamwork":15}'),
  ('w2d1', 'backend-starter', 2, 1, 'review',
   'Read before you comment',
   'Week two: code review. This week you read other people''s code more than you write your own.',
   12,
   'What to look for, including in AI-written code|Correctness at edges, failure paths, then style. Fluent AI code deserves MORE suspicion.',
   '[{"q":"A PR is beautifully written with comments. What changes about your review?","options":["Only a skim needed","Nothing — edges and failure paths checked either way, maybe harder","Reject it"],"answer":1,"why":"Fluency is not correctness; polish invites skimming."}]',
   '{"from":"arjun","ask":"Pick the issue that matters most, then write why.","choices":[{"id":"a","label":"Queries the database inside a loop — one round-trip per warehouse"},{"id":"b","label":"Function name too long"},{"id":"c","label":"Missing JSDoc"},{"id":"d","label":"cards should be a Map"}],"template":"{fn} pulls shipments per city and builds a summary card; passed staging."}',
   '{"arjun":{"name":"Arjun Rao","role":"Senior Engineer, your buddy"}}',
   '{"work":[{"op":"choiceEquals","choice":"a","axis":"impact","note":"Finds the N+1, not cosmetics"},{"op":"includesAny","values":["loop","per warehouse","round-trip","query","n+1","scale"],"axis":"ownership","note":"Explains the failure mode"},{"op":"minWords","n":15,"axis":"communication","note":"Says why it breaks in production"}],"defend":{"covers":["loop","query","slow","per","batch","scale"],"k":2,"minWords":25}}',
   '{"impact":35,"ownership":20,"communication":20,"prioritization":0,"ai_collaboration":10,"teamwork":15}'),
  ('w2d2', 'backend-starter', 2, 2, 'review',
   'The AI function that passes every happy test',
   'Today is the most important lesson of your first month. AI wrote a helper. It is wrong in a way no happy test catches.',
   12,
   'AI code is a draft|Generated code is confident at the edges: empty, zero, one, huge. Ask ''what input makes this wrong?'' first.',
   '[{"q":"An AI ''average'' helper passes sample-data tests. Which test is missing?","options":["A bigger sample","Empty list — and all-zeros","Renamed variables"],"answer":1,"why":"Averages die on empty input and mislead on all-zeros."}]',
   '{"from":"arjun","ask":"Name every input class where this returns something wrong or useless.","template":"{fn}(shipments) returns total / shipments.length — used on the dashboard and in the {metric} report."}',
   '{"arjun":{"name":"Arjun Rao","role":"Senior Engineer, your buddy"}}',
   '{"work":[{"op":"includesAny","values":["empty","no shipment","zero","length 0","0 items"],"axis":"impact","note":"Catches the empty-list divide"},{"op":"includesAny","values":["nan","divide","infinity","undefined","zero"],"axis":"ownership","note":"Says what it returns"},{"op":"minWords","n":15,"axis":"communication","note":"Names the class, not one example"}],"defend":{"covers":["empty","zero","edge","divide","nan","input"],"k":2,"minWords":25}}',
   '{"impact":35,"ownership":25,"communication":15,"prioritization":0,"ai_collaboration":20,"teamwork":5}'),
  ('w2d3', 'backend-starter', 2, 3, 'communicate',
   'Write the review you would want to receive',
   'Yesterday you found the problem. Today you say it to a human — in writing, on the record.',
   10,
   'Review the code, not the person|Line, consequence in user terms, proposed direction. Never grade the author.',
   '[{"q":"Which review comment improves the code?","options":["''Obviously wrong, fix.''","''Line 8 divides by zero for an empty list — suggest returning null and rendering no data.''","''Works for me.''"],"answer":1,"why":"Line, consequence, proposal."}]',
   '{"from":"arjun","ask":"Write the actual review comment: line, consequence, proposed direction.","template":"Write the verbatim review comment for the {fn} line."}',
   '{"arjun":{"name":"Arjun Rao","role":"Senior Engineer, your buddy"}}',
   '{"work":[{"op":"seedRef","field":"fn","axis":"ownership","note":"References the actual function"},{"op":"includesAny","values":["suggest","consider","what if","could","option"],"axis":"teamwork","note":"Proposes, does not command"},{"op":"includesAny","values":["empty","zero","divide","nan","edge"],"axis":"impact","note":"States the concrete consequence"},{"op":"excludesAny","values":["stupid","sloppy","careless","obviously","terrible"],"axis":"teamwork","note":"Reviews code, not the person"},{"op":"minWords","n":30,"axis":"communication","note":"Complete enough to act on"}],"defend":{"covers":["line","empty","suggest","fix","edge","review"],"k":2,"minWords":25}}',
   '{"impact":20,"ownership":20,"communication":30,"prioritization":0,"ai_collaboration":10,"teamwork":20}'),
  ('w2d4', 'backend-starter', 2, 4, 'fix',
   'Apply the feedback to your own branch',
   'Plot twist: the AI tool accepted your review and rewrote the helper. Now it is on YOUR branch to land. Pick the patch.',
   10,
   'Small diffs ship|Guard the edge, return something explicit. Refuse error-swallowing and magic defaults — fabricated numbers are small lies with a chart attached.',
   '[{"q":"The empty-list crash needs a fix. Which patch do you approve?","options":["try/catch returning 0","Return null for empty; render ''No data yet''","Substitute a default shipment"],"answer":1,"why":"Explicit honesty scales; fake numbers lie politely."}]',
   '{"from":"arjun","ask":"Pick the patch, refuse the others in one line each.","choices":[{"id":"a","label":"Patch A — explicit null for empty input"},{"id":"b","label":"Patch B — catch and return 0"},{"id":"c","label":"Patch C — substitute a default shipment"}],"template":"Guard for {fn}: A returns null on empty; B catches and returns 0; C substitutes DEFAULT_SHIPMENT."}',
   '{"arjun":{"name":"Arjun Rao","role":"Senior Engineer, your buddy"}}',
   '{"work":[{"op":"choiceEquals","choice":"a","axis":"impact","note":"Picks the honest guard"},{"op":"includesAny","values":["b","catch","swallow","fake","c","default","lie","mask"],"axis":"ownership","note":"Refuses the anti-patterns explicitly"},{"op":"minWords","n":18,"axis":"communication","note":"Says why, not just which"}],"defend":{"covers":["null","guard","empty","honest","fake","catch","return"],"k":2,"minWords":25}}',
   '{"impact":30,"ownership":30,"communication":15,"prioritization":0,"ai_collaboration":15,"teamwork":10}'),
  ('w2d5', 'backend-starter', 2, 5, 'one-one',
   'Two weeks in: what you can now claim',
   'Vikram sits in on this one. He asks one question. It is the interview question.',
   12,
   'Claim honestly|Say ''job simulation'' or ''training''; STAR shape; your actions, your result — never ''work experience''.',
   '[{"q":"The honest, strong interview framing is:","options":["''At my last job at Setu Freight…''","''In a two-week job simulation at a freight company, I found and fixed two data-integrity bugs…''","''I did some practice tasks online.''"],"answer":1,"why":"Named simulation, named actions, named outcome."}]',
   '{"from":"vikram","ask":"Write your STAR interview answer, then deliver it out loud.","template":"''Tell me about a time you caught what everyone missed'' — the AI-drafted {fn} is your material."}',
   '{"vikram":{"name":"Vikram Shah","role":"Founder"}}',
   '{"work":[{"op":"includesAny","values":["i noticed","i found","i caught","i checked","i asked","i ran","i tested"],"axis":"ownership","note":"STAR action is yours"},{"op":"includesAny","values":["because","so that","as a result","which meant","result"],"axis":"impact","note":"Names the consequence"},{"op":"excludesAny","values":["work experience","at my job"],"axis":"communication","note":"Calls it a simulation, honestly"},{"op":"minWords","n":40,"axis":"communication","note":"A real interview answer"}],"defend":{"covers":["caught","found","noticed","checked","missed","empty","loop"],"k":2,"minWords":35}}',
   '{"impact":20,"ownership":30,"communication":25,"prioritization":0,"ai_collaboration":10,"teamwork":15}')
on conflict (id) do nothing;

-- Account deletion (DPDP): every student-owned row dies with the student.
-- The file-store equivalent lives in routes/auth.js (the workplace sweep in
-- the delete flow).
