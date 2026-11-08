import { describe, it, expect } from 'vitest';
import {
  greetingFor,
  taskDayKey,
  computeStreak,
  heatmapCells,
  heatmapSummary,
  compactNumber,
  shortName,
  driveCountdown,
  tasksSection,
  askUsage,
} from '../src/components/dashboard/homeData.js';

describe('greetingFor (by local hour, spec: good morning/afternoon/evening)', () => {
  it('greets by time of day', () => {
    expect(greetingFor(7, 'Dana')).toBe('Good morning, Dana');
    expect(greetingFor(13, 'Dana')).toBe('Good afternoon, Dana');
    expect(greetingFor(21, 'Dana')).toBe('Good evening, Dana');
  });
  it('handles the pre-dawn window and missing names without breaking', () => {
    expect(greetingFor(2, 'Dana')).toBe('Up late, Dana?');
    expect(greetingFor(15, '')).toBe('Good afternoon, there');
  });
});

describe('taskDayKey (4 am IST task-day rollover)', () => {
  // IST = UTC+5:30. 03:59 IST on the 10th still belongs to the 9th task day.
  it('assigns 03:59 IST to the previous calendar day', () => {
    const at = new Date('2026-03-10T03:59:00+05:30');
    expect(taskDayKey(at)).toBe('2026-03-09');
  });
  it('assigns 04:00 IST to the new day', () => {
    const at = new Date('2026-03-10T04:00:00+05:30');
    expect(taskDayKey(at)).toBe('2026-03-10');
  });
  it('assigns late evening IST to the same day', () => {
    const at = new Date('2026-03-10T23:30:00+05:30');
    expect(taskDayKey(at)).toBe('2026-03-10');
  });
});

describe('computeStreak (a day counts only with ≥1 verified task; 4 am IST roll)', () => {
  const days = (arr) => Object.fromEntries(arr.map((k) => [k, ['ship']]));

  it('counts consecutive days ending today', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const s = computeStreak(days(['2026-03-08', '2026-03-09', '2026-03-10']), now);
    expect(s).toBe(3);
  });
  it('does not break the chain when today is still empty', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const s = computeStreak(days(['2026-03-08', '2026-03-09']), now);
    expect(s).toBe(2);
  });
  it('breaks on a gap', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const s = computeStreak(days(['2026-03-06', '2026-03-07']), now);
    expect(s).toBe(0);
  });
  it('respects the 4 am roll: 03:59 IST counts as the previous task day', () => {
    // history keyed by the task-day the tasks belonged to (2026-03-09); at
    // 03:59 IST on the 10th we are still inside the 9th task day.
    const now = new Date('2026-03-10T03:59:00+05:30');
    const s = computeStreak(days(['2026-03-08', '2026-03-09']), now);
    expect(s).toBe(2);
  });
  it('treats empty day entries as real gaps (spec: verified tasks only)', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const s = computeStreak({ '2026-03-09': [], '2026-03-08': ['ship'] }, now);
    expect(s).toBe(0);
  });
});

describe('heatmap (12 weeks, verified days only)', () => {
  it('returns exactly 84 cells with levels from real counts', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const hist = { '2026-03-10': ['a', 'b', 'c'], '2026-03-09': ['a'] };
    const cells = heatmapCells(hist, now);
    expect(cells).toHaveLength(84);
    expect(cells[83]).toMatchObject({ count: 3, level: 3 });
    expect(cells[82]).toMatchObject({ count: 1, level: 1 });
    expect(cells[0].count).toBe(0);
  });
  it('summarises the longest run and totals', () => {
    const now = new Date('2026-03-10T10:00:00+05:30');
    const hist = { '2026-03-10': ['a'], '2026-03-09': ['a'], '2026-03-08': ['a'] };
    const summary = heatmapSummary(heatmapCells(hist, now));
    expect(summary).toContain('Longest run: 3 days');
    expect(summary).toContain('3 logged tasks');
  });
  it('summarises an empty history honestly', () => {
    expect(heatmapSummary(heatmapCells({}, new Date()))).toContain('No logged days');
  });
});

describe('number and name guards', () => {
  it('compacts large numbers and passes small ones through', () => {
    expect(compactNumber(12400)).toBe('12.4k');
    expect(compactNumber(9999)).toBe('9999');
    expect(compactNumber(null)).toBe('—');
  });
  it('truncates long names with an ellipsis', () => {
    const long = 'Bapuji Institute of Engineering and Technology';
    expect(shortName(long, 18).endsWith('…')).toBe(true);
    expect(shortName('IIT Madras', 18)).toBe('IIT Madras');
  });
});

describe('drive banner gating (only within 48 h)', () => {
  it('returns null when no drive or far future drive', () => {
    const now = new Date('2026-03-10T10:00:00Z');
    expect(driveCountdown(null, now)).toBeNull();
    expect(driveCountdown('2026-03-15T10:00:00Z', now)).toBeNull();
  });
  it('counts down inside the 48 h window', () => {
    const now = new Date('2026-03-10T10:00:00Z');
    expect(driveCountdown('2026-03-11T12:30:00Z', now)).toBe('starts in 26h 30m');
  });
});

describe('task section (real payload only)', () => {
  it('maps server missions and never invents minutes', () => {
    const res = tasksSection({
      missions: [{ id: '2026-03-10:ship:0', category: 'ship', title: 'Ship a commit', detail: 'x', done: false }],
    });
    expect(res.status).toBe('ok');
    expect(res.data[0].minutes).toBeNull();
    expect(res.data[0].done).toBe(false);
  });
  it('reports empty for a payload without missions', () => {
    expect(tasksSection({}).status).toBe('empty');
  });
});

describe('ask usage (real counters only)', () => {
  it('derives remaining asks from the payload', () => {
    expect(askUsage({ asksToday: 7, askCap: 30 })).toEqual({ used: 7, cap: 30, left: 23 });
    expect(askUsage({}).left).toBe(0);
  });
});
