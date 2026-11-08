import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import HomeFrontPage from '../src/components/dashboard/HomeFrontPage.jsx';

// Contract tests for Home V1 (docs/HOME-REFERENCE.md): a calm personal page —
// Today (plan tasks with Start, no checkbox), the day's challenge, the
// college week (drive + official notices with "New" marks), private wins,
// and the squad rail with create/join/nudge. No posting anywhere. Sections
// hide when empty and fail independently.

const apiMock = vi.fn();
vi.mock('../src/lib/api.js', () => ({ apiFetch: (...args) => apiMock(...args) }));

const okToday = {
  status: 'ok',
  data: {
    date: '2026-11-01', label: 'Sun, 1 Nov', name: 'Riya Sharma', college: 'IIT Bombay', avatar: '07',
    onboarded: true, hasPlan: true,
    plan: { startedAt: '2026-10-20', totalDays: 90, dayNumber: 12, weekNumber: 2, theme: 'DSA foundations' },
    missions: [
      { id: '2026-11-01:learn:0', category: 'learn', categoryLabel: 'Learn', title: 'Do the Daily 15 drill', minutes: 15, done: true, result: 'Passed 4/5', href: 'practice/daily-15' },
      { id: '2026-11-01:interview:1', category: 'interview', categoryLabel: 'Interview', title: 'One timed mock question', minutes: 10, done: false, result: null, href: 'practice/interviews' },
      { id: '2026-11-01:ship:2', category: 'ship', categoryLabel: 'Ship', title: 'Ship a commit to project-x', minutes: 25, done: false, result: null, href: 'projects' },
    ],
    doneCount: 1, total: 3, minutesLeft: 35,
    streak: 7, freezesLeft: 1, missedDays: 0, streakFresh: false,
  },
};

function homePayload(over = {}) {
  return {
    ok: true, date: '2026-11-01', label: 'Sun, 1 Nov',
    today: okToday,
    challenge: {
      status: 'ok',
      data: { title: 'Daily 15 — today’s question drill', href: 'practice/daily-15', minutes: 15, result: null, collegePlayedToday: 0, topScorers: [] },
    },
    collegeWeek: {
      status: 'ok',
      data: {
        drive: { startsAt: '2026-11-02T09:30:00.000Z', serverNow: '2026-11-01T09:00:00.000Z', capacity: 50, registered: 7, registeredByMe: false, live: false, whenText: 'Mon, 3:00 pm IST' },
        notices: [{ id: 'off_1', title: 'Placement-cell: TCS drive registration', body: 'Register before Wednesday on the portal.', link: 'https://placement.example.com', college: 'IIT Bombay', isNew: true }],
      },
    },
    wins: { status: 'ok', data: { items: [{ id: 'win-7', text: '7-day streak — kept by finished work.', at: '2026-11-01T05:00:00.000Z' }] } },
    squad: { status: 'ok', data: { squad: null } },
    caughtUp: { status: 'ok', data: { next: { label: 'Mock drive', at: '2026-11-02T09:30:00.000Z', whenText: 'Mon, 3:00 pm IST' } } },
    ...over,
  };
}

beforeEach(() => {
  localStorage.setItem('quadly:token', JSON.stringify('tok'));
  apiMock.mockReset();
  apiMock.mockImplementation((path) => {
    if (path === '/home') return Promise.resolve(homePayload());
    return Promise.resolve({});
  });
});

afterEach(cleanup);

async function renderHome(over = {}, features = { squad: { ok: true, squad: null } }) {
  apiMock.mockImplementation((path) => {
    if (path === '/home') return Promise.resolve(homePayload(over));
    return Promise.resolve({});
  });
  render(<HomeFrontPage features={features} onNavigate={vi.fn()} />);
  await screen.findByText(/1 of 3 done/, {}, { timeout: 3000 });
  return screen;
}

