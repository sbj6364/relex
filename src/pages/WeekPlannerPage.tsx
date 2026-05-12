import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export function WeekPlannerPage() {
  return <Card><Badge>v0.2 구조 준비</Badge><h2 className="mt-4 text-xl font-black">Week Planner</h2><p className="mt-2 text-sm leading-6 text-slate-500">월요일부터 금요일까지의 출퇴근 계획, 인정 근무 합계, 남은 근무시간 분배 기능을 담을 공간이에요. v0.1에서는 오늘 퇴근 계산과 설정을 먼저 완성했습니다.</p><div className="mt-5 grid gap-3 text-sm"><div className="rounded-2xl bg-slate-50 p-4">월 09:00 - 18:00 인정 8h</div><div className="rounded-2xl bg-slate-50 p-4">화 09:00 - 18:30 인정 8h 30m</div><div className="rounded-2xl bg-slate-50 p-4">금 10:00 - 16:00 목표 고정 예정</div></div></Card>;
}
