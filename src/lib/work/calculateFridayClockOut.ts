import type { Minutes, WorkRules } from '../../types/work';

const friday = 5;

export type PlannedWorkday = {
  weekday: number;
  clockIn: Minutes;
  clockOut: Minutes;
  breakMinutes: number;
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

export function getRecognizedMinutesWithBreak(params: { clockIn: Minutes; clockOut: Minutes; breakMinutes: number }): number {
  return Math.max(0, params.clockOut - params.clockIn - Math.max(0, params.breakMinutes));
}

function findEarliestClockOutWithBreak(params: { clockIn: Minutes; requiredWorkMinutes: number; breakMinutes: number; minClockOut: Minutes; maxClockOut: Minutes }): Minutes | null {
  const clockOut = Math.max(params.clockIn, params.minClockOut, params.clockIn + params.requiredWorkMinutes + Math.max(0, params.breakMinutes));
  return clockOut <= params.maxClockOut ? clockOut : null;
}

export function calculateFridayClockOut(params: {
  todayWeekday: number;
  weeklyRemainingMinutes: number;
  todayClockIn: Minutes;
  todayBreakMinutes: number;
  fridayClockIn: Minutes;
  fridayBreakMinutes: number;
  plannedWorkdaysBeforeFriday: PlannedWorkday[];
  rules: WorkRules;
}): FridayClockOutPlan {
  const mode = params.todayWeekday >= 1 && params.todayWeekday < friday ? 'friday' : 'today';
  if (mode === 'today') {
    const earliestClockOut = findEarliestClockOutWithBreak({
      clockIn: params.todayClockIn,
      requiredWorkMinutes: params.weeklyRemainingMinutes,
      breakMinutes: params.todayBreakMinutes,
      minClockOut: params.rules.coreTime.end,
      maxClockOut: params.rules.workWindow.end,
    });
    const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : getRecognizedMinutesWithBreak({ clockIn: params.todayClockIn, clockOut: earliestClockOut, breakMinutes: params.todayBreakMinutes });
    const projectedExcessMinutes = Math.max(0, projectedClockOutWorkMinutes - params.weeklyRemainingMinutes);
    return { mode, targetWeekday: params.todayWeekday, targetRequiredMinutes: params.weeklyRemainingMinutes, plannedDayCount: 0, plannedBeforeFridayMinutes: 0, excessBeforeFridayMinutes: 0, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
  }

  const uniquePlannedWorkdays = new Map<number, PlannedWorkday>();
  for (const day of params.plannedWorkdaysBeforeFriday) {
    if (!uniquePlannedWorkdays.has(day.weekday)) uniquePlannedWorkdays.set(day.weekday, day);
  }
  const relevantPlannedWorkdays = [...uniquePlannedWorkdays.values()].filter((day) => day.weekday >= params.todayWeekday && day.weekday < friday);
  const plannedBeforeFridayMinutes = relevantPlannedWorkdays.reduce((total, day) => total + getRecognizedMinutesWithBreak(day), 0);
  const targetRequiredMinutes = Math.max(0, params.weeklyRemainingMinutes - plannedBeforeFridayMinutes);
  const excessBeforeFridayMinutes = Math.max(0, plannedBeforeFridayMinutes - params.weeklyRemainingMinutes);
  const earliestClockOut = findEarliestClockOutWithBreak({
    clockIn: params.fridayClockIn,
    requiredWorkMinutes: targetRequiredMinutes,
    breakMinutes: params.fridayBreakMinutes,
    minClockOut: params.rules.coreTime.end,
    maxClockOut: params.rules.workWindow.end,
  });

  const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : getRecognizedMinutesWithBreak({ clockIn: params.fridayClockIn, clockOut: earliestClockOut, breakMinutes: params.fridayBreakMinutes });
  const projectedExcessMinutes = Math.max(0, excessBeforeFridayMinutes + projectedClockOutWorkMinutes - targetRequiredMinutes);

  return { mode, targetWeekday: friday, targetRequiredMinutes, plannedDayCount: relevantPlannedWorkdays.length, plannedBeforeFridayMinutes, excessBeforeFridayMinutes, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
}
