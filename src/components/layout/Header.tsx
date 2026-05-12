import { Sparkles } from 'lucide-react';

export function Header() {
  return <header className="px-5 pb-4 pt-6 sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between"><div><div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white"><Sparkles size={20} /></span><h1 className="text-2xl font-black tracking-tight">relex</h1></div><p className="mt-2 text-sm text-slate-500">flex 때문에 머리 아플 때, relex.</p></div><p className="hidden text-xs font-semibold text-slate-400 sm:block">Unofficial flex time helper.</p></div></header>;
}
