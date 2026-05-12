import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateFridayClockOut } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;
const lunch = { start: t('12:00'), end: t('13:00') };

describe('calculateFridayClockOut', () => {
  it('uses editable plans from Tuesday through Thursday to estimate Friday clock-out', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      fridayClockIn: t('09:00'),
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00') },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00') },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00') },
      ],
      breaks: [lunch],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('friday');
    expect(plan.plannedDayCount).toBe(3);
    expect(plan.plannedBeforeFridayMinutes).toBe(24 * 60);
    expect(plan.targetRequiredMinutes).toBe(8 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('18:24'));
  });

  it('reflects edited remaining day clock-out times', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 3,
      weeklyRemainingMinutes: 24 * 60,
      todayClockIn: t('09:00'),
      fridayClockIn: t('09:00'),
      plannedWorkdaysBeforeFriday: [
        { weekday: 3, clockIn: t('09:00'), clockOut: t('17:00') },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00') },
      ],
      breaks: [lunch],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(15 * 60);
    expect(plan.targetRequiredMinutes).toBe(9 * 60);
    expect(plan.earliestClockOut).toBe(t('19:00'));
  });

  it('keeps same-day calculation on Friday', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 5,
      weeklyRemainingMinutes: 8 * 60,
      todayClockIn: t('09:00'),
      fridayClockIn: t('09:00'),
      plannedWorkdaysBeforeFriday: [],
      breaks: [lunch],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('today');
    expect(plan.plannedDayCount).toBe(0);
    expect(plan.earliestClockOut).toBe(t('18:00'));
  });
});
