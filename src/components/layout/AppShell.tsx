import type { PropsWithChildren } from 'react';
import type { PageKey } from '../../app/App';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export function AppShell({ children, current, onChange }: PropsWithChildren<{ current: PageKey; onChange: (page: PageKey) => void }>) {
  return <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-white pb-28 sm:pb-8"><Header /><main className="mx-auto grid max-w-5xl gap-5 px-5 sm:px-8">{children}<p className="text-center text-xs font-semibold text-slate-400 sm:hidden">Unofficial flex time helper.</p><BottomNav current={current} onChange={onChange} /></main></div>;
}
