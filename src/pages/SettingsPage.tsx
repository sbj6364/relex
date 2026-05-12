import { useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { TimeInput } from '../components/common/TimeInput';
import { formatTime } from '../lib/time/formatTime';
import { parseTime } from '../lib/time/parseTime';
import { defaultWorkRules } from '../lib/work/workRules';
import type { WorkRules } from '../types/work';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

export function SettingsPage({ rules, onChange }: { rules: WorkRules; onChange: (rules: WorkRules) => void }) {
  const [weeklyHours, setWeeklyHours] = useState(String(rules.weeklyTargetMinutes / 60));
  const setTime = (path: 'workStart' | 'workEnd' | 'coreStart' | 'coreEnd' | 'breakStart' | 'breakEnd', value: string) => {
    const minutes = parseTime(value);
    const next = { ...rules, workWindow: { ...rules.workWindow }, coreTime: { ...rules.coreTime }, defaultBreak: { ...rules.defaultBreak } };
    if (path === 'workStart') next.workWindow.start = minutes;
    if (path === 'workEnd') next.workWindow.end = minutes;
    if (path === 'coreStart') next.coreTime.start = minutes;
    if (path === 'coreEnd') next.coreTime.end = minutes;
    if (path === 'breakStart') next.defaultBreak.start = minutes;
    if (path === 'breakEnd') next.defaultBreak.end = minutes;
    onChange(next);
  };
  return <Card><h2 className="text-xl font-black">설정</h2><p className="mt-1 text-sm text-slate-500">회사 규칙에 맞게 계산 기준을 조정할 수 있어요. 모든 설정은 이 브라우저에만 저장됩니다.</p><div className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-semibold text-slate-700"><span>주간 목표 시간</span><input inputMode="numeric" value={weeklyHours} onChange={(event) => { setWeeklyHours(event.target.value); const hours = Number(event.target.value); if (Number.isFinite(hours)) onChange({ ...rules, weeklyTargetMinutes: Math.round(hours * 60) }); }} className="rounded-2xl border border-slate-200 px-4 py-3" /></label><div className="grid gap-4 sm:grid-cols-2"><TimeInput label="근무 가능 시작" value={formatTime(rules.workWindow.start)} onChange={(value) => setTime('workStart', value)} /><TimeInput label="근무 가능 종료" value={formatTime(rules.workWindow.end)} onChange={(value) => setTime('workEnd', value)} /><TimeInput label="코어타임 시작" value={formatTime(rules.coreTime.start)} onChange={(value) => setTime('coreStart', value)} /><TimeInput label="코어타임 종료" value={formatTime(rules.coreTime.end)} onChange={(value) => setTime('coreEnd', value)} /><TimeInput label="기본 휴게 시작" value={formatTime(rules.defaultBreak.start)} onChange={(value) => setTime('breakStart', value)} /><TimeInput label="기본 휴게 종료" value={formatTime(rules.defaultBreak.end)} onChange={(value) => setTime('breakEnd', value)} /></div><div><h3 className="mb-2 text-sm font-black text-slate-700">근무 요일</h3><div className="grid grid-cols-7 gap-2">{weekdays.map((day, index) => <button key={day} onClick={() => onChange({ ...rules, workdays: rules.workdays.includes(index) ? rules.workdays.filter((item) => item !== index) : [...rules.workdays, index].sort() })} className={`rounded-2xl px-2 py-3 text-sm font-black ${rules.workdays.includes(index) ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>{day}</button>)}</div></div><Button onClick={() => { setWeeklyHours(String(defaultWorkRules.weeklyTargetMinutes / 60)); onChange(defaultWorkRules); }} className="bg-slate-900">기본값으로 되돌리기</Button></div></Card>;
}
