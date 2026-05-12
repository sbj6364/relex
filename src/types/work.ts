export type Minutes = number;

export type TimeRange = { start: Minutes; end: Minutes };

export type WorkRules = {
  weeklyTargetMinutes: number;
  workWindow: TimeRange;
  coreTime: TimeRange;
  defaultBreak: TimeRange;
  workdays: number[];
};

export type DayPlan = {
  date?: string;
  weekday: number;
  isWorkday: boolean;
  clockIn?: Minutes;
  clockOut?: Minutes;
  breaks: TimeRange[];
};

export type CoreTimeValidationResult = { isValid: boolean; reason?: string };

export type RecommendedDayPlan = DayPlan & { recommendedClockOut?: Minutes; targetWorkMinutes: number };
