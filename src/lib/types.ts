// POS 系統核心型別定義

export interface Product {
  id: string;
  sku: string;          // 條碼/SKU
  name: string;
  category: string;
  price: number;        // 售價
  cost: number;         // 成本
  stock: number;
  reorderLevel: number; // 低庫存閾值
  unit: string;         // 單位（個/瓶/包）
  image?: string;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'line_pay' | 'jkopay';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;        // 累積點數
  balance: number;       // 儲值卡餘額
  totalSpent: number;    // 累計消費
  tier: 'bronze' | 'silver' | 'gold' | 'vip';
  joinedAt: string;
  lastVisitAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  orderNo: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  change: number;
  memberId?: string;
  memberName?: string;
  staffId: string;
  staffName: string;
  status: 'completed' | 'refunded' | 'voided';
  createdAt: string;
  refundedAt?: string;
  refundReason?: string;
}

export type StaffRole = 'admin' | 'cashier' | 'manager';

export interface Staff {
  id: string;
  username: string;
  password?: string; // demo only
  name: string;
  role: StaffRole;
  active: boolean;
  clockedIn?: boolean;
  clockInTime?: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  totalTransactions: number;
  status: 'open' | 'closed';
}

export interface AppSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;        // 營業稅率（如 0.05）
  taxInclusive: boolean;  // 價格是否內含稅
  receiptFooter: string;
  currency: string;
  pointsPerDollar: number; // 每元累積點數
  lowStockThreshold: number;
}

export type View =
  | 'register'
  | 'inventory'
  | 'members'
  | 'transactions'
  | 'analytics'
  | 'staff'
  | 'ai_assistant'
  | 'settings';