// Demo 預載資料 - 啟動時寫入 localStorage

import type { Product, Member, Transaction, Staff, AppSettings } from './types';

export const DEMO_PRODUCTS: Product[] = [
  // 飲料
  { id: 'p001', sku: '4711234567890', name: '美式咖啡', category: '飲料', price: 60, cost: 20, stock: 100, reorderLevel: 20, unit: '杯', active: true, createdAt: '2026-01-01' },
  { id: 'p002', sku: '4711234567891', name: '拿鐵咖啡', category: '飲料', price: 80, cost: 25, stock: 100, reorderLevel: 20, unit: '杯', active: true, createdAt: '2026-01-01' },
  { id: 'p003', sku: '4711234567892', name: '珍珠奶茶', category: '飲料', price: 65, cost: 22, stock: 80, reorderLevel: 15, unit: '杯', active: true, createdAt: '2026-01-01' },
  { id: 'p004', sku: '4711234567893', name: '檸檬紅茶', category: '飲料', price: 50, cost: 15, stock: 120, reorderLevel: 25, unit: '杯', active: true, createdAt: '2026-01-01' },
  { id: 'p005', sku: '4711234567894', name: '氣泡水', category: '飲料', price: 45, cost: 12, stock: 60, reorderLevel: 15, unit: '瓶', active: true, createdAt: '2026-01-01' },

  // 麵包/糕點
  { id: 'p010', sku: '4711234567900', name: '可頌麵包', category: '烘焙', price: 55, cost: 18, stock: 40, reorderLevel: 10, unit: '個', active: true, createdAt: '2026-01-01' },
  { id: 'p011', sku: '4711234567901', name: '肉桂捲', category: '烘焙', price: 65, cost: 22, stock: 30, reorderLevel: 8, unit: '個', active: true, createdAt: '2026-01-01' },
  { id: 'p012', sku: '4711234567902', name: '巧克力蛋糕', category: '烘焙', price: 120, cost: 45, stock: 15, reorderLevel: 5, unit: '片', active: true, createdAt: '2026-01-01' },
  { id: 'p013', sku: '4711234567903', name: '起司塔', category: '烘焙', price: 75, cost: 28, stock: 25, reorderLevel: 6, unit: '個', active: true, createdAt: '2026-01-01' },

  // 輕食
  { id: 'p020', sku: '4711234567910', name: '火腿起司三明治', category: '輕食', price: 95, cost: 35, stock: 25, reorderLevel: 8, unit: '份', active: true, createdAt: '2026-01-01' },
  { id: 'p021', sku: '4711234567911', name: '鮪魚沙拉', category: '輕食', price: 130, cost: 50, stock: 20, reorderLevel: 5, unit: '份', active: true, createdAt: '2026-01-01' },
  { id: 'p022', sku: '4711234567912', name: '凱薩沙拉', category: '輕食', price: 140, cost: 55, stock: 18, reorderLevel: 5, unit: '份', active: true, createdAt: '2026-01-01' },

  // 零食
  { id: 'p030', sku: '4711234567920', name: '洋芋片', category: '零食', price: 35, cost: 12, stock: 80, reorderLevel: 20, unit: '包', active: true, createdAt: '2026-01-01' },
  { id: 'p031', sku: '4711234567921', name: '巧克力棒', category: '零食', price: 40, cost: 15, stock: 70, reorderLevel: 18, unit: '條', active: true, createdAt: '2026-01-01' },
  { id: 'p032', sku: '4711234567922', name: '餅乾禮盒', category: '零食', price: 280, cost: 120, stock: 12, reorderLevel: 4, unit: '盒', active: true, createdAt: '2026-01-01' },

  // 日用品
  { id: 'p040', sku: '4711234567930', name: '瓶裝水', category: '日用品', price: 20, cost: 5, stock: 200, reorderLevel: 50, unit: '瓶', active: true, createdAt: '2026-01-01' },
  { id: 'p041', sku: '4711234567931', name: '面紙包', category: '日用品', price: 25, cost: 8, stock: 100, reorderLevel: 25, unit: '包', active: true, createdAt: '2026-01-01' },
  { id: 'p042', sku: '4711234567932', name: '雨傘', category: '日用品', price: 150, cost: 60, stock: 30, reorderLevel: 8, unit: '把', active: true, createdAt: '2026-01-01' },
];

