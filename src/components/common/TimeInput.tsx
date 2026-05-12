export function TimeInput(props: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{props.label}</span><input type="time" value={props.value} onChange={(event) => props.onChange(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-brand" /></label>;
}
