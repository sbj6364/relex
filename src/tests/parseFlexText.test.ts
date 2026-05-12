import { describe, expect, it } from 'vitest';
import { parseFlexText } from '../lib/flex/parseFlexText';
import { parseTime } from '../lib/time/parseTime';

describe('parseFlexText', () => {
  it('returns partial data from pasted text', () => {
    const parsed = parseFlexText('잔여 07:40 오늘 09:13 휴게 12:00-13:00');
    expect(parsed.remainingMinutes).toBe(460);
    expect(parsed.todayClockIn).toBe(parseTime('09:13'));
    expect(parsed.todayClockOut).toBeUndefined();
    expect(parsed.confidence).toBe('medium');
    expect(parsed.breaks?.[0]).toEqual({ start: parseTime('12:00'), end: parseTime('13:00') });
  });

  it('parses Korean duration tokens for weekly remaining time', () => {
    const parsed = parseFlexText('잔여 7시간 40분 오늘 09:00');
    expect(parsed.remainingMinutes).toBe(460);
    expect(parsed.todayClockIn).toBe(parseTime('09:00'));
  });

  it('parses minute-only Korean remaining time', () => {
    expect(parseFlexText('남은 40분 오늘 09:00').remainingMinutes).toBe(40);
  });

  it('keeps a real second non-break time as clock-out', () => {
    const parsed = parseFlexText('remaining 07:40 today 09:13 clock-out 18:00 break 12:00-13:00');
    expect(parsed.todayClockIn).toBe(parseTime('09:13'));
    expect(parsed.todayClockOut).toBe(parseTime('18:00'));
    expect(parsed.confidence).toBe('high');
  });

  it('warns when text cannot be parsed', () => {
    expect(parseFlexText('hello').warnings.length).toBeGreaterThan(0);
  });
});
