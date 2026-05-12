import { AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDuration } from '../../lib/time/duration';
import { formatTime } from '../../lib/time/formatTime';
import type { CoreTimeValidationResult, Minutes } from '../../types/work';
import { CoreTimeWarning } from './CoreTimeWarning';

export function TodayResultCard(props: { earliestClockOut: Minutes | null; recognizedSoFar: number; remainingUntilClockOut: number; weeklyRemainingAfterToday: number; core: CoreTimeValidationResult; isImpossible: boolean }) {
  return <Card className="bg-gradient-to-br from-brand to-violet-500 text-white"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold opacity-80">오늘 가장 빠른 퇴근 가능 시간</p><Badge tone={props.isImpossible ? 'warn' : 'good'}>{props.isImpossible ? '22:00 초과' : '계산 완료'}</Badge></div><div className="mt-4 text-6xl font-black tracking-tight">{props.earliestClockOut == null ? '--:--' : formatTime(props.earliestClockOut)}</div>{props.isImpossible && <div className="mt-4 flex gap-2 rounded-2xl bg-white/15 p-3 text-sm font-bold"><AlertTriangle size={18} />오늘 업무 가능 시간 안에 달성하기 어려워요.</div>}<div className="mt-6 grid gap-2 rounded-3xl bg-white p-4 text-ink"><div className="flex justify-between"><span>현재까지 인정 근무</span><strong>{formatDuration(props.recognizedSoFar)}</strong></div><div className="flex justify-between"><span>퇴근까지</span><strong>{formatDuration(Math.max(0, props.remainingUntilClockOut))}</strong></div><div className="flex justify-between"><span>이번 주 예상 잔여</span><strong>{formatDuration(Math.max(0, props.weeklyRemainingAfterToday))}</strong></div><CoreTimeWarning result={props.core} /></div></Card>;
}
