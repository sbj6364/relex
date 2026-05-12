import type { Minutes, WorkRules } from '../../types/work';

const friday = 5;

export type PlannedWorkday = {
  weekday: number;
  clockIn: Minutes;
  clockOut: Minutes;
  stopMinutes: number;
};

export type FridayClockOutPlan = {
  mode: 'today' | 'friday';
  targetWeekday: number;
  targetRequiredMinutes: number;
  plannedDayCount: number;
  plannedBeforeFridayMinutes: number;
  excessBeforeFridayMinutes: number;
  projectedClockOutWorkMinutes: number;
  projectedExcessMinutes: number;
  earliestClockOut: Minutes | null;
};

export function getStatutoryBreakMinutes(elapsedMinutes: number): number {
  if (elapsedMinutes >= 8 * 60) return 60;
  if (elapsedMinutes >= 4 * 60) return 30;
  return 0;
}

export function getRecognizedMinutesWithStop(params: { clockIn: Minutes; clockOut: Minutes; stopMinutes: number }): number {
  const elapsedMinutes = Math.max(0, params.clockOut - params.clockIn);
  return Math.max(0, elapsedMinutes - getStatutoryBreakMinutes(elapsedMinutes) - Math.max(0, params.stopMinutes));
}

function findEarliestClockOutWithStop(params: { clockIn: Minutes; requiredWorkMinutes: number; stopMinutes: number; minClockOut: Minutes; maxClockOut: Minutes }): Minutes | null {
  const start = Math.max(params.clockIn, params.minClockOut);
  for (let clockOut = start; clockOut <= params.maxClockOut; clockOut += 1) {
    if (getRecognizedMinutesWithStop({ clockIn: params.clockIn, clockOut, stopMinutes: params.stopMinutes }) >= params.requiredWorkMinutes) return clockOut;
  }
  return null;
}

export function calculateFridayClockOut(params: {
  todayWeekday: number;
  weeklyRemainingMinutes: number;
  todayClockIn: Minutes;
  todayStopMinutes: number;
  fridayClockIn: Minutes;
  fridayStopMinutes: number;
  plannedWorkdaysBeforeFriday: PlannedWorkday[];
  rules: WorkRules;
}): FridayClockOutPlan {
  const mode = params.todayWeekday >= 1 && params.todayWeekday < friday ? 'friday' : 'today';
  if (mode === 'today') {
    const earliestClockOut = findEarliestClockOutWithStop({
      clockIn: params.todayClockIn,
      requiredWorkMinutes: params.weeklyRemainingMinutes,
      stopMinutes: params.todayStopMinutes,
      minClockOut: params.rules.coreTime.end,
      maxClockOut: params.rules.workWindow.end,
    });
    const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : getRecognizedMinutesWithStop({ clockIn: params.todayClockIn, clockOut: earliestClockOut, stopMinutes: params.todayStopMinutes });
    const projectedExcessMinutes = Math.max(0, projectedClockOutWorkMinutes - params.weeklyRemainingMinutes);
    return { mode, targetWeekday: params.todayWeekday, targetRequiredMinutes: params.weeklyRemainingMinutes, plannedDayCount: 0, plannedBeforeFridayMinutes: 0, excessBeforeFridayMinutes: 0, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
  }

  const uniquePlannedWorkdays = new Map<number, PlannedWorkday>();
  for (const day of params.plannedWorkdaysBeforeFriday) {
    if (!uniquePlannedWorkdays.has(day.weekday)) uniquePlannedWorkdays.set(day.weekday, day);
  }
  const relevantPlannedWorkdays = [...uniquePlannedWorkdays.values()].filter((day) => day.weekday >= params.todayWeekday && day.weekday < friday);
  const plannedBeforeFridayMinutes = relevantPlannedWorkdays.reduce((total, day) => total + getRecognizedMinutesWithStop(day), 0);
  const targetRequiredMinutes = Math.max(0, params.weeklyRemainingMinutes - plannedBeforeFridayMinutes);
  const excessBeforeFridayMinutes = Math.max(0, plannedBeforeFridayMinutes - params.weeklyRemainingMinutes);
  const earliestClockOut = findEarliestClockOutWithStop({
    clockIn: params.fridayClockIn,
    requiredWorkMinutes: targetRequiredMinutes,
    stopMinutes: params.fridayStopMinutes,
    minClockOut: params.rules.coreTime.end,
    maxClockOut: params.rules.workWindow.end,
  });

  const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : getRecognizedMinutesWithStop({ clockIn: params.fridayClockIn, clockOut: earliestClockOut, stopMinutes: params.fridayStopMinutes });
  const projectedExcessMinutes = Math.max(0, excessBeforeFridayMinutes + projectedClockOutWorkMinutes - targetRequiredMinutes);

  return { mode, targetWeekday: friday, targetRequiredMinutes, plannedDayCount: relevantPlannedWorkdays.length, plannedBeforeFridayMinutes, excessBeforeFridayMinutes, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
}
