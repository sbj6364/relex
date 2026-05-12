import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { parseFlexText } from '../lib/flex/parseFlexText';
import { formatDuration } from '../lib/time/duration';
import { formatTime } from '../lib/time/formatTime';

export function PastePage() {
  const [raw, setRaw] = useState('');
  const parsed = parseFlexText(raw);
  return <Card><Badge>v0.3 미리보기</Badge><h2 className="mt-4 text-xl font-black">Flex Paste</h2><p className="mt-2 text-sm text-slate-500">flex에서 복사한 텍스트를 붙여넣으면 일부 값을 자동으로 찾아봅니다. 실패해도 수동 입력은 항상 사용할 수 있어요.</p><textarea value={raw} onChange={(event) => setRaw(event.target.value)} placeholder="여기에 flex 출퇴근 텍스트 붙여넣기" className="mt-5 min-h-40 w-full rounded-3xl border border-slate-200 p-4 outline-none focus:border-brand" /><div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm"><p className="font-black">인식 결과: {parsed.confidence}</p>{parsed.remainingMinutes != null && <p>잔여 시간 {formatDuration(parsed.remainingMinutes)}</p>}{parsed.todayClockIn != null && <p>출근 {formatTime(parsed.todayClockIn)}</p>}{parsed.todayClockOut != null && <p>퇴근 {formatTime(parsed.todayClockOut)}</p>}{parsed.warnings.length > 0 && <p className="mt-2 text-amber-700">자동 인식하지 못한 항목이 있어요. 아래에서 직접 입력해주세요.</p>}</div></Card>;
}
