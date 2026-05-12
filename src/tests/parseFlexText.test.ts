import { describe, expect, it } from 'vitest';
import { parseFlexText } from '../lib/flex/parseFlexText';
import { parseTime } from '../lib/time/parseTime';

describe('parseFlexText', () => {
  it('returns partial data from pasted text', () => {
    const parsed = parseFlexText('잔여 07:40 오늘 09:13 휴게 12:00-13:00');
    expect(parsed.remainingMinutes).toBe(460);
    expect(parsed.todayClockIn).toBe(parseTime('09:13'));
    expect(parsed.breaks?.[0]).toEqual({ start: parseTime('12:00'), end: parseTime('13:00') });
  });
  it('warns when text cannot be parsed', () => {
    expect(parseFlexText('hello').warnings.length).toBeGreaterThan(0);
  });
});
