import type { Minutes } from '../../types/work';

export function formatTime(value: Minutes): string {
  const safeValue = Math.max(0, Math.round(value));
  const hours = Math.floor(safeValue / 60) % 24;
  const minutes = safeValue % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
