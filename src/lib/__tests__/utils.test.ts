import { describe, it, expect } from 'vitest';
import {
  cn,
  fmtMoney,
  fmtNumber,
  fmtDate,
  fmtShortDate,
  fmtTime,
  PAYMENT_LABELS,
  ROLE_LABELS,
  TIER_LABELS,
  TIER_COLORS,
} from '../utils';

describe('utils / cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('utils / fmtMoney', () => {
  it('formats positive integer with NT$ prefix', () => {
    expect(fmtMoney(1234)).toMatch(/NT\$/);
    expect(fmtMoney(1234)).toContain('1,234');
  });

  it('rounds fractional values', () => {
    expect(fmtMoney(99.4)).toContain('99');
    expect(fmtMoney(99.6)).toContain('100');
  });

  it('supports custom currency prefix', () => {
    expect(fmtMoney(100, 'US$')).toContain('US$');
  });

  it('handles zero', () => {
    expect(fmtMoney(0)).toContain('0');
  });
});

describe('utils / fmtNumber', () => {
  it('rounds and localizes', () => {
    expect(fmtNumber(1234.7)).toContain('1,235');
  });

  it('handles zero', () => {
    expect(fmtNumber(0)).toBe('0');
  });
});

describe('utils / fmtDate', () => {
  it('formats ISO string with default pattern', () => {
    const out = fmtDate('2026-01-15T10:30:00');
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/01/);
  });

  it('accepts Date object', () => {
    const d = new Date('2026-12-25T08:00:00');
    const out = fmtDate(d, 'yyyy/MM/dd');
    expect(out).toBe('2026/12/25');
  });

  it('respects custom pattern', () => {
    const out = fmtDate('2026-03-15T00:00:00', 'dd-MM-yyyy');
    expect(out).toBe('15-03-2026');
  });
});

describe('utils / fmtShortDate', () => {
  it('formats to MM/dd', () => {
    expect(fmtShortDate('2026-07-17T00:00:00')).toMatch(/07\/17/);
  });
});

describe('utils / fmtTime', () => {
  it('extracts HH:mm', () => {
    expect(fmtTime('2026-01-01T14:30:00')).toBe('14:30');
  });
});

describe('utils / labels (static maps)', () => {
  it('PAYMENT_LABELS has 4 keys', () => {
    expect(Object.keys(PAYMENT_LABELS)).toHaveLength(4);
    expect(PAYMENT_LABELS.cash).toBe('現金');
  });

  it('ROLE_LABELS has 3 roles', () => {
    expect(Object.keys(ROLE_LABELS)).toHaveLength(3);
    expect(ROLE_LABELS.admin).toBe('管理員');
  });

  it('TIER_LABELS has 4 tiers', () => {
    expect(Object.keys(TIER_LABELS)).toHaveLength(4);
    expect(TIER_LABELS.vip).toBe('VIP');
  });

  it('TIER_COLORS maps to Tailwind classes', () => {
    Object.values(TIER_COLORS).forEach(v => {
      expect(v).toMatch(/^bg-\S+ text-\S+$/);
    });
  });
});