import { describe, expect, it } from 'vitest';
import { parseTime } from '../lib/time/parseTime';
import { calculateFridayClockOut, getRecognizedMinutesWithStop } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';

const t = parseTime;
const noStop = 0;
const stop30 = 30;

describe('calculateFridayClockOut', () => {
  it('pauses recognized work while the configured lunch break is in progress', () => {
    const params = { clockIn: t('10:00'), stopMinutes: noStop, breaks: [defaultWorkRules.defaultBreak] };

    expect(getRecognizedMinutesWithStop({ ...params, clockOut: t('11:59') })).toBe(119);
    expect(getRecognizedMinutesWithStop({ ...params, clockOut: t('12:00') })).toBe(120);
    expect(getRecognizedMinutesWithStop({ ...params, clockOut: t('12:30') })).toBe(120);
    expect(getRecognizedMinutesWithStop({ ...params, clockOut: t('13:00') })).toBe(120);
    expect(getRecognizedMinutesWithStop({ ...params, clockOut: t('13:01') })).toBe(121);
  });

  it('uses the configured lunch break for same-day Friday remaining work', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 5,
      weeklyRemainingMinutes: 8 * 60 + 18,
      todayClockIn: t('10:00'),
      todayStopMinutes: noStop,
      fridayClockIn: t('10:00'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [],
      rules: defaultWorkRules,
    });

    expect(plan.earliestClockOut).toBe(t('19:18'));
    expect(plan.projectedClockOutWorkMinutes).toBe(8 * 60 + 18);
  });

  it('uses editable plans from Tuesday through Thursday to estimate Friday clock-out', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      todayStopMinutes: noStop,
      fridayClockIn: t('09:00'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('friday');
    expect(plan.plannedDayCount).toBe(3);
    expect(plan.plannedBeforeFridayMinutes).toBe(24 * 60);
    expect(plan.targetRequiredMinutes).toBe(8 * 60 + 24);
    expect(plan.earliestClockOut).toBe(t('18:24'));
  });

  it('adds 업무정지 minutes on top of configured lunch breaks', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 2,
      weeklyRemainingMinutes: 32 * 60 + 24,
      todayClockIn: t('09:00'),
      todayStopMinutes: stop30,
      fridayClockIn: t('09:00'),
      fridayStopMinutes: stop30,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: stop30 },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: stop30 },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: stop30 },
      ],
      rules: defaultWorkRules,
    });

    expect(plan.plannedBeforeFridayMinutes).toBe(22 * 60 + 30);
    expect(plan.targetRequiredMinutes).toBe(9 * 60 + 54);
    expect(plan.earliestClockOut).toBe(t('20:24'));
  });

  it('reflects edited remaining day clock-out times', () => {
    const plan = calculateFridayClockOut({
      todayWeekday: 3,
      weeklyRemainingMinutes: 24 * 60,
      todayClockIn: t('09:00'),
      todayStopMinutes: noStop,
      fridayClockIn: t('09:00'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [
        { weekday: 3, clockIn: t('09:00'), clockOut: t('17:00'), stopMinutes: noStop },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
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
      todayStopMinutes: noStop,
      fridayClockIn: t('09:55'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:54'), clockOut: t('17:54'), stopMinutes: noStop },
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
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
      todayStopMinutes: noStop,
      fridayClockIn: t('09:00'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('18:00'), stopMinutes: noStop },
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
      todayStopMinutes: noStop,
      fridayClockIn: t('07:55'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [
        { weekday: 2, clockIn: t('09:54'), clockOut: t('18:54'), stopMinutes: noStop },
        { weekday: 3, clockIn: t('09:00'), clockOut: t('20:00'), stopMinutes: noStop },
        { weekday: 4, clockIn: t('09:00'), clockOut: t('20:00'), stopMinutes: noStop },
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
      todayStopMinutes: noStop,
      fridayClockIn: t('09:00'),
      fridayStopMinutes: noStop,
      plannedWorkdaysBeforeFriday: [],
      rules: defaultWorkRules,
    });

    expect(plan.mode).toBe('today');
    expect(plan.plannedDayCount).toBe(0);
    expect(plan.earliestClockOut).toBe(t('18:00'));
  });
});
