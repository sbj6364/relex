import type { TimeRange } from '../../types/work';

export function getOverlapMinutes(a: TimeRange, b: TimeRange): number {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

export function mergeTimeRanges(ranges: TimeRange[]): TimeRange[] {
  return ranges
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start)
    .reduce<TimeRange[]>((merged, range) => {
      const previous = merged.at(-1);
      if (!previous || range.start > previous.end) return [...merged, { ...range }];
      previous.end = Math.max(previous.end, range.end);
      return merged;
    }, []);
}