export const DEMO_MEMBERS: Member[] = [
  { id: 'm001', name: '王小明', phone: '0912-345-678', email: 'wang@example.com', points: 1250, balance: 500, totalSpent: 12500, tier: 'gold', joinedAt: '2025-06-15', lastVisitAt: '2026-07-10' },
  { id: 'm002', name: '林大嬸', phone: '0923-456-789', points: 850, balance: 200, totalSpent: 8500, tier: 'silver', joinedAt: '2025-08-20', lastVisitAt: '2026-07-11' },
  { id: 'm003', name: '陳同學', phone: '0934-567-890', email: 'chen@example.com', points: 320, balance: 0, totalSpent: 3200, tier: 'bronze', joinedAt: '2026-02-10', lastVisitAt: '2026-07-09' },
  { id: 'm004', name: '張董事長', phone: '0945-678-901', points: 5800, balance: 2000, totalSpent: 58000, tier: 'vip', joinedAt: '2024-11-05', lastVisitAt: '2026-07-12' },
  { id: 'm005', name: '李小姐', phone: '0956-789-012', points: 450, balance: 0, totalSpent: 4500, tier: 'silver', joinedAt: '2025-12-01', lastVisitAt: '2026-07-08' },
  { id: 'm006', name: '黃先生', phone: '0967-890-123', email: 'huang@example.com', points: 920, balance: 300, totalSpent: 9200, tier: 'silver', joinedAt: '2025-09-15', lastVisitAt: '2026-07-11' },
  { id: 'm007', name: '趙太太', phone: '0978-901-234', points: 2100, balance: 1000, totalSpent: 21000, tier: 'gold', joinedAt: '2025-03-22', lastVisitAt: '2026-07-12' },
  { id: 'm008', name: '孫工程師', phone: '0989-012-345', email: 'sun@example.com', points: 150, balance: 0, totalSpent: 1500, tier: 'bronze', joinedAt: '2026-05-18', lastVisitAt: '2026-07-05' },
];

export const DEMO_STAFF: Staff[] = [
  { id: 's001', username: 'admin', password: 'admin', name: '管理員 Sean', role: 'admin', active: true, clockedIn: false, createdAt: '2025-01-01' },
  { id: 's002', username: 'manager', password: '1234', name: '王店長', role: 'manager', active: true, clockedIn: true, clockInTime: '2026-07-13T08:00:00', createdAt: '2025-01-01' },
  { id: 's003', username: 'cashier01', password: '1234', name: '小美', role: 'cashier', active: true, clockedIn: false, createdAt: '2025-06-15' },
  { id: 's004', username: 'cashier02', password: '1234', name: '阿明', role: 'cashier', active: true, clockedIn: false, createdAt: '2025-08-20' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'OpenClaw 示範商店',
  storeAddress: '台北市信義區松仁路 100 號',
  storePhone: '02-1234-5678',
  taxRate: 0.05,
  taxInclusive: true,
  receiptFooter: '感謝您的光臨，期待下次再為您服務！',
  currency: 'NT$',
  pointsPerDollar: 0.1,
  lowStockThreshold: 10,
};

// 過去 30 天的歷史交易 - 用來跑報表
export function generateDemoTransactions(): Transaction[] {
  const products = DEMO_PRODUCTS;
  const members = DEMO_MEMBERS;
  const staff = DEMO_STAFF.filter(s => s.role !== 'admin');

  const txs: Transaction[] = [];
  const now = new Date('2026-07-13T18:00:00');
  const paymentMethods: Array<'cash' | 'credit_card' | 'line_pay' | 'jkopay'> = ['cash', 'credit_card', 'line_pay', 'jkopay'];

  for (let day = 29; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    // 平日 20-40 筆，假日 30-60 筆
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const txCount = isWeekend
      ? Math.floor(Math.random() * 30) + 30
      : Math.floor(Math.random() * 20) + 20;

    for (let i = 0; i < txCount; i++) {
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = product.price * quantity;
        subtotal += itemSubtotal;
        items.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: itemSubtotal,
        });
      }

      const member = Math.random() < 0.4 ? members[Math.floor(Math.random() * members.length)] : undefined;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const cashier = staff[Math.floor(Math.random() * staff.length)];

      const hour = Math.floor(Math.random() * 12) + 8; // 8:00 - 20:00
      const minute = Math.floor(Math.random() * 60);
      const txDate = new Date(date);
      txDate.setHours(hour, minute, 0, 0);

      const total = subtotal;
      const paidAmount = paymentMethod === 'cash' ? Math.ceil(total / 100) * 100 : total;

      txs.push({
        id: `tx_${date.toISOString().slice(0, 10)}_${i}`,
        orderNo: `${date.toISOString().slice(2, 10).replace(/-/g, '')}${String(i).padStart(4, '0')}`,
        items,
        subtotal,
        discount: 0,
        tax: 0,
        total,
        paymentMethod,
        paidAmount,
        change: paymentMethod === 'cash' ? paidAmount - total : 0,
        memberId: member?.id,
        memberName: member?.name,
        staffId: cashier.id,
        staffName: cashier.name,
        status: 'completed',
        createdAt: txDate.toISOString(),
      });
    }
  }

  return txs;
}