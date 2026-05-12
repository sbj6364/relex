import type { Minutes, WorkRules } from '../../types/work';
import { getRecognizedMinutesWithStop } from './calculateFridayClockOut';

const standardWorkMinutes = 8 * 60;

export function calculateDefaultClockOut(params: { clockIn: Minutes; stopMinutes: number; rules: WorkRules; targetWorkMinutes?: number }): Minutes {
  const targetWorkMinutes = params.targetWorkMinutes ?? standardWorkMinutes;
  for (let clockOut = params.clockIn; clockOut <= params.rules.workWindow.end; clockOut += 1) {
    if (getRecognizedMinutesWithStop({ clockIn: params.clockIn, clockOut, stopMinutes: params.stopMinutes }) >= targetWorkMinutes) return clockOut;
  }
  return params.rules.workWindow.end;
}
