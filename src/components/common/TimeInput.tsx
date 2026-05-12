export function TimeInput(props: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`grid min-w-0 gap-2 text-sm font-semibold text-slate-700 ${props.className ?? ''}`}><span>{props.label}</span><input type="time" value={props.value} onChange={(event) => props.onChange(event.target.value)} className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-base outline-none focus:border-brand sm:px-4" /></label>;
}
