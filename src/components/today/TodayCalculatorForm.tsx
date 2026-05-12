import type { TimeRange } from '../../types/work';
import { DurationInput } from '../common/DurationInput';
import { TimeInput } from '../common/TimeInput';
import { Toggle } from '../common/Toggle';
import { BreakEditor } from './BreakEditor';

export type TodayFormState = { weeklyRemaining: string; clockIn: string; currentTime: string; fridayClockIn: string; useCurrentTime: boolean; useDefaultBreak: boolean; customBreaks: TimeRange[] };

export function TodayCalculatorForm({ value, onChange }: { value: TodayFormState; onChange: (value: TodayFormState) => void }) {
  return <div className="grid gap-4"><DurationInput label="Flex 상 이번 주 남은 근무시간" value={value.weeklyRemaining} onChange={(weeklyRemaining) => onChange({ ...value, weeklyRemaining })} hint="예: 07:40 또는 740 → 7시간 40분" /><div className="grid gap-4 sm:grid-cols-2"><TimeInput label="오늘 출근 시간" value={value.clockIn} onChange={(clockIn) => onChange({ ...value, clockIn })} /><TimeInput label="현재 시간" value={value.currentTime} onChange={(currentTime) => onChange({ ...value, currentTime, useCurrentTime: false })} /></div><TimeInput label="금요일 예상 출근 시간" value={value.fridayClockIn} onChange={(fridayClockIn) => onChange({ ...value, fridayClockIn })} /><Toggle label="실제 현재 시간 자동 사용" checked={value.useCurrentTime} onChange={(useCurrentTime) => onChange({ ...value, useCurrentTime })} description="끄면 테스트용으로 직접 입력할 수 있어요." /><Toggle label="기본 점심시간 적용" checked={value.useDefaultBreak} onChange={(useDefaultBreak) => onChange({ ...value, useDefaultBreak })} description="기본값 12:00-13:00" /><BreakEditor breaks={value.customBreaks} onChange={(customBreaks) => onChange({ ...value, customBreaks })} /></div>;
}
