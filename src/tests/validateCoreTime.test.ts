import { describe, expect, it } from 'vitest';
import { validateCoreTime } from '../lib/work/validateCoreTime';
import { parseTime } from '../lib/time/parseTime';

const t = parseTime;
const coreTime = { start: t('10:00'), end: t('16:00') };

describe('validateCoreTime', () => {
  it('accepts 09:00-18:00', () => expect(validateCoreTime({ clockIn: t('09:00'), clockOut: t('18:00'), coreTime }).isValid).toBe(true));
  it('accepts exact core time', () => expect(validateCoreTime({ clockIn: t('10:00'), clockOut: t('16:00'), coreTime }).isValid).toBe(true));
  it('rejects late clock-in', () => expect(validateCoreTime({ clockIn: t('10:30'), clockOut: t('18:00'), coreTime }).isValid).toBe(false));
  it('rejects early clock-out', () => expect(validateCoreTime({ clockIn: t('09:00'), clockOut: t('15:30'), coreTime }).isValid).toBe(false));
});
