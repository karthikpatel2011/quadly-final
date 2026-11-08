// Shared onboarding/settings option lists — the frontend's copy. The backend
// (lib/personalize.js) validates against its own identical list; when you edit
// one, edit both. (House rule: no imports across the two apps.)

export const INTEREST_OPTIONS = [
  'Frontend development', 'Backend development', 'Full-stack development',
  'Artificial intelligence', 'Machine learning', 'Data science',
  'Cybersecurity', 'Cloud engineering', 'DevOps / Platform engineering',
  'Mobile development', 'Game development', 'Blockchain / Web3',
  'UI/UX and product design', 'Open source', 'Research',
  'Startups / entrepreneurship', 'Competitive programming / problem solving',
  'Not sure yet',
];
export const GOAL_OPTIONS = [
  'Figure out what I want to pursue', 'Learn practical skills', 'Build real projects',
  'Create a strong portfolio', 'Find project teammates', 'Find a mentor',
  'Prepare for interviews', 'Find an internship', 'Find a job',
  'Explore hackathons and opportunities', 'Start something of my own',
];
export const STAGE_OPTIONS = [
  'Exploring', 'Learning fundamentals', 'Building projects',
  'Preparing for opportunities', 'Already working / interning',
];
export const TIME_OPTIONS = [
  '15 minutes a day', '30 minutes a day', 'Around 1 hour a day',
  'A few hours each week', 'My schedule changes',
];
