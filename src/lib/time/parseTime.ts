import type { Minutes } from '../../types/work';

export function parseTime(value: string): Minutes {
  const normalized = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
  if (!match) throw new Error(`Invalid time: ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) throw new Error(`Invalid time: ${value}`);
  return hours * 60 + minutes;
}
