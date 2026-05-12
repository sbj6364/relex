import type { FlexParsedData } from '../../types/flex';
import { parseDuration } from '../time/duration';
import { parseTime } from '../time/parseTime';

const timePattern = /(\d{1,2}:\d{2})/g;

export function parseFlexText(raw: string): FlexParsedData {
  const warnings: string[] = [];
  const text = raw.trim();
  if (!text) return { confidence: 'low', warnings: ['붙여넣은 내용이 비어 있어요.'] };

  const lower = text.toLowerCase();
  const remainingMatch = /(잔여|remaining|남은)[^\d]*(\d+[:시간h]\s*\d{0,2})/.exec(lower);
  const textWithoutRemaining = remainingMatch ? text.replace(remainingMatch[0], ' ') : text;
  const times = [...textWithoutRemaining.matchAll(timePattern)].map((match) => parseTime(match[1]));
  const breaks = [...text.matchAll(/(휴게|break|쉬는)[^\d]*(\d{1,2}:\d{2})\s*[-~–]\s*(\d{1,2}:\d{2})/gi)].map((match) => ({ start: parseTime(match[2]), end: parseTime(match[3]) }));

  let remainingMinutes: number | undefined;
  if (remainingMatch?.[2]) {
    const value = remainingMatch[2].replace('시간', ':').replace('h', ':').replace(/\s+/g, '');
    try { remainingMinutes = parseDuration(value.endsWith(':') ? `${value}00` : value); } catch { warnings.push('잔여 시간을 해석하지 못했어요.'); }
  } else {
    warnings.push('잔여 시간을 찾지 못했어요.');
  }

  const result: FlexParsedData = {
    remainingMinutes,
    todayClockIn: times[0],
    todayClockOut: times[1],
    breaks: breaks.length > 0 ? breaks : undefined,
    confidence: remainingMinutes != null && times.length >= 1 ? 'medium' : 'low',
    warnings,
  };
  if (remainingMinutes != null && times.length >= 2) result.confidence = 'high';
  if (times.length === 0) result.warnings.push('오늘 출근 시간을 찾지 못했어요.');
  return result;
}
