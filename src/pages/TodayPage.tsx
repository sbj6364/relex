import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { TodayCalculatorForm, type PlannedWorkdayForm, type TodayFormState } from '../components/today/TodayCalculatorForm';
import { TodayResultCard } from '../components/today/TodayResultCard';
import { parseDuration } from '../lib/time/duration';
import { formatTime } from '../lib/time/formatTime';
import { parseTime } from '../lib/time/parseTime';
import { loadFromStorage, saveToStorage } from '../lib/storage/localStorage';
import { calculateDefaultClockOut } from '../lib/work/calculateDefaultClockOut';
import { calculateFridayClockOut, getRecognizedMinutesWithBreak } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';
import { validateCoreTime } from '../lib/work/validateCoreTime';
import { validateTimeEntry } from '../lib/work/validateTimeEntry';
import type { WorkRules } from '../types/work';

const storageKey = 'relex:today';
const friday = 5;
const now = () => formatTime(new Date().getHours() * 60 + new Date().getMinutes());
const defaultPlan: PlannedWorkdayForm = { clockIn: '09:00', clockOut: '18:00', breakMinutes: '0' };
const defaultRemainingDayPlans: Record<string, PlannedWorkdayForm> = { 1: defaultPlan, 2: defaultPlan, 3: defaultPlan, 4: defaultPlan };
const initialForm: TodayFormState = { weeklyRemaining: '08:00', clockIn: '09:00', todayClockOut: '18:00', todayBreakMinutes: '0', fridayClockIn: '09:00', fridayBreakMinutes: '0', remainingDayPlans: defaultRemainingDayPlans };

