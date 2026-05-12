import type { Minutes, WorkRules } from '../../types/work';

const standardWorkMinutes = 8 * 60;

export function calculateDefaultClockOut(params: { clockIn: Minutes; breakMinutes: number; rules: WorkRules; targetWorkMinutes?: number }): Minutes {
  const targetWorkMinutes = params.targetWorkMinutes ?? standardWorkMinutes;
  return Math.min(params.rules.workWindow.end, params.clockIn + targetWorkMinutes + Math.max(0, params.breakMinutes));
}
