import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import Dashboard from '../src/components/dashboard/Dashboard.jsx';

// The chrome contract: ONE sticky top bar drives the whole app — primary
// items, a Practice dropdown, theme, Upgrade, and the account menu. No rail,
// no sidebar, no bottom bar. Data rules carry over: real payload values only,
// honest empty states, and a failing Home section never blanks the page.

const apiMock = vi.fn();
vi.mock('../src/lib/api.js', () => ({ apiFetch: (...args) => apiMock(...args) }));

const PAYLOAD = {
  ok: true, email: 'k@t.dev', date: '2026-11-01', name: 'Kartik', college: 'Oregon State',
  target: { role: 'SDE', company: 'Stripe' }, avatar: '12', ambassador: null,
  missions: [
    { id: '2026-11-01:ship:0', category: 'ship', title: 'Ship a commit', done: false },
    { id: '2026-11-01:apply:1', category: 'apply', title: 'Save 3 roles', done: true },
    { id: '2026-11-01:learn:2', category: 'learn', title: 'Read one blog', done: false },
  ],
  streak: 9, totalDone: 40, score: 42,
  map: [{ label: 'Ship Proof', level: 28, note: 'test' }],
  history: {}, chat: [], aiOnline: false, asksToday: 2, askCap: 30,
  plan: { startedAt: '2026-10-20', totalDays: 90, dayNumber: 12, weekNumber: 2, theme: 'Resume' },
};

const HOME_OK = {
  ok: true,
  date: '2026-11-01',
  label: 'Sun, 1 Nov',
  today: {
    status: 'ok',
    data: {
      date: '2026-11-01', label: 'Sun, 1 Nov', name: 'Kartik', college: 'Oregon State', avatar: '12',
      onboarded: true, hasPlan: true,
      plan: { startedAt: '2026-10-20', totalDays: 90, dayNumber: 12, weekNumber: 2, theme: 'Resume' },
      missions: [
        { id: '2026-11-01:ship:0', category: 'ship', categoryLabel: 'Ship', title: 'Ship a commit', minutes: 20, done: true, result: 'Project saved — doctor 3/4', href: 'projects' },
        { id: '2026-11-01:interview:1', category: 'interview', categoryLabel: 'Interview', title: 'One timed mock question', minutes: 10, done: false, result: null, href: 'practice/interviews' },
        { id: '2026-11-01:apply:2', category: 'apply', categoryLabel: 'Apply', title: 'Save 3 roles', minutes: 10, done: false, result: null, href: 'plan' },
      ],
      doneCount: 1, total: 3, minutesLeft: 20,
      streak: 9, freezesLeft: 1, missedDays: 0, streakFresh: false,
    },
  },
  challenge: {
    status: 'ok',
    data: { title: 'Daily 15 — today’s question drill', href: 'practice/daily-15', minutes: 15, result: null, collegePlayedToday: 0, topScorers: [] },
  },
  collegeWeek: {
    status: 'ok',
    data: {
      drive: { startsAt: '2026-11-07T09:30:00.000Z', serverNow: '2026-11-01T05:00:00.000Z', capacity: 50, registered: 0, registeredByMe: false, live: false, whenText: 'Sat, 3:00 pm IST' },
      notices: [],
    },
  },
  wins: { status: 'empty', data: { items: [] } },
  squad: { status: 'ok', data: { squad: null } },
  caughtUp: { status: 'ok', data: { next: { label: 'Mock drive', at: '2026-11-07T09:30:00.000Z', whenText: 'Sat, 3:00 pm IST' } } },
};

beforeEach(() => {
  localStorage.clear();
  apiMock.mockReset();
  apiMock.mockImplementation((path) => {
    if (path === '/dashboard') return Promise.resolve(PAYLOAD);
    if (path === '/home') return Promise.resolve(HOME_OK);
    return Promise.resolve({});
  });
  window.history.replaceState({}, '', '/app');
});

afterEach(cleanup);

async function renderReady() {
  render(<Dashboard />);
  await screen.findByText(/1 of 3 done/, {}, { timeout: 3000 });
  return screen;
}

