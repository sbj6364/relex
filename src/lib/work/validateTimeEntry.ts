import type { Minutes, WorkRules } from '../../types/work';
import { formatDuration } from '../time/duration';
import { formatTime } from '../time/formatTime';

export type TimeEntryRole = 'clockIn' | 'clockOut';
export type TimeEntryValidationResult = { isValid: boolean; reason?: string };

function roundUpToLeaveUnit(minutes: number) {
  return Math.ceil(minutes / 30) * 30;
}

function getCoreLeaveMinutesForClockIn(clockIn: Minutes, rules: WorkRules) {
  if (clockIn <= rules.coreTime.start) return 0;
  return roundUpToLeaveUnit(Math.min(clockIn, rules.coreTime.end) - rules.coreTime.start);
}

function getCoreLeaveMinutesForClockOut(clockOut: Minutes, rules: WorkRules) {
  if (clockOut >= rules.coreTime.end) return 0;
  return roundUpToLeaveUnit(rules.coreTime.end - Math.max(clockOut, rules.coreTime.start));
}

export function validateTimeEntry(params: { role: TimeEntryRole; time: Minutes; rules: WorkRules }): TimeEntryValidationResult {
  if (params.time < params.rules.workWindow.start || params.time > params.rules.workWindow.end) {
    return { isValid: false, reason: `시간 기록은 ${formatTime(params.rules.workWindow.start)}-${formatTime(params.rules.workWindow.end)} 사이만 가능해요.` };
  }

  if (params.role === 'clockIn') {
    const leaveMinutes = getCoreLeaveMinutesForClockIn(params.time, params.rules);
    if (leaveMinutes > 0) {
      return { isValid: false, reason: `출근은 ${formatTime(params.rules.workWindow.start)}-${formatTime(params.rules.coreTime.start)} 사이가 기본이에요. 이 시간은 코어타임 연차 ${formatDuration(leaveMinutes)}가 필요할 수 있어요.` };
    }
    return { isValid: true };
  }

  const leaveMinutes = getCoreLeaveMinutesForClockOut(params.time, params.rules);
  if (leaveMinutes > 0) {
    return { isValid: false, reason: `퇴근은 ${formatTime(params.rules.coreTime.end)}-${formatTime(params.rules.workWindow.end)} 사이가 기본이에요. 이 시간은 코어타임 연차 ${formatDuration(leaveMinutes)}가 필요할 수 있어요.` };
  }

  return { isValid: true };
}
