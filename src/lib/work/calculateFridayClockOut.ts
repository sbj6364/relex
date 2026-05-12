import type { Minutes, TimeRange, WorkRules } from '../../types/work';
import { calculateRecognizedWork } from './calculateRecognizedWork';
import { findEarliestClockOut } from './findEarliestClockOut';

const friday = 5;

export type PlannedWorkday = {
  weekday: number;
  clockIn: Minutes;
  clockOut: Minutes;
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

export function calculateFridayClockOut(params: {
  todayWeekday: number;
  weeklyRemainingMinutes: number;
  todayClockIn: Minutes;
  fridayClockIn: Minutes;
  plannedWorkdaysBeforeFriday: PlannedWorkday[];
  breaks: TimeRange[];
  rules: WorkRules;
}): FridayClockOutPlan {
  const mode = params.todayWeekday >= 1 && params.todayWeekday < friday ? 'friday' : 'today';
  if (mode === 'today') {
    const earliestClockOut = findEarliestClockOut({
      clockIn: params.todayClockIn,
      requiredWorkMinutes: params.weeklyRemainingMinutes,
      breaks: params.breaks,
      minClockOut: params.rules.coreTime.end,
      maxClockOut: params.rules.workWindow.end,
    });
    const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : calculateRecognizedWork({ clockIn: params.todayClockIn, clockOut: earliestClockOut, breaks: params.breaks });
    const projectedExcessMinutes = Math.max(0, projectedClockOutWorkMinutes - params.weeklyRemainingMinutes);
    return { mode, targetWeekday: params.todayWeekday, targetRequiredMinutes: params.weeklyRemainingMinutes, plannedDayCount: 0, plannedBeforeFridayMinutes: 0, excessBeforeFridayMinutes: 0, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
  }

  const uniquePlannedWorkdays = new Map<number, PlannedWorkday>();
  for (const day of params.plannedWorkdaysBeforeFriday) {
    if (!uniquePlannedWorkdays.has(day.weekday)) uniquePlannedWorkdays.set(day.weekday, day);
  }
  const relevantPlannedWorkdays = [...uniquePlannedWorkdays.values()].filter((day) => day.weekday >= params.todayWeekday && day.weekday < friday);
  const plannedBeforeFridayMinutes = relevantPlannedWorkdays.reduce((total, day) => total + calculateRecognizedWork({ clockIn: day.clockIn, clockOut: day.clockOut, breaks: params.breaks }), 0);
  const targetRequiredMinutes = Math.max(0, params.weeklyRemainingMinutes - plannedBeforeFridayMinutes);
  const excessBeforeFridayMinutes = Math.max(0, plannedBeforeFridayMinutes - params.weeklyRemainingMinutes);
  const earliestClockOut = findEarliestClockOut({
    clockIn: params.fridayClockIn,
    requiredWorkMinutes: targetRequiredMinutes,
    breaks: params.breaks,
    minClockOut: params.rules.coreTime.end,
    maxClockOut: params.rules.workWindow.end,
  });

  const projectedClockOutWorkMinutes = earliestClockOut == null ? 0 : calculateRecognizedWork({ clockIn: params.fridayClockIn, clockOut: earliestClockOut, breaks: params.breaks });
  const projectedExcessMinutes = Math.max(0, excessBeforeFridayMinutes + projectedClockOutWorkMinutes - targetRequiredMinutes);

  return { mode, targetWeekday: friday, targetRequiredMinutes, plannedDayCount: relevantPlannedWorkdays.length, plannedBeforeFridayMinutes, excessBeforeFridayMinutes, projectedClockOutWorkMinutes, projectedExcessMinutes, earliestClockOut };
}
