import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { validateTimeEntry } from '../lib/work/validateTimeEntry';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;

describe('validateTimeEntry', () => {
  it('allows normal clock-in and clock-out ranges', () => {
    expect(validateTimeEntry({ role: 'clockIn', time: t('09:30'), rules: defaultWorkRules }).isValid).toBe(true);
    expect(validateTimeEntry({ role: 'clockOut', time: t('18:00'), rules: defaultWorkRules }).isValid).toBe(true);
  });

  it('rejects times outside the recordable work window', () => {
    expect(validateTimeEntry({ role: 'clockIn', time: t('06:59'), rules: defaultWorkRules }).reason).toContain('07:00-22:00');
    expect(validateTimeEntry({ role: 'clockOut', time: t('22:01'), rules: defaultWorkRules }).reason).toContain('07:00-22:00');
  });

  it('reports 30-minute leave-unit guidance for core-time clock-in and clock-out', () => {
    expect(validateTimeEntry({ role: 'clockIn', time: t('11:10'), rules: defaultWorkRules }).reason).toContain('1h 30m');
    expect(validateTimeEntry({ role: 'clockOut', time: t('15:40'), rules: defaultWorkRules }).reason).toContain('0h 30m');
  });
});
