import { describe, it, expect } from 'vitest';
import {
  DEMO_PRODUCTS,
  DEMO_MEMBERS,
  DEMO_STAFF,
  DEFAULT_SETTINGS,
  generateDemoTransactions,
} from '../demo-data';

describe('demo-data / DEMO_PRODUCTS', () => {
  it('has at least 15 products', () => {
    expect(DEMO_PRODUCTS.length).toBeGreaterThanOrEqual(15);
  });

  it('all products have positive price', () => {
    DEMO_PRODUCTS.forEach(p => {
      expect(p.price).toBeGreaterThan(0);
    });
  });

  it('all products have unique SKUs', () => {
    const skus = DEMO_PRODUCTS.map(p => p.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it('all products have unique IDs', () => {
    const ids = DEMO_PRODUCTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all products are active by default', () => {
    DEMO_PRODUCTS.forEach(p => {
      expect(p.active).toBe(true);
    });
  });
});

describe('demo-data / DEMO_MEMBERS', () => {
  it('has at least 5 members', () => {
    expect(DEMO_MEMBERS.length).toBeGreaterThanOrEqual(5);
  });

  it('all members have valid tier', () => {
    const validTiers = ['bronze', 'silver', 'gold', 'vip'];
    DEMO_MEMBERS.forEach(m => {
      expect(validTiers).toContain(m.tier);
    });
  });

  it('tier is consistent with totalSpent', () => {
    DEMO_MEMBERS.forEach(m => {
      if (m.totalSpent >= 50000) expect(m.tier).toBe('vip');
      else if (m.totalSpent >= 20000) expect(m.tier).toBe('gold');
      else if (m.totalSpent >= 5000) expect(m.tier).toBe('silver');
      else expect(m.tier).toBe('bronze');
    });
  });

  it('all members have non-empty names', () => {
    DEMO_MEMBERS.forEach(m => {
      expect(m.name.length).toBeGreaterThan(0);
    });
  });
});

describe('demo-data / DEMO_STAFF', () => {
  it('has at least 3 staff', () => {
    expect(DEMO_STAFF.length).toBeGreaterThanOrEqual(3);
  });

  it('all staff have unique usernames', () => {
    const usernames = DEMO_STAFF.map(s => s.username);
    expect(new Set(usernames).size).toBe(usernames.length);
  });

  it('all staff have valid role', () => {
    const validRoles = ['admin', 'manager', 'cashier'];
    DEMO_STAFF.forEach(s => {
      expect(validRoles).toContain(s.role);
    });
  });

  it('all staff have non-empty password', () => {
    DEMO_STAFF.forEach(s => {
      expect((s.password ?? '').length).toBeGreaterThan(0);
    });
  });
});

describe('demo-data / DEFAULT_SETTINGS', () => {
  it('has taxRate between 0 and 1', () => {
    expect(DEFAULT_SETTINGS.taxRate).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_SETTINGS.taxRate).toBeLessThan(1);
  });

  it('has pointsPerDollar > 0', () => {
    expect(DEFAULT_SETTINGS.pointsPerDollar).toBeGreaterThan(0);
  });

  it('has store name', () => {
    expect((DEFAULT_SETTINGS.storeName ?? '').length).toBeGreaterThan(0);
  });
});

describe('demo-data / generateDemoTransactions', () => {
  it('returns array of transactions', () => {
    const txs = generateDemoTransactions();
    expect(Array.isArray(txs)).toBe(true);
    expect(txs.length).toBeGreaterThan(0);
  });

  it('all transactions are completed status', () => {
    const txs = generateDemoTransactions();
    txs.forEach(tx => {
      expect(tx.status).toBe('completed');
    });
  });

  it('all transactions have at least one item', () => {
    const txs = generateDemoTransactions();
    txs.forEach(tx => {
      expect(tx.items.length).toBeGreaterThan(0);
    });
  });

  it('all transactions have positive total', () => {
    const txs = generateDemoTransactions();
    txs.forEach(tx => {
      expect(tx.total).toBeGreaterThan(0);
    });
  });

  it('subtotal + tax equals total (or tax is 0)', () => {
    const txs = generateDemoTransactions();
    txs.forEach(tx => {
      if (tx.tax > 0) {
        expect(tx.subtotal + tx.tax).toBe(tx.total);
      } else {
        expect(tx.subtotal).toBe(tx.total);
      }
    });
  });
});