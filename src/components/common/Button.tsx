import type { ButtonHTMLAttributes } from 'react';

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50 ${className}`} {...props} />;
}