describe('Today', () => {
  it('renders the progress, streak with freeze, and the three real tasks', async () => {
    const s = await renderHome();
    const today = s.getByLabelText('Today');
    expect(today.textContent).toContain('1 of 3 done, about 35 minutes left');
    expect(today.textContent).toContain('7-day streak · 1 freeze left');
    expect(within(today).getAllByRole('button', { name: 'Start' }).length).toBe(2); // done task has none
    expect(today.textContent).toContain('Passed 4/5'); // finished result, muted
  });

  it('Start opens the real activity — and there is no checkbox anywhere', async () => {
    const onNav = vi.fn();
    render(<HomeFrontPage features={{ squad: { ok: true, squad: null } }} onNavigate={onNav} />);
    const starts = await screen.findAllByRole('button', { name: 'Start' }, {}, { timeout: 3000 });
    fireEvent.click(starts[0]); // first undone = the interview task
    expect(onNav).toHaveBeenCalledWith('practice/interviews');
    expect(document.querySelectorAll('input[type="checkbox"]').length).toBe(0);
  });

  it('a new student with no plan sees the onboarding card instead of tasks', async () => {
    apiMock.mockImplementation((path) => {
      if (path === '/home') {
        return Promise.resolve(homePayload({
          today: { status: 'ok', data: { ...okToday.data, hasPlan: false, missions: [], plan: null, total: 0, doneCount: 0, minutesLeft: 0, streak: 0, missedDays: 0, streakFresh: true } },
        }));
      }
      return Promise.resolve({});
    });
    render(<HomeFrontPage features={{ squad: { ok: true, squad: null } }} onNavigate={vi.fn()} />);
    const s = await screen.findByText('Build your plan in 90 seconds', {}, { timeout: 3000 });
    expect(s).toBeTruthy();
    expect(screen.queryByLabelText(/Today’s challenge/i)).toBeNull();
  });

  it('after repeated missed days the rescue line appears', async () => {
    const s = await renderHome({
      today: { status: 'ok', data: { ...okToday.data, missedDays: 4, streak: 0 } },
    });
    expect(s.getByText(/You missed 4 days/)).toBeTruthy();
    expect(s.getByRole('button', { name: 'Rescue' })).toBeTruthy();
  });
});

describe('Today’s challenge', () => {
  it('shows the Play action, the college count, and consented top scorers', async () => {
    const s = await renderHome({
      challenge: { status: 'ok', data: { title: 'Daily 15 — today’s question drill', href: 'practice/daily-15', minutes: 15, result: null, collegePlayedToday: 12, topScorers: [{ name: 'Asha', score: 5, total: 5 }] } },
    });
    const c = s.getByLabelText('Today’s challenge');
    expect(within(c).getByRole('button', { name: 'Play' })).toBeTruthy();
    expect(c.textContent).toContain('12 students at your college played today');
    expect(c.textContent).toContain('Asha (5/5)');
  });

  it('shows the result after playing instead of the Play button', async () => {
    const s = await renderHome({
      challenge: { status: 'ok', data: { title: 'Daily 15 — today’s question drill', href: 'practice/daily-15', minutes: 15, result: { score: 4, total: 5, done: true }, collegePlayedToday: 0, topScorers: [] } },
    });
    const c = s.getByLabelText('Today’s challenge');
    expect(c.textContent).toContain('Done — Passed 4/5');
    expect(within(c).queryByRole('button', { name: 'Play' })).toBeNull();
  });
});

