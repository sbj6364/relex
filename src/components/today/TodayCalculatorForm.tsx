import type { TimeRange } from '../../types/work';
import { DurationInput } from '../common/DurationInput';
import { TimeInput } from '../common/TimeInput';
import { Toggle } from '../common/Toggle';
import { BreakEditor } from './BreakEditor';

export type PlannedWorkdayForm = { clockIn: string; clockOut: string };
export type TodayFormState = { weeklyRemaining: string; clockIn: string; todayClockOut: string; currentTime: string; fridayClockIn: string; remainingDayPlans: Record<string, PlannedWorkdayForm>; useCurrentTime: boolean; useDefaultBreak: boolean; customBreaks: TimeRange[] };

const weekdayLabels: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목' };
const defaultPlan: PlannedWorkdayForm = { clockIn: '09:00', clockOut: '18:00' };

export function TodayCalculatorForm({ value, onChange, planningWeekdays, getDefaultTodayClockOut }: { value: TodayFormState; onChange: (value: TodayFormState) => void; planningWeekdays: number[]; getDefaultTodayClockOut: (clockIn: string) => string }) {
  const updatePlan = (weekday: number, plan: PlannedWorkdayForm) => onChange({ ...value, remainingDayPlans: { ...value.remainingDayPlans, [weekday]: plan } });

  return <div className="grid gap-4"><DurationInput label="Flex 상 이번 주 남은 근무시간" value={value.weeklyRemaining} onChange={(weeklyRemaining) => onChange({ ...value, weeklyRemaining })} hint="예: 07:40 또는 740 → 7시간 40분" /><div className="grid grid-cols-2 gap-3"><TimeInput label="오늘 출근" value={value.clockIn} onChange={(clockIn) => onChange({ ...value, clockIn, todayClockOut: getDefaultTodayClockOut(clockIn) })} /><TimeInput label="오늘 퇴근" value={value.todayClockOut} onChange={(todayClockOut) => onChange({ ...value, todayClockOut })} /></div><TimeInput label="현재 시간" value={value.currentTime} onChange={(currentTime) => onChange({ ...value, currentTime, useCurrentTime: false })} />{planningWeekdays.length > 0 && <div className="grid gap-3 rounded-3xl bg-slate-50 p-4"><div><p className="text-sm font-black text-slate-700">금요일 전 근무 계획</p><p className="mt-1 text-xs font-medium leading-5 text-slate-500">내일부터 목요일까지 표시돼요. 기본값은 09:00-18:00이며, 수정하면 금요일 예상 퇴근 시간이 바로 다시 계산돼요.</p></div>{planningWeekdays.map((weekday) => { const plan = value.remainingDayPlans[weekday] ?? defaultPlan; return <div key={weekday} className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2"><div className="pb-3 text-sm font-black text-slate-600">{weekdayLabels[weekday]}</div><TimeInput label="출근" value={plan.clockIn} onChange={(clockIn) => updatePlan(weekday, { ...plan, clockIn })} /><TimeInput label="퇴근" value={plan.clockOut} onChange={(clockOut) => updatePlan(weekday, { ...plan, clockOut })} /></div>; })}</div>}<TimeInput label="금요일 예상 출근 시간" value={value.fridayClockIn} onChange={(fridayClockIn) => onChange({ ...value, fridayClockIn })} /><Toggle label="실제 현재 시간 자동 사용" checked={value.useCurrentTime} onChange={(useCurrentTime) => onChange({ ...value, useCurrentTime })} description="끄면 테스트용으로 직접 입력할 수 있어요." /><Toggle label="기본 점심시간 적용" checked={value.useDefaultBreak} onChange={(useDefaultBreak) => onChange({ ...value, useDefaultBreak })} description="기본값 12:00-13:00" /><BreakEditor breaks={value.customBreaks} onChange={(customBreaks) => onChange({ ...value, customBreaks })} /></div>;
}
