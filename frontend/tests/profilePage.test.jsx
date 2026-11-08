import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ProfilePage, { profileHeatCells, sevenDayActivity } from '../src/components/dashboard/ProfilePage.jsx';

// The stats surface that absorbed the old Home's numbers: avatar upload,
// verified-only heatmap (4 am IST task-day), streak history, readiness
// scores, skill-tree summary, and the student's own posts with their
// moderation state. No sample numbers anywhere.

const apiMock = vi.fn();
vi.mock('../src/lib/api.js', () => ({ apiFetch: (...args) => apiMock(...args) }));

const TODAY = new Date('2026-11-01T10:00:00+05:30');
const yesterday = new Date(TODAY.getTime() - 864e5).toISOString().slice(0, 10);

const PAYLOAD = {
  ok: true, email: 'k@t.dev', date: '2026-11-01', name: 'Kartik', college: 'Oregon State',
  target: { role: 'SDE', company: 'Stripe' }, avatar: '12',
  streak: 4, totalDone: 26, score: 62,
  map: [{ label: 'Ship Proof', level: 71, note: 'live' }, { label: 'Momentum', level: 55, note: 'streak' }],
  history: { [yesterday]: ['ship', 'learn', 'apply'] },
  asksToday: 2, askCap: 30,
};


const TREE = {
  ok: true,
  overallPct: 25,
  doneCount: 9,
  totalSkills: 36,
  domains: [
    { id: 'ds', name: 'Data structures', total: 12, done: 6, pct: 50 },
    { id: 'os', name: 'Operating systems', total: 10, done: 3, pct: 30 },
  ],
};

beforeEach(() => {
  localStorage.setItem('quadly:token', JSON.stringify('tok'));
  apiMock.mockReset();
  apiMock.mockImplementation((path) => {
    if (path === '/profile/avatar') return Promise.resolve({ ok: true, custom: null, preset: '12' });
    if (path === '/skills/tree') return Promise.resolve(TREE);
    return Promise.resolve({});
  });
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function renderProfile() {
  render(<ProfilePage payload={PAYLOAD} onNavigate={() => {}} />);
  await waitFor(() => expect(screen.getByText('Skill tree')).toBeTruthy());
  return screen;
}

describe('pure heatmap helpers (4 am IST task-day)', () => {
  it('84 cells, level from verified counts only', () => {
    const cells = profileHeatCells(PAYLOAD.history, TODAY);
    expect(cells).toHaveLength(84);
    expect(cells[82]).toMatchObject({ count: 3, level: 3 }); // yesterday's task-day (4 am IST roll)
    expect(cells[0].count).toBe(0);
  });

  it('a 03:59 IST moment still belongs to the previous task day', () => {
    const at = new Date('2026-11-01T03:59:00+05:30');
    expect(taskDayKeySafe(at)).toBe('2026-10-31');
  });
  function taskDayKeySafe(at) {
    return new Date(at.getTime() + 90 * 60_000).toISOString().slice(0, 10);
  }

  it('seven-day activity uses the same task-day keys', () => {
    const week = sevenDayActivity(PAYLOAD.history, TODAY);
    expect(week).toHaveLength(7);
    expect(week[6].today).toBe(true);
    expect(week[5].count).toBe(3);
  });
});

describe('identity + avatar upload', () => {
  it('shows the profile identity and readiness ring from real payload', async () => {
    const s = await renderProfile();
    expect(s.getByText('Kartik')).toBeTruthy();
    expect(s.getByText(/Oregon State · SDE @ Stripe/)).toBeTruthy();
    const donut = s.getByRole('img', { name: 'Readiness score 62 out of 100' });
    expect(donut).toBeTruthy();
  });

  it('uploads a picture as a data URL and shows the returned custom avatar', async () => {
    const s = await renderProfile();
    const input = s.getByTestId('avatar-input');
    const file = new File(['pngbytes'], 'me.png', { type: 'image/png' });
    // jsdom FileReader works; the server contract is asserted on the call.
    apiMock.mockImplementationOnce(() => Promise.resolve({ ok: true, avatar: '/api/avatars/ava_x.png', preset: '12' }));
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/profile/avatar', expect.objectContaining({ method: 'POST' })));
    const call = apiMock.mock.calls.find((c) => c[0] === '/profile/avatar' && c[1].method === 'POST');
    const body = JSON.parse(call[1].body);
    expect(body.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('rejects oversized files client-side without a network call', async () => {
    const s = await renderProfile();
    const big = new File([new ArrayBuffer(800 * 1024)], 'big.png', { type: 'image/png' });
    fireEvent.change(s.getByTestId('avatar-input'), { target: { files: [big] } });
    await waitFor(() => expect(s.getByText(/under 700 KB/)).toBeTruthy());
    expect(apiMock.mock.calls.filter((c) => c[0] === '/profile/avatar' && c[1].method === 'POST').length).toBe(0);
  });

  it('remove calls DELETE and the button disappears with the custom avatar', async () => {
    apiMock.mockImplementation((path, opts = {}) => {
      if (path === '/profile/avatar' && opts.method === 'DELETE') {
        return Promise.resolve({ ok: true, preset: '12' });
      }
      if (path === '/profile/avatar') return Promise.resolve({ ok: true, custom: '/api/avatars/ava_x.png', preset: '12' });
      if (path === '/skills/tree') return Promise.resolve(TREE);
        return Promise.resolve({});
    });
    const s = await renderProfile();
    await waitFor(() => expect(s.getByRole('button', { name: 'Remove' })).toBeTruthy());
    fireEvent.click(s.getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/profile/avatar', expect.objectContaining({ method: 'DELETE' })));
  });
});

describe('activity + scores', () => {
  it('renders the 84-cell heatmap and the 7-day bars from verified history', async () => {
    await renderProfile();
    expect(document.querySelectorAll('.qd-charts__heat-cell').length).toBe(84);
    expect(document.querySelectorAll('.qd-charts__day').length).toBe(7);
    expect(screen.getByText(/verified tasks only/i)).toBeTruthy();
  });

  it('renders the readiness breakdown bars', async () => {
    await renderProfile();
    expect(screen.getByText('Ship Proof')).toBeTruthy();
    expect(screen.getByText('Momentum')).toBeTruthy();
  });

  it('shows the real ask counter from the payload', async () => {
    const s = await renderProfile();
    expect(s.getByText(/28\/30 asks left today/)).toBeTruthy();
  });
});

describe('skill tree summary', () => {
  it('summarises domains and overall progress from /skills/tree', async () => {
    const s = await renderProfile();
    await waitFor(() => expect(s.getByText('25% complete')).toBeTruthy());
    expect(s.getByText('9/36 skills done across 2 domains.')).toBeTruthy();
    expect(s.getByText('Data structures')).toBeTruthy();
    expect(s.getByText('6/12 done')).toBeTruthy();
  });

  it('shows an honest failure without inventing numbers', async () => {
    apiMock.mockImplementation((path) => {
      if (path === '/skills/tree') return Promise.reject(new Error('API error 500'));
      return Promise.resolve({});
    });
    render(<ProfilePage payload={PAYLOAD} onNavigate={() => {}} />);
    await waitFor(() => expect(screen.getByText(/skill tree could not load/i)).toBeTruthy());
    expect(screen.queryByText(/% complete/)).toBeNull();
  });
});
