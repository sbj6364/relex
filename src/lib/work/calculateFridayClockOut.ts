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
    return { mode, targetWeekday: params.todayWeekday, targetRequiredMinutes: params.weeklyRemainingMinutes, plannedDayCount: 0, plannedBeforeFridayMinutes: 0, earliestClockOut };
  }

  const relevantPlannedWorkdays = params.plannedWorkdaysBeforeFriday.filter((day) => day.weekday >= params.todayWeekday && day.weekday < friday);
  const plannedBeforeFridayMinutes = relevantPlannedWorkdays.reduce((total, day) => total + calculateRecognizedWork({ clockIn: day.clockIn, clockOut: day.clockOut, breaks: params.breaks }), 0);
  const targetRequiredMinutes = Math.max(0, params.weeklyRemainingMinutes - plannedBeforeFridayMinutes);
  const earliestClockOut = findEarliestClockOut({
    clockIn: params.fridayClockIn,
    requiredWorkMinutes: targetRequiredMinutes,
    breaks: params.breaks,
    minClockOut: params.rules.coreTime.end,
    maxClockOut: params.rules.workWindow.end,
  });

  return { mode, targetWeekday: friday, targetRequiredMinutes, plannedDayCount: relevantPlannedWorkdays.length, plannedBeforeFridayMinutes, earliestClockOut };
}
