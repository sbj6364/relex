import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateFridayClockOut } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;
const lunch = { start: t('12:00'), end: t('13:00') };

describe('calculateFridayClockOut', () => {
  it('uses 8h defaults from Tuesday through Thursday to estimate Friday clock-out', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      todayCurrentTime: t('10:00'),
      fridayClockIn: t('09:00'),
      breaks: [lunch],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('friday');
    expect(plan.assumedStandardDays).toBe(3);
    expect(plan.targetRequiredMinutes).toBe(8 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('18:24'));
  });

  it('keeps same-day calculation on Friday', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 5,
      weeklyRemainingMinutes: 8 * 60,
      todayClockIn: t('09:00'),
      todayCurrentTime: t('10:00'),
      fridayClockIn: t('09:00'),
      breaks: [lunch],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('today');
    expect(plan.assumedStandardDays).toBe(0);
    expect(plan.earliestClockOut).toBe(t('18:00'));
  });
});