describe('Your college this week', () => {
  it('shows the drive with seats, a Register action, and new-marked notices', async () => {
    const s = await renderHome();
    const w = s.getByLabelText('Your college this week');
    expect(w.textContent).toContain('7 of 50 seats');
    fireEvent.click(within(w).getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/drive/register', expect.anything()));
    const notice = within(w).getByText('Placement-cell: TCS drive registration').closest('.qd-h-week__notice');
    expect(within(notice).getByText('New')).toBeTruthy();
    const open = notice.querySelector('a');
    expect(open.href).toBe('https://placement.example.com/');
  });

  it('hides entirely when the drive is far away and there are no notices', async () => {
    await renderHome({
      collegeWeek: {
        status: 'ok',
        data: {
          drive: { startsAt: '2026-11-28T09:30:00.000Z', serverNow: '2026-11-01T09:00:00.000Z', capacity: 50, registered: 0, registeredByMe: false, live: false, whenText: 'Sat, 3:00 pm IST' },
          notices: [],
        },
      },
    });
    await screen.findByText(/You’re caught up/, {}, { timeout: 3000 });
    expect(screen.queryByLabelText('Your college this week')).toBeNull();
  });
});

describe('Your wins (private)', () => {
  it('lists verified wins with the private mark', async () => {
    const s = await renderHome();
    const w = s.getByLabelText('Your wins');
    expect(w.textContent).toContain('7-day streak — kept by finished work.');
    expect(w.textContent).toContain('private');
  });

  it('hides the section when there is nothing real to show', async () => {
    await renderHome({ wins: { status: 'empty', data: { items: [] } } });
    await screen.findByText(/You’re caught up/, {}, { timeout: 3000 });
    expect(screen.queryByLabelText('Your wins')).toBeNull();
  });
});

describe('Your squad (rail)', () => {
  it('creates a squad from the card and swaps to the joined view', async () => {
    const s = await renderHome();
    const card = s.getByLabelText('Your squad');
    fireEvent.change(within(card).getByLabelText('Squad name'), { target: { value: 'Night Owls' } });
    apiMock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      squad: { name: 'Night Owls', maxMembers: 4, members: [{ email: 'me@t.dev', isMe: true, doneToday: true, nudgesReceived: 0 }], nudgesLeft: 2 },
    }));
    fireEvent.click(within(card).getByRole('button', { name: 'Create squad' }));
    await waitFor(() => expect(card.textContent).toContain('Night Owls'));
    expect(card.textContent).toContain('1 of 4 finished today');
  });

  it('joins by code from the card', async () => {
    const s = await renderHome();
    const card = s.getByLabelText('Your squad');
    fireEvent.change(within(card).getByLabelText('Squad join code'), { target: { value: 'NVW4KR' } });
    apiMock.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      squad: { name: 'Debug Duo', maxMembers: 4, members: [{ email: 'me@t.dev', isMe: true, doneToday: null, nudgesReceived: 0 }], nudgesLeft: 2 },
    }));
    fireEvent.click(within(card).getByRole('button', { name: 'Join' }));
    await waitFor(() => expect(card.textContent).toContain('Debug Duo'));
    const call = apiMock.mock.calls.find((c) => c[0] === '/squad/join');
    expect(JSON.parse(call[1].body).code).toBe('NVW4KR');
  });

  it('nudges the squadmate who has not finished', async () => {
    const s = await renderHome({
      squad: {
        status: 'ok',
        data: {
          squad: {
            name: 'Debug Duo', maxMembers: 4, nudgesLeft: 2,
            members: [
              { email: 'me@t.dev', isMe: true, doneToday: true, nudgesReceived: 0 },
              { email: 'you@t.dev', name: 'Bhuvan', isMe: false, doneToday: false, nudgesReceived: 0 },
            ],
          },
        },
      },
    });
    const card = s.getByLabelText('Your squad');
    expect(card.textContent).toContain('1 of 4 finished today');
    apiMock.mockImplementationOnce(() => Promise.resolve({ ok: true }));
    fireEvent.click(within(card).getByRole('button', { name: 'Nudge' }));
    await waitFor(() => expect(screen.getByText('Nudged.')).toBeTruthy());
    expect(apiMock).toHaveBeenCalledWith('/squad/nudge', expect.objectContaining({ method: 'POST' }));
  });
});

describe('end of page + isolation', () => {
  it('ends with You’re caught up and the next scheduled item', async () => {
    const s = await renderHome();
    expect(s.getByText(/You’re caught up\. Next: Mock drive · Mon, 3:00 pm IST\./)).toBeTruthy();
  });

  it('a failing section shows its own error and never blanks the page', async () => {
    const s = await renderHome({ challenge: { status: 'error', data: null } });
    await waitFor(() => expect(s.getByText(/Today’s challenge could not load/i)).toBeTruthy());
    expect(s.getByLabelText('Today')).toBeTruthy();
  });
});
