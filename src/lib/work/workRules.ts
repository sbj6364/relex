import { parseTime } from '../time/parseTime';
import type { WorkRules } from '../../types/work';

export const defaultWorkRules: WorkRules = {
  weeklyTargetMinutes: 40 * 60,
  workWindow: { start: parseTime('07:00'), end: parseTime('22:00') },
  coreTime: { start: parseTime('10:00'), end: parseTime('16:00') },
  defaultBreak: { start: parseTime('12:00'), end: parseTime('13:00') },
  workdays: [1, 2, 3, 4, 5],
};
