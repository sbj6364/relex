import type { Minutes, TimeRange } from '../../types/work';
import { calculateRecognizedWork } from './calculateRecognizedWork';

export function findEarliestClockOut(params: {
  clockIn: Minutes;
  requiredWorkMinutes: number;
  breaks: TimeRange[];
  minClockOut: Minutes;
  maxClockOut: Minutes;
}): Minutes | null {
  const start = Math.max(params.clockIn, params.minClockOut);
  for (let clockOut = start; clockOut <= params.maxClockOut; clockOut += 1) {
    const recognized = calculateRecognizedWork({ clockIn: params.clockIn, clockOut, breaks: params.breaks });
    if (recognized >= params.requiredWorkMinutes) return clockOut;
  }
  return null;
}
