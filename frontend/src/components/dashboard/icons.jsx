// Shared stroke-icon set + category mapping for the dashboard.
// One family, one weight (video-02 lesson: repetition teaches).

export const ICONS = {
  home: 'M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z',
  plan: 'M5 4.5h11.5l2.5 2.5v12.5H5zM8.5 9.5h7M8.5 13h7M8.5 16.5h4.5',
  practice: 'M12 4.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5 20v-1.5c0-2.5 3-4.5 7-4.5s7 2 7 4.5V20',
  mics: 'M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20',
  projects: 'M4.5 7.5 12 4l7.5 3.5-7.5 3.5zM4.5 7.5v9L12 20v-9M19.5 7.5v9L12 20',
  drive: 'M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM12 8v4l2.5 2.5',
  squad: 'M9 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM3.5 19.5v-1a4.5 4.5 0 0 1 9 0M15.5 11.5a2.2 2.2 0 1 0 0-4.4M16 13.6c2.6.4 4.5 1.9 4.5 3.9v2',
  syllabus: 'M5 5.5h6.5v13H5zM12.5 5.5H19v13h-6.5zM7 9h2.5M14.5 9H17M7 12.5h2.5M14.5 12.5H17',
  launch: 'M13 4.5c3.5 0 6.5 3 6.5 6.5-2 2.5-5 5-8.5 6l-3-3c1-3.5 3.5-7.5 5-9.5zM7.5 14c-1.5.5-2.5 2-3 4.5 2.5-.5 4-1.5 4.5-3M14.5 9.5h.01',
  check: 'M5 12.5 10 17.5 19 7',
  work: 'M4 8.5h16v11H4zM9 8.5V6h6v2.5M4 13.5h16',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
  sun: 'M12 5V3M12 21v-2M5 12H3M21 12h-2M6.4 6.4 5 5M19 19l-1.4-1.4M6.4 17.6 5 19M19 5l-1.4 1.4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
};

export function Icon({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="qd-ic">
      <path d={ICONS[name] || ICONS.home} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Task-category → icon mapping (Home + Plan task rows). */
export const CATEGORY_ICON = {
  ship: 'projects',
  apply: 'plan',
  network: 'squad',
  interview: 'mics',
  learn: 'syllabus',
};

/** Readiness-domain → icon mapping (Focus areas / breakdown rows). */
export const DOMAIN_ICON = {
  'Ship Proof': 'projects',
  'Role Clarity': 'plan',
  'Campus Circle': 'squad',
  'Interview Reps': 'mics',
  'Momentum': 'practice',
};
