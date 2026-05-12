import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateDefaultClockOut } from '../lib/work/calculateDefaultClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;

describe('calculateDefaultClockOut', () => {
  it('uses zero break minutes by default for an 8h clock-out', () => {
    expect(calculateDefaultClockOut({ clockIn: t('09:54'), breakMinutes: 0, rules: defaultWorkRules })).toBe(t('17:54'));
  });

  it('adds entered break minutes when filling an 8h default clock-out', () => {
    expect(calculateDefaultClockOut({ clockIn: t('09:54'), breakMinutes: 60, rules: defaultWorkRules })).toBe(t('18:54'));
  });
});
