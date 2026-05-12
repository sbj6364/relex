export function parseDuration(value: string): number {
  const trimmed = value.trim().toLowerCase();
  const colonMatch = /^(\d+):(\d{1,2})$/.exec(trimmed);
  if (colonMatch) return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  const hourMinuteMatch = /(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+)\s*m)?/.exec(trimmed);
  if (hourMinuteMatch && (hourMinuteMatch[1] || hourMinuteMatch[2])) {
    return Math.round(Number(hourMinuteMatch[1] ?? 0) * 60 + Number(hourMinuteMatch[2] ?? 0));
  }
  const numberValue = Number(trimmed);
  if (Number.isFinite(numberValue)) return Math.round(numberValue * 60);
  throw new Error(`Invalid duration: ${value}`);
}

export function formatDuration(value: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(Math.round(value));
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${sign}${hours}h ${String(minutes).padStart(2, '0')}m`;
}
