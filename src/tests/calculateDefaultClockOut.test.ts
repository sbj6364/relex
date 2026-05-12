import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateDefaultClockOut } from '../lib/work/calculateDefaultClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;
const lunch = { start: t('12:00'), end: t('13:00') };

describe('calculateDefaultClockOut', () => {
  it('adds lunch break time when filling an 8h default clock-out', () => {
    expect(calculateDefaultClockOut({ clockIn: t('09:54'), breaks: [lunch], rules: defaultWorkRules })).toBe(t('18:54'));
  });

  it('does not add lunch when the shift starts after lunch', () => {
    expect(calculateDefaultClockOut({ clockIn: t('13:00'), breaks: [lunch], rules: defaultWorkRules })).toBe(t('21:00'));
  });
});
