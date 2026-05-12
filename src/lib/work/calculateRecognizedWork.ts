import type { Minutes, TimeRange } from '../../types/work';
import { getOverlapMinutes, mergeTimeRanges } from '../time/overlap';

export function calculateRecognizedWork(params: { clockIn: Minutes; clockOut: Minutes; breaks: TimeRange[] }): number {
  const workInterval = { start: params.clockIn, end: params.clockOut };
  if (workInterval.end <= workInterval.start) return 0;
  const breakMinutes = mergeTimeRanges(params.breaks).reduce((total, breakRange) => total + getOverlapMinutes(workInterval, breakRange), 0);
  return Math.max(0, workInterval.end - workInterval.start - breakMinutes);
}
