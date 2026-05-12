import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { TodayCalculatorForm, type TodayFormState } from '../components/today/TodayCalculatorForm';
import { TodayResultCard } from '../components/today/TodayResultCard';
import { parseDuration } from '../lib/time/duration';
import { formatTime } from '../lib/time/formatTime';
import { parseTime } from '../lib/time/parseTime';
import { loadFromStorage, saveToStorage } from '../lib/storage/localStorage';
import { calculateRecognizedWork } from '../lib/work/calculateRecognizedWork';
import { calculateFridayClockOut } from '../lib/work/calculateFridayClockOut';
import { defaultWorkRules } from '../lib/work/workRules';
import { validateCoreTime } from '../lib/work/validateCoreTime';
import type { WorkRules } from '../types/work';

const storageKey = 'relex:today';
const now = () => formatTime(new Date().getHours() * 60 + new Date().getMinutes());
const initialForm: TodayFormState = { weeklyRemaining: '08:00', clockIn: '09:00', currentTime: now(), fridayClockIn: '09:00', useCurrentTime: true, useDefaultBreak: true, customBreaks: [] };

function getInitialForm() {
  return { ...initialForm, ...loadFromStorage(storageKey, initialForm) };
}

function getTargetLabel(mode: 'today' | 'friday') {
  return mode === 'friday' ? '금요일 예상' : '오늘';
}

export function TodayPage({ rules }: { rules: WorkRules }) {
  const [form, setForm] = useState<TodayFormState>(getInitialForm);

  useEffect(() => { saveToStorage(storageKey, form); }, [form]);
  useEffect(() => {
    if (!form.useCurrentTime) return;
    const update = () => setForm((current) => ({ ...current, currentTime: now() }));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [form.useCurrentTime]);

  const result = useMemo(() => {
    try {
      const clockIn = parseTime(form.clockIn);
      const currentTime = parseTime(form.currentTime);
      const fridayClockIn = parseTime(form.fridayClockIn);
      const weeklyRemaining = parseDuration(form.weeklyRemaining);
      const breaks = [...(form.useDefaultBreak ? [rules.defaultBreak] : []), ...form.customBreaks];
      const todayWeekday = new Date().getDay();
      const plan = calculateFridayClockOut({ todayWeekday, weeklyRemainingMinutes: weeklyRemaining, todayClockIn: clockIn, todayCurrentTime: currentTime, fridayClockIn, breaks, rules });
      const effectiveNow = Math.max(clockIn, currentTime);
      const recognizedSoFar = calculateRecognizedWork({ clockIn, clockOut: effectiveNow, breaks });
      return {
        targetLabel: getTargetLabel(plan.mode),
        earliestClockOut: plan.earliestClockOut,
        recognizedSoFar,
        realtimeRemaining: weeklyRemaining - recognizedSoFar,
        targetRequiredMinutes: plan.targetRequiredMinutes,
        assumedStandardDays: plan.assumedStandardDays,
        core: plan.earliestClockOut == null ? { isValid: false, reason: '퇴근 가능 시간을 계산하지 못했어요.' } : validateCoreTime({ clockIn: plan.mode === 'friday' ? fridayClockIn : clockIn, clockOut: plan.earliestClockOut, coreTime: rules.coreTime }),
        isImpossible: plan.earliestClockOut == null,
      };
    } catch {
      return { targetLabel: '금요일 예상', earliestClockOut: null, recognizedSoFar: 0, realtimeRemaining: 0, targetRequiredMinutes: 0, assumedStandardDays: 0, core: { isValid: false, reason: '입력값을 확인해주세요.' }, isImpossible: true };
    }
  }, [form, rules]);

  return <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]"><TodayResultCard {...result} /><Card><div className="mb-5"><h2 className="text-xl font-black">금요일 퇴근 계산</h2><p className="mt-1 text-sm text-slate-500">Flex 상 주간 잔여시간을 입력하면 월~목에는 오늘부터 목요일까지 8시간 근무한다고 가정해 금요일 예상 퇴근 시간을 알려드려요.</p></div><TodayCalculatorForm value={form} onChange={setForm} /></Card><Card className="lg:col-span-2"><h2 className="text-lg font-black">기본 규칙</h2><p className="mt-2 text-sm text-slate-500">근무 가능 시간 {formatTime(rules.workWindow.start)}-{formatTime(rules.workWindow.end)}, 코어타임 {formatTime(rules.coreTime.start)}-{formatTime(rules.coreTime.end)}, 기본 휴게 {formatTime(rules.defaultBreak.start)}-{formatTime(rules.defaultBreak.end)} 기준으로 계산합니다. 월~목 계산은 오늘부터 목요일까지 하루 8시간 근무를 기본값으로 가정합니다.</p>{rules === defaultWorkRules && null}</Card></div>;
}
