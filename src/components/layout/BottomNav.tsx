import { CalendarDays, ClipboardPaste, Settings, TimerReset } from 'lucide-react';
import type { PageKey } from '../../app/App';

const items = [
  { key: 'today', label: 'Today', icon: TimerReset },
  { key: 'planner', label: 'Planner', icon: CalendarDays },
  { key: 'paste', label: 'Paste', icon: ClipboardPaste },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const;

export function BottomNav({ current, onChange }: { current: PageKey; onChange: (page: PageKey) => void }) {
  return <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 px-3 py-2 backdrop-blur safe-bottom sm:static sm:rounded-3xl sm:border sm:p-2"><div className="mx-auto grid max-w-5xl grid-cols-4 gap-1">{items.map((item) => { const Icon = item.icon; const active = current === item.key; return <button key={item.key} onClick={() => onChange(item.key)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold ${active ? 'bg-brand text-white' : 'text-slate-500'}`}><Icon size={18} />{item.label}</button>; })}</div></nav>;
}
