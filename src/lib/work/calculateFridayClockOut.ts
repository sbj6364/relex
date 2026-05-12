import type { Minutes, TimeRange, WorkRules } from '../../types/work';
import { calculateRecognizedWork } from './calculateRecognizedWork';
import { findEarliestClockOut } from './findEarliestClockOut';

const friday = 5;
const minutesPerStandardDay = 8 * 60;

export type FridayClockOutPlan = {
  mode: 'today' | 'friday';
  targetWeekday: number;
  targetRequiredMinutes: number;
  assumedStandardDays: number;
  earliestClockOut: Minutes | null;
};

export function calculateFridayClockOut(params: {
  todayWeekday: number;
  weeklyRemainingMinutes: number;
  todayClockIn: Minutes;
  todayCurrentTime: Minutes;
  fridayClockIn: Minutes;
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
    return { mode, targetWeekday: params.todayWeekday, targetRequiredMinutes: params.weeklyRemainingMinutes, assumedStandardDays: 0, earliestClockOut };
  }

  const futureStandardDaysUntilThursday = Math.max(0, friday - params.todayWeekday - 1);
  const assumedStandardDays = 1 + futureStandardDaysUntilThursday;
  const targetRequiredMinutes = Math.max(0, params.weeklyRemainingMinutes - assumedStandardDays * minutesPerStandardDay);
  const earliestClockOut = findEarliestClockOut({
    clockIn: params.fridayClockIn,
    requiredWorkMinutes: targetRequiredMinutes,
    breaks: params.breaks,
    minClockOut: params.rules.coreTime.end,
    maxClockOut: params.rules.workWindow.end,
  });

  return { mode, targetWeekday: friday, targetRequiredMinutes, assumedStandardDays, earliestClockOut };
}

export function calculateRealtimeRemaining(params: { weeklyRemainingMinutes: number; clockIn: Minutes; currentTime: Minutes; breaks: TimeRange[] }): number {
  const effectiveNow = Math.max(params.clockIn, params.currentTime);
  const recognizedSoFar = calculateRecognizedWork({ clockIn: params.clockIn, clockOut: effectiveNow, breaks: params.breaks });
  return params.weeklyRemainingMinutes - recognizedSoFar;
}