function parseBreakMinutes(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function getDefaultTodayClockOut(clockIn: string, breakMinutes: string, rules: WorkRules) {
  try {
    return formatTime(calculateDefaultClockOut({ clockIn: parseTime(clockIn), breakMinutes: parseBreakMinutes(breakMinutes), rules }));
  } catch {
    return initialForm.todayClockOut;
  }
}

function normalizePlan(plan: Partial<PlannedWorkdayForm> | undefined): PlannedWorkdayForm {
  return { ...defaultPlan, ...plan, breakMinutes: plan?.breakMinutes ?? '0' };
}

function getInitialForm() {
  const saved = loadFromStorage(storageKey, initialForm) as TodayFormState & { useDefaultBreak?: boolean; customBreaks?: unknown[] };
  const remainingDayPlans = Object.fromEntries(Object.entries({ ...defaultRemainingDayPlans, ...saved.remainingDayPlans }).map(([weekday, plan]) => [weekday, normalizePlan(plan)]));
  const merged = { ...initialForm, ...saved, todayBreakMinutes: saved.todayBreakMinutes ?? '0', fridayBreakMinutes: saved.fridayBreakMinutes ?? '0', remainingDayPlans };
  return { ...merged, todayClockOut: saved.todayClockOut ?? getDefaultTodayClockOut(merged.clockIn, merged.todayBreakMinutes, defaultWorkRules) };
}

function getTargetLabel(mode: 'today' | 'friday') {
  return mode === 'friday' ? '금요일 예상' : '오늘';
}

function getPlanningWeekdays(todayWeekday: number) {
  if (todayWeekday < 1 || todayWeekday >= friday) return [];
  return Array.from({ length: friday - todayWeekday - 1 }, (_, index) => todayWeekday + index + 1);
}

export function TodayPage({ rules }: { rules: WorkRules }) {
  const [form, setForm] = useState<TodayFormState>(getInitialForm);
  const [currentTimeText, setCurrentTimeText] = useState(now);
  const todayWeekday = new Date().getDay();
  const planningWeekdays = getPlanningWeekdays(todayWeekday);

  useEffect(() => { saveToStorage(storageKey, form); }, [form]);
  useEffect(() => {
    const update = () => setCurrentTimeText(now());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const result = useMemo(() => {
    try {
      const clockIn = parseTime(form.clockIn);
      const currentTime = parseTime(currentTimeText);
      const todayClockOut = parseTime(form.todayClockOut);
      const todayBreakMinutes = parseBreakMinutes(form.todayBreakMinutes);
      const fridayClockIn = parseTime(form.fridayClockIn);
      const fridayBreakMinutes = parseBreakMinutes(form.fridayBreakMinutes);
      const weeklyRemaining = parseDuration(form.weeklyRemaining);
      const plannedWorkdaysBeforeFriday = [{ weekday: todayWeekday, clockIn, clockOut: todayClockOut, breakMinutes: todayBreakMinutes }, ...Object.entries(form.remainingDayPlans).filter(([weekday]) => planningWeekdays.includes(Number(weekday))).map(([weekday, plan]) => ({ weekday: Number(weekday), clockIn: parseTime(plan.clockIn), clockOut: parseTime(plan.clockOut), breakMinutes: parseBreakMinutes(plan.breakMinutes) }))];
      const plan = calculateFridayClockOut({ todayWeekday, weeklyRemainingMinutes: weeklyRemaining, todayClockIn: clockIn, todayBreakMinutes, fridayClockIn, fridayBreakMinutes, plannedWorkdaysBeforeFriday, rules });
      const effectiveNow = Math.max(clockIn, currentTime);
      const recognizedSoFar = getRecognizedMinutesWithBreak({ clockIn, clockOut: effectiveNow, breakMinutes: todayBreakMinutes });
      return {
        targetLabel: getTargetLabel(plan.mode),
        earliestClockOut: plan.earliestClockOut,
        currentTime,
        recognizedSoFar,
        realtimeRemaining: weeklyRemaining - recognizedSoFar,
        targetRequiredMinutes: plan.targetRequiredMinutes,
        plannedDayCount: plan.plannedDayCount,
        plannedBeforeFridayMinutes: plan.plannedBeforeFridayMinutes,
        excessBeforeFridayMinutes: plan.excessBeforeFridayMinutes,
        projectedExcessMinutes: plan.projectedExcessMinutes,
        core: plan.earliestClockOut == null ? { isValid: false, reason: '퇴근 가능 시간을 계산하지 못했어요.' } : validateCoreTime({ clockIn: plan.mode === 'friday' ? fridayClockIn : clockIn, clockOut: plan.earliestClockOut, coreTime: rules.coreTime }),
        entryWarnings: [
          { label: '오늘 출근', result: validateTimeEntry({ role: 'clockIn', time: clockIn, rules }) },
          { label: '오늘 퇴근', result: validateTimeEntry({ role: 'clockOut', time: todayClockOut, rules }) },
          ...plannedWorkdaysBeforeFriday.slice(1).flatMap((day) => [
            { label: `${formatTime(day.clockIn)} 출근`, result: validateTimeEntry({ role: 'clockIn', time: day.clockIn, rules }) },
            { label: `${formatTime(day.clockOut)} 퇴근`, result: validateTimeEntry({ role: 'clockOut', time: day.clockOut, rules }) },
          ]),
          { label: '금요일 예상 출근', result: validateTimeEntry({ role: 'clockIn', time: fridayClockIn, rules }) },
        ].filter((warning) => !warning.result.isValid),
        isImpossible: plan.earliestClockOut == null,
      };
    } catch {
      return { targetLabel: '금요일 예상', earliestClockOut: null, currentTime: 0, recognizedSoFar: 0, realtimeRemaining: 0, targetRequiredMinutes: 0, plannedDayCount: 0, plannedBeforeFridayMinutes: 0, excessBeforeFridayMinutes: 0, projectedExcessMinutes: 0, entryWarnings: [], core: { isValid: false, reason: '입력값을 확인해주세요.' }, isImpossible: true };
    }
  }, [currentTimeText, form, planningWeekdays, rules, todayWeekday]);

  return <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]"><TodayResultCard {...result} /><Card><div className="mb-5"><h2 className="text-xl font-black">금요일 퇴근 계산</h2><p className="mt-1 text-sm text-slate-500">Flex 상 주간 잔여시간을 입력하면 오늘 퇴근 계획과 내일부터 목요일까지의 근무 계획을 반영해 금요일 예상 퇴근 시간을 알려드려요.</p></div><TodayCalculatorForm value={form} onChange={setForm} planningWeekdays={planningWeekdays} getDefaultTodayClockOut={(clockIn, breakMinutes) => getDefaultTodayClockOut(clockIn, breakMinutes, rules)} /></Card><Card className="lg:col-span-2"><h2 className="text-lg font-black">기본 규칙</h2><p className="mt-2 text-sm text-slate-500">근무 가능 시간 {formatTime(rules.workWindow.start)}-{formatTime(rules.workWindow.end)}, 코어타임 {formatTime(rules.coreTime.start)}-{formatTime(rules.coreTime.end)} 기준으로 계산합니다. 휴게시간은 각 요일별 분 단위 입력값을 차감합니다.</p>{rules === defaultWorkRules && null}</Card></div>;
}
