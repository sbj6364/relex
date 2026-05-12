import { describe, expect, it } from 'vitest';
import { normalizeDurationInput, parseDuration } from '../lib/time/duration';

describe('duration input helpers', () => {
  it('inserts a colon before the last two digits when typing at least three digits', () => {
    expect(normalizeDurationInput('740')).toBe('7:40');
    expect(normalizeDurationInput('3333')).toBe('33:33');
    expect(normalizeDurationInput('3:333')).toBe('33:33');
  });

  it('parses digit-only hour-minute values as duration', () => {
    expect(parseDuration('740')).toBe(460);
    expect(parseDuration('3333')).toBe(2013);
  });
});
