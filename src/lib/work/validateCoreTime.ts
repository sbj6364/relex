import type { CoreTimeValidationResult, Minutes, TimeRange } from '../../types/work';
import { formatTime } from '../time/formatTime';

export function validateCoreTime(params: { clockIn: Minutes; clockOut: Minutes; coreTime: TimeRange }): CoreTimeValidationResult {
  if (params.clockIn > params.coreTime.start && params.clockOut < params.coreTime.end) {
    return { isValid: false, reason: `코어타임 ${formatTime(params.coreTime.start)}-${formatTime(params.coreTime.end)} 전체를 포함하지 않아요.` };
  }
  if (params.clockIn > params.coreTime.start) return { isValid: false, reason: `출근 시간이 코어타임 시작(${formatTime(params.coreTime.start)})보다 늦어요.` };
  if (params.clockOut < params.coreTime.end) return { isValid: false, reason: `퇴근 시간이 코어타임 종료(${formatTime(params.coreTime.end)})보다 빨라요.` };
  return { isValid: true };
}
