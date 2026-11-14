-- Practice — the Supabase schema for the rebuilt feature.
-- The app today persists these as per-student JSON documents under
-- backend/data/practice-*.json (the documented pre-beta store; see
-- backend/src/lib/practice/store.js — its accessors map 1:1 onto these
-- tables). This file is the migration target: when accounts move to Supabase
-- auth, these tables + row-level security replace the file stores. Every
-- student-owned row is readable and writable ONLY by its own student, by
-- policy — the bearer-token app enforces the same rule in practice.js.

create table if not exists scenarios (
  id           text primary key,
  title        text not null,
  track        text not null check (track in ('Software Engineering', 'AI & ML', 'Cyber Security')),
  level        int  not null check (level between 1 and 5),
  status       text not null default 'draft' check (status in ('draft', 'published')),
  data         jsonb not null,          -- the full scripted scenario (zod-validated upstream)
  source_url   text not null,
  reviewed_by  text,
  created_at   timestamptz not null default now()
);

create table if not exists incident_attempts (
  id            uuid primary key,
  student_id    text not null,
  scenario_id   text not null references scenarios(id),
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  actions       jsonb not null default '[]',
  hypothesis    text,
  notes         text,
  chosen_root_cause text,
  chosen_fix    text,
  score         jsonb,                  -- computed in code, never by the AI
  hints_used    int not null default 0,
  unique (student_id, id)
);

create table if not exists drills (
  id          text primary key,
  scenario_id text not null references scenarios(id),
  moment      jsonb not null,
  level       int  not null check (level between 1 and 5),
  track       text,                      -- null = shared, every track
  season_id   text references seasons(id)
);

create table if not exists seasons (
  id    text primary key,
  name  text not null,
  blurb text not null
);

create table if not exists drill_attempts (
  id          uuid primary key,
  student_id  text not null,
  drill_id    text not null references drills(id),
  day_key     text not null,            -- istDayKey(), the 4 am IST day
  choice      int not null,
  correct     boolean not null,
  answered_at timestamptz not null default now(),
  unique (student_id, day_key)
);

create table if not exists postmortems (
  id            uuid primary key,
  student_id    text not null,
  attempt_id    uuid not null references incident_attempts(id),
  body          jsonb not null,          -- current version's five sections
  feedback      jsonb,                   -- rubric critique (validated AI or rules)
  score         int not null check (score between 0 and 100),  -- computed in code
  version       int not null default 1,
  share_token   text unique,
  share_enabled boolean not null default false,
  updated_at    timestamptz not null default now()
);

create table if not exists defend_attempts (
  id            uuid primary key,
  student_id    text not null,
  postmortem_id uuid not null references postmortems(id),
  answers       jsonb not null,
  score         int not null check (score between 0 and 100),  -- computed in code
  per_question  jsonb not null,
  created_at    timestamptz not null default now()
);

create table if not exists practice_levels (
  student_id text not null,
  track      text not null,
  level      int  not null default 1 check (level between 1 and 5),
  recent     jsonb not null default '[]', -- last band results feeding quiet adjustment
  updated_at timestamptz not null default now(),
  primary key (student_id, track)
);

create table if not exists practice_streaks (
  student_id   text primary key,
  done         jsonb not null default '{}',   -- { 'YYYY-MM-DD': true }
  bridge       jsonb not null default '{}',   -- { day: 'freeze' | 'rescue' }
  freeze_weeks jsonb not null default '{}',   -- { 'YYYY-Www': true }
  rescue       jsonb,                         -- { day, restored }
  best         int not null default 0,
  updated_at   timestamptz not null default now()
);

-- ---- row-level security: a student reads only their own attempts and
-- postmortems (the rest of the app runs server-side under the service key). ----

alter table incident_attempts enable row level security;
alter table drill_attempts enable row level security;
alter table postmortems enable row level security;
alter table defend_attempts enable row level security;
alter table practice_levels enable row level security;
alter table practice_streaks enable row level security;

-- student_id maps to the authenticated user once accounts live on Supabase auth;
-- until then the bearer-token backend enforces the identical rule in code.
create policy own_incident_attempts on incident_attempts
  for all using (student_id = auth.jwt() ->> 'email');
create policy own_drill_attempts on drill_attempts
  for all using (student_id = auth.jwt() ->> 'email');
create policy own_postmortems on postmortems
  for all using (student_id = auth.jwt() ->> 'email');
create policy own_defend_attempts on defend_attempts
  for all using (student_id = auth.jwt() ->> 'email');
create policy own_practice_levels on practice_levels
  for all using (student_id = auth.jwt() ->> 'email');
create policy own_practice_streaks on practice_streaks
  for all using (student_id = auth.jwt() ->> 'email');

-- Shared read-only work records: published scenarios are readable by all,
-- the private work-record JSON stays server-side (an explicit share token
-- is the only public door).
alter table scenarios enable row level security;
create policy anyone_reads_published_scenarios on scenarios
  for select using (status = 'published');
alter table drills enable row level security;
alter table seasons enable row level security;
create policy anyone_reads_drills on drills for select using (true);
create policy anyone_reads_seasons on seasons for select using (true);

-- Account deletion (DPDP): every student-owned row dies with the student.
-- The file-store equivalent lives in routes/auth.js (PRACTICE_FILES sweep).
