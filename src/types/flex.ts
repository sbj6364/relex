import type { Minutes, TimeRange } from './work';

export type FlexParsedData = {
  remainingMinutes?: number;
  todayClockIn?: Minutes;
  todayClockOut?: Minutes;
  breaks?: TimeRange[];
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
};
