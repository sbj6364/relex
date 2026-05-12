import type { PropsWithChildren } from 'react';

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'good' | 'warn' }>) {
  const styles = { neutral: 'bg-slate-100 text-slate-600', good: 'bg-emerald-50 text-emerald-700', warn: 'bg-amber-50 text-amber-700' };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}
