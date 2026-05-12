import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { TodayCalculatorForm, type TodayFormState } from '../components/today/TodayCalculatorForm';
import { TodayResultCard } from '../components/today/TodayResultCard';
import { parseDuration } from '../lib/time/duration';
import { formatTime } from '../lib/time/formatTime';
import { parseTime } from '../lib/time/parseTime';
import { loadFromStorage, saveToStorage } from '../lib/storage/localStorage';
import { calculateRecognizedWork } from '../lib/work/calculateRecognizedWork';
import { findEarliestClockOut } from '../lib/work/findEarliestClockOut';
import { defaultWorkRules } from '../lib/work/workRules';
import { validateCoreTime } from '../lib/work/validateCoreTime';
import type { WorkRules } from '../types/work';

const storageKey = 'relex:today';
const initialForm: TodayFormState = { weeklyRemaining: '08:00', clockIn: '09:00', currentTime: formatTime(new Date().getHours() * 60 + new Date().getMinutes()), useCurrentTime: true, useDefaultBreak: true, customBreaks: [] };

export function TodayPage({ rules }: { rules: WorkRules }) {
  const [form, setForm] = useState(() => loadFromStorage(storageKey, initialForm));

  useEffect(() => { saveToStorage(storageKey, form); }, [form]);
  useEffect(() => {
    if (!form.useCurrentTime) return;
    const update = () => setForm((current) => ({ ...current, currentTime: formatTime(new Date().getHours() * 60 + new Date().getMinutes()) }));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [form.useCurrentTime]);

  const result = useMemo(() => {
    try {
      const clockIn = parseTime(form.clockIn);
      const currentTime = parseTime(form.currentTime);
      const weeklyRemaining = parseDuration(form.weeklyRemaining);
      const breaks = [...(form.useDefaultBreak ? [rules.defaultBreak] : []), ...form.customBreaks];
      const earliestClockOut = findEarliestClockOut({ clockIn, requiredWorkMinutes: weeklyRemaining, breaks, minClockOut: rules.coreTime.end, maxClockOut: rules.workWindow.end });
      const effectiveNow = Math.max(clockIn, Math.min(currentTime, earliestClockOut ?? currentTime));
      const recognizedSoFar = calculateRecognizedWork({ clockIn, clockOut: effectiveNow, breaks });
      const recognizedToday = earliestClockOut == null ? recognizedSoFar : calculateRecognizedWork({ clockIn, clockOut: earliestClockOut, breaks });
      return { earliestClockOut, recognizedSoFar, remainingUntilClockOut: weeklyRemaining - recognizedSoFar, weeklyRemainingAfterToday: weeklyRemaining - recognizedToday, core: earliestClockOut == null ? { isValid: false, reason: '퇴근 가능 시간을 계산하지 못했어요.' } : validateCoreTime({ clockIn, clockOut: earliestClockOut, coreTime: rules.coreTime }), isImpossible: earliestClockOut == null };
    } catch {
      return { earliestClockOut: null, recognizedSoFar: 0, remainingUntilClockOut: 0, weeklyRemainingAfterToday: 0, core: { isValid: false, reason: '입력값을 확인해주세요.' }, isImpossible: true };
    }
  }, [form, rules]);

  return <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]"><TodayResultCard {...result} /><Card><div className="mb-5"><h2 className="text-xl font-black">오늘 계산</h2><p className="mt-1 text-sm text-slate-500">flex 화면의 주간 잔여시간과 오늘 출근 시간을 입력하면 가장 빠른 퇴근 가능 시간을 알려드려요.</p></div><TodayCalculatorForm value={form} onChange={setForm} /></Card><Card className="lg:col-span-2"><h2 className="text-lg font-black">기본 규칙</h2><p className="mt-2 text-sm text-slate-500">근무 가능 시간 {formatTime(rules.workWindow.start)}-{formatTime(rules.workWindow.end)}, 코어타임 {formatTime(rules.coreTime.start)}-{formatTime(rules.coreTime.end)}, 기본 휴게 {formatTime(rules.defaultBreak.start)}-{formatTime(rules.defaultBreak.end)} 기준으로 계산합니다.</p>{rules === defaultWorkRules && null}</Card></div>;
}
