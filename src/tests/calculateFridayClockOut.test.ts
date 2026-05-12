import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateFridayClockOut } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;
const noBreak = 0;
const lunch = 60;

describe('calculateFridayClockOut', () => {
  it('uses editable plans from Tuesday through Thursday to estimate Friday clock-out', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('09:00'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('friday');
    expect(plan.plannedDayCount).toBe(3);
    expect(plan.plannedBeforeFridayMinutes).toBe(24 * 60);
    expect(plan.targetRequiredMinutes).toBe(8 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('18:24'));
  });

  it('defaults to zero break minutes when plans say so', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      todayBreakMinutes: noBreak,
      fridayClockIn: t('09:00'),
      fridayBreakMinutes: noBreak,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: noBreak },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: noBreak },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: noBreak },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(27 * 60);
    expect(plan.targetRequiredMinutes).toBe(5 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('16:00'));
  });

  it('reflects edited remaining day clock-out times', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 3,
      weeklyRemainingMinutes: 24 * 60,
      todayClockIn: t('09:00'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('09:00'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [
        { weekday: 3, clockIn: t('09:00'), clockOut: t('17:00'), breakMinutes: lunch },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(15 * 60);
    expect(plan.targetRequiredMinutes).toBe(9 * 60);
    expect(plan.earliestClockOut).toBe(t('19:00'));
  });

  it('does not double-count duplicate weekday plans', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:54'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('09:55'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:54'), clockOut: t('17:54'), breakMinutes: lunch },
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedDayCount).toBe(3);
    expect(plan.plannedBeforeFridayMinutes).toBe(23 * 60);
    expect(plan.targetRequiredMinutes).toBe(9 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('20:19'));
  });

  it('keeps Friday core time and reports excess when plans finish the remaining work early', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 20 * 60,
      todayClockIn: t('09:00'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('09:00'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), breakMinutes: lunch },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(24 * 60);
    expect(plan.targetRequiredMinutes).toBe(0);
    expect(plan.excessBeforeFridayMinutes).toBe(4 * 60);
    expect(plan.projectedExcessMinutes).toBe(10 * 60);
    expect(plan.earliestClockOut).toBe(t('16:00'));
  });

  it('reports projected excess when Friday core time requires more work than Friday needs', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:54'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('07:55'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:54'), clockOut: t('18:54'), breakMinutes: lunch },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('20:00'), breakMinutes: lunch },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('20:00'), breakMinutes: lunch },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(28 * 60);
    expect(plan.targetRequiredMinutes).toBe(4 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('16:00'));
    expect(plan.projectedExcessMinutes).toBe(2 * 60 + 41);
  });

  it('keeps same-day calculation on Friday', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 5,
      weeklyRemainingMinutes: 8 * 60,
      todayClockIn: t('09:00'),
      todayBreakMinutes: lunch,
      fridayClockIn: t('09:00'),
      fridayBreakMinutes: lunch,
      plannedWorkdaysBeforeFriday: [],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('today');
    expect(plan.plannedDayCount).toBe(0);
    expect(plan.earliestClockOut).toBe(t('18:00'));
  });
});
