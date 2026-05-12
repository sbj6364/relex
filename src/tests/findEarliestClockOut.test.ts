import { describe, expect, it } from 'vitest';
import { findEarliestClockOut } from '../lib/work/findEarliestClockOut';
import { parseTime } from '../lib/time/parseTime';

const t = parseTime;
const lunch = { start: t('12:00'), end: t('13:00') };

describe('findEarliestClockOut', () => {
  it('finds 18:00 for an 8h required day with lunch', () => {
    expect(findEarliestClockOut({ clockIn: t('09:00'), requiredWorkMinutes: 480, breaks: [lunch], minClockOut: t('16:00'), maxClockOut: t('22:00') })).toBe(t('18:00'));
  });
  it('respects core time end as the minimum clock-out', () => {
    expect(findEarliestClockOut({ clockIn: t('10:00'), requiredWorkMinutes: 300, breaks: [lunch], minClockOut: t('16:00'), maxClockOut: t('22:00') })).toBe(t('16:00'));
  });
  it('returns null when impossible before the work window ends', () => {
    expect(findEarliestClockOut({ clockIn: t('10:00'), requiredWorkMinutes: 800, breaks: [lunch], minClockOut: t('16:00'), maxClockOut: t('22:00') })).toBeNull();
  });
});
