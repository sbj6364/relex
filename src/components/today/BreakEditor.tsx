import { Plus, Trash2 } from 'lucide-react';
import type { TimeRange } from '../../types/work';
import { formatTime } from '../../lib/time/formatTime';
import { parseTime } from '../../lib/time/parseTime';
import { Button } from '../common/Button';

export function BreakEditor({ breaks, onChange }: { breaks: TimeRange[]; onChange: (breaks: TimeRange[]) => void }) {
  return <div className="grid gap-3"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-slate-700">추가 휴게시간</h3><Button type="button" onClick={() => onChange([...breaks, { start: parseTime('15:00'), end: parseTime('15:15') }])} className="flex items-center gap-1 bg-brand px-3 py-2"><Plus size={16} />추가</Button></div>{breaks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">추가 휴게시간이 없어요.</p>}{breaks.map((breakRange, index) => <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={`${breakRange.start}-${index}`}><input type="time" value={formatTime(breakRange.start)} onChange={(event) => onChange(breaks.map((item, itemIndex) => itemIndex === index ? { ...item, start: parseTime(event.target.value) } : item))} className="rounded-2xl border border-slate-200 px-3 py-3" /><input type="time" value={formatTime(breakRange.end)} onChange={(event) => onChange(breaks.map((item, itemIndex) => itemIndex === index ? { ...item, end: parseTime(event.target.value) } : item))} className="rounded-2xl border border-slate-200 px-3 py-3" /><button type="button" aria-label="휴게 삭제" onClick={() => onChange(breaks.filter((_, itemIndex) => itemIndex !== index))} className="rounded-2xl bg-rose-50 px-3 text-rose-600"><Trash2 size={18} /></button></div>)}</div>;
}
