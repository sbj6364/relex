import type { DayPlan, RecommendedDayPlan } from '../../types/work';
import { calculateRecognizedWork } from './calculateRecognizedWork';

export function distributeRemainingWork(params: { days: DayPlan[]; remainingMinutes: number }): RecommendedDayPlan[] {
  const workdays = params.days.filter((day) => day.isWorkday);
  const perDay = workdays.length === 0 ? 0 : Math.ceil(params.remainingMinutes / workdays.length);
  return params.days.map((day) => ({
    ...day,
    targetWorkMinutes: day.isWorkday ? perDay : 0,
    recommendedClockOut: day.clockIn == null || !day.isWorkday ? undefined : day.clockIn + perDay,
  }));
}

export function getWeeklyRecognizedMinutes(days: DayPlan[]): number {
  return days.reduce((total, day) => total + (day.clockIn != null && day.clockOut != null ? calculateRecognizedWork({ clockIn: day.clockIn, clockOut: day.clockOut, breaks: day.breaks }) : 0), 0);
}