describe('the top bar', () => {
  it('carries every primary section and no side chrome exists', async () => {
    const s = await renderReady();
    expect(s.getByLabelText('Primary')).toBeTruthy();
    ['Home', 'Plan', 'Practice', 'Projects', 'Squad', 'Syllabus', 'Launchpad'].forEach((label) => {
      expect(s.getAllByRole('button', { name: new RegExp(`^${label}`) }).length).toBeGreaterThan(0);
    });
    expect(document.querySelector('.qd-rail')).toBeNull();
    expect(document.querySelector('.qd-sidebar')).toBeNull();
    expect(document.querySelector('.qd-bottombar')).toBeNull();
  });

  it('opens the Practice dropdown and navigates to a tool', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByRole('button', { name: /^Practice/ }));
    const menu = await s.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Interviews' }));
    await waitFor(() => expect(document.querySelector('.qd-ws__title').textContent).toBe('Practice'));
    expect(document.title).toContain('Interviews');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('navigates between sections straight from the bar', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByRole('button', { name: 'Projects' }));
    await waitFor(() => expect(document.title).toContain('Projects'));
    expect(document.querySelector('.qd-ws__title').textContent).toBe('Projects');
    fireEvent.click(s.getByRole('button', { name: 'Home' }));
    await screen.findByText(/1 of 3 done/, {}, { timeout: 3000 });
  });
});

describe('the mobile menu sheet', () => {
  it('lists every section under the bar and navigates', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByRole('button', { name: 'Menu' }));
    const sheet = s.getByLabelText('All sections');
    expect(sheet.textContent).toContain('Daily 15');
    expect(sheet.textContent).toContain('Contests');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Syllabus' }));
    await waitFor(() => expect(document.querySelector('.qd-ws__title').textContent).toBe('Syllabus'));
    expect(s.queryByLabelText('All sections')).toBeNull();
  });
});

describe('avatar + theme + account (top bar)', () => {
  it('shows the avatar image from the pfp set', async () => {
    await renderReady();
    expect(document.querySelector('.qd-top img[src*="/avatars/12.webp"]').getAttribute('src')).toBe('/avatars/12.webp');
  });

  it('toggles the light theme from the account menu and the quick toggle', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByLabelText('Account menu'));
    fireEvent.click(screen.getByText('Light theme'));
    expect(document.querySelector('.qd-app').dataset.qdTheme).toBe('light');
    fireEvent.click(s.getByLabelText('Switch to dark theme'));
    await waitFor(() => expect(document.querySelector('.qd-app').dataset.qdTheme).toBe('dark'));
  });

  it('home section isolation: failing challenge shows its own error card', async () => {
    let homeCalls = 0;
    apiMock.mockImplementation((path) => {
      if (path === '/dashboard') return Promise.resolve(PAYLOAD);
      if (path === '/home') {
        homeCalls += 1;
        if (homeCalls === 1) return Promise.resolve({ ...HOME_OK, challenge: { status: 'error', data: null } });
        return Promise.resolve(HOME_OK);
      }
      return Promise.resolve({});
    });
    render(<Dashboard />);
    await screen.findByText(/Today’s challenge could not load/i, {}, { timeout: 3000 });
    expect(screen.getByLabelText('Today')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText(/Daily 15/i, {}, { timeout: 3000 });
  });

  it('has a theme quick-toggle with an honest label', async () => {
    const s = await renderReady();
    expect(s.getByLabelText('Switch to light theme')).toBeTruthy();
    fireEvent.click(s.getByLabelText('Switch to light theme'));
    await waitFor(() => expect(s.getByLabelText('Switch to dark theme')).toBeTruthy());
    expect(document.querySelector('.qd-app').dataset.qdTheme).toBe('light');
  });

  it('sign-out is available and calls the endpoint', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByLabelText('Account menu'));
    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/auth/logout', expect.anything()));
  });

  it('routes Profile and Change picture from the account menu', async () => {
    const s = await renderReady();
    fireEvent.click(s.getByLabelText('Account menu'));
    expect(s.getByRole('menuitem', { name: 'Change picture' })).toBeTruthy();
    fireEvent.click(s.getByRole('menuitem', { name: 'Profile' }));
    await waitFor(() => expect(s.getByRole('img', { name: /Readiness score 42/ })).toBeTruthy());
    expect(s.getByLabelText('Activity')).toBeTruthy();
  });
});
