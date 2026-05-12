import type { PropsWithChildren } from 'react';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`rounded-3xl border border-white/80 bg-white p-5 shadow-soft ${className}`}>{children}</section>;
}
