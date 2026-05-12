import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { CoreTimeValidationResult } from '../../types/work';

export function CoreTimeWarning({ result }: { result: CoreTimeValidationResult }) {
  return <div className={`flex gap-2 rounded-2xl p-3 text-sm font-bold ${result.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{result.isValid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}<span>{result.isValid ? '코어타임 충족' : result.reason}</span></div>;
}
