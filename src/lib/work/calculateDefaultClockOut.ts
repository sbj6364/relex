import type { Minutes, TimeRange, WorkRules } from '../../types/work';
import { findEarliestClockOut } from './findEarliestClockOut';

const standardWorkMinutes = 8 * 60;

export function calculateDefaultClockOut(params: { clockIn: Minutes; breaks: TimeRange[]; rules: WorkRules; targetWorkMinutes?: number }): Minutes {
  const targetWorkMinutes = params.targetWorkMinutes ?? standardWorkMinutes;
  return findEarliestClockOut({
    clockIn: params.clockIn,
    requiredWorkMinutes: targetWorkMinutes,
    breaks: params.breaks,
    minClockOut: params.clockIn,
    maxClockOut: params.rules.workWindow.end,
  }) ?? params.clockIn + targetWorkMinutes;
}
