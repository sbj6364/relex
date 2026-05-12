import type { FlexParsedData } from '../../types/flex';
import { parseTime } from '../time/parseTime';

const timePattern = /(\d{1,2}:\d{2})/g;
const remainingPattern = /(잔여|remaining|남은)[^\d]*(?:(\d+)\s*:\s*(\d{1,2})|(\d+)\s*(?:시간|h|hours?)\s*(?:(\d+)\s*(?:분|m|minutes?))?|(\d+)\s*(?:분|m|minutes?))/i;
const breakPattern = /(휴게|break|쉬는)[^\d]*(\d{1,2}:\d{2})\s*[-~–]\s*(\d{1,2}:\d{2})/gi;

type TextRange = { start: number; end: number };

function removeRanges(value: string, ranges: TextRange[]): string {
  return ranges
    .sort((a, b) => b.start - a.start)
    .reduce((next, range) => `${next.slice(0, range.start)} ${next.slice(range.end)}`, value);
}

function parseRemainingMinutes(match: RegExpMatchArray): number | undefined {
  const colonHours = match[2];
  const colonMinutes = match[3];
  if (colonHours != null && colonMinutes != null) return Number(colonHours) * 60 + Number(colonMinutes);

  const koreanHours = match[4];
  const koreanMinutes = match[5];
  if (koreanHours != null) return Number(koreanHours) * 60 + Number(koreanMinutes ?? 0);

  const minuteOnly = match[6];
  if (minuteOnly != null) return Number(minuteOnly);

  return undefined;
}

export function parseFlexText(raw: string): FlexParsedData {
  const warnings: string[] = [];
  const text = raw.trim();
  if (!text) return { confidence: 'low', warnings: ['붙여넣은 내용이 비어 있어요.'] };

  const remainingMatch = remainingPattern.exec(text);
  const breakMatches = [...text.matchAll(breakPattern)];
  const breaks = breakMatches.map((match) => ({ start: parseTime(match[2]), end: parseTime(match[3]) }));

  let remainingMinutes: number | undefined;
  const rangesToIgnore: TextRange[] = breakMatches.map((match) => ({ start: match.index, end: match.index + match[0].length }));
  if (remainingMatch?.index != null) {
    rangesToIgnore.push({ start: remainingMatch.index, end: remainingMatch.index + remainingMatch[0].length });
    remainingMinutes = parseRemainingMinutes(remainingMatch);
    if (remainingMinutes == null) warnings.push('잔여 시간을 해석하지 못했어요.');
  } else {
    warnings.push('잔여 시간을 찾지 못했어요.');
  }

  const textWithoutDerivedValues = removeRanges(text, rangesToIgnore);
  const times = [...textWithoutDerivedValues.matchAll(timePattern)].map((match) => parseTime(match[1]));

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
