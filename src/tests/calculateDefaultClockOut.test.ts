import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateDefaultClockOut } from '../lib/work/calculateDefaultClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;

describe('calculateDefaultClockOut', () => {
  it('includes statutory meal break with zero 업무정지 minutes', () => {
    expect(calculateDefaultClockOut({ clockIn: t('09:54'), stopMinutes: 0, rules: defaultWorkRules })).toBe(t('18:54'));
  });

  it('adds entered 업무정지 minutes on top of statutory break', () => {
    expect(calculateDefaultClockOut({ clockIn: t('09:54'), stopMinutes: 30, rules: defaultWorkRules })).toBe(t('19:24'));
  });
});
