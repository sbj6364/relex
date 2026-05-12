export function Toggle(props: { label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string }) {
  return <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"><span><span className="block text-sm font-bold text-slate-700">{props.label}</span>{props.description && <span className="text-xs text-slate-400">{props.description}</span>}</span><input type="checkbox" checked={props.checked} onChange={(event) => props.onChange(event.target.checked)} className="h-5 w-5 accent-brand" /></label>;
}
