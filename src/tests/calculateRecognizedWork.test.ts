import { describe, expect, it } from 'vitest';
import { calculateRecognizedWork } from '../lib/work/calculateRecognizedWork';
import { parseTime } from '../lib/time/parseTime';

const t = parseTime;
const lunch = { start: t('12:00'), end: t('13:00') };

describe('calculateRecognizedWork', () => {
  it('subtracts a fully overlapping lunch break', () => {
    expect(calculateRecognizedWork({ clockIn: t('09:00'), clockOut: t('18:00'), breaks: [lunch] })).toBe(480);
  });
  it('ignores a non-overlapping lunch break', () => {
    expect(calculateRecognizedWork({ clockIn: t('13:30'), clockOut: t('18:00'), breaks: [lunch] })).toBe(270);
  });
  it('subtracts only the overlapping part of a break', () => {
    expect(calculateRecognizedWork({ clockIn: t('09:00'), clockOut: t('12:30'), breaks: [lunch] })).toBe(180);
  });
  it('handles multiple breaks', () => {
    expect(calculateRecognizedWork({ clockIn: t('09:00'), clockOut: t('18:00'), breaks: [lunch, { start: t('15:00'), end: t('15:15') }] })).toBe(465);
  });
  it('does not double-count overlapping breaks', () => {
    expect(calculateRecognizedWork({ clockIn: t('09:00'), clockOut: t('18:00'), breaks: [lunch, { start: t('12:30'), end: t('13:30') }] })).toBe(450);
  });
});
