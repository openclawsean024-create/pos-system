'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Product, Member, Transaction, Staff, Shift,
  CartItem, PaymentMethod, AppSettings, View, StaffRole
} from './types';
import {
  DEMO_PRODUCTS, DEMO_MEMBERS, DEMO_STAFF,
  DEFAULT_SETTINGS, generateDemoTransactions
} from './demo-data';

interface POSState {
  // === 資料 ===
  products: Product[];
  members: Member[];
  transactions: Transaction[];
  staff: Staff[];
  shifts: Shift[];
  settings: AppSettings;

  // === UI 狀態 ===
  currentView: View;
  currentStaff: Staff | null;
  cart: CartItem[];
  selectedMember: Member | null;
  discountRate: number;

  // === 初始化 ===
  initialize: () => void;
  resetDemo: () => void;

  // === 視圖 ===
  setView: (view: View) => void;

  // === 登入/登出 ===
  login: (username: string, password: string) => boolean;
  logout: () => void;
  clockIn: (staffId: string) => void;
  clockOut: (staffId: string) => void;

  // === 收銀 ===
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyDiscount: (rate: number) => void;
  selectMember: (member: Member | null) => void;
  checkout: (paymentMethod: PaymentMethod, paidAmount: number) => Transaction | null;
  voidTransaction: (txId: string, reason: string) => void;
  refundTransaction: (txId: string, reason: string) => void;

  // === 商品 CRUD ===
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // === 會員 CRUD ===
  addMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  topUpMember: (id: string, amount: number) => void;

  // === 員工 CRUD ===
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // === 設定 ===
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const generateOrderNo = () => {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${ymd}${String(Date.now()).slice(-4)}`;
};

const calcTier = (totalSpent: number): Member['tier'] => {
  if (totalSpent >= 50000) return 'vip';
  if (totalSpent >= 20000) return 'gold';
  if (totalSpent >= 5000) return 'silver';
  return 'bronze';
};

// Exported for testing — pure helpers
export { generateId, generateOrderNo, calcTier };

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      products: [],
      members: [],
      transactions: [],
      staff: [],
      shifts: [],
      settings: DEFAULT_SETTINGS,

      currentView: 'register',
      currentStaff: null,
      cart: [],
      selectedMember: null,
      discountRate: 0,

      initialize: () => {
        const state = get();
        if (state.products.length === 0) {
          set({
            products: DEMO_PRODUCTS,
            members: DEMO_MEMBERS,
            staff: DEMO_STAFF,
            transactions: generateDemoTransactions(),
          });
        }
      },

      resetDemo: () => {
        localStorage.removeItem('pos-storage');
        set({
          products: DEMO_PRODUCTS,
          members: DEMO_MEMBERS,
          staff: DEMO_STAFF,
          transactions: generateDemoTransactions(),
          shifts: [],
          settings: DEFAULT_SETTINGS,
          cart: [],
          selectedMember: null,
          discountRate: 0,
          currentStaff: null,
        });
      },

      setView: (view) => set({ currentView: view }),

      login: (username, password) => {
        const staff = get().staff.find(
          s => s.username === username && s.password === password && s.active
        );
        if (staff) {
          set({ currentStaff: staff, currentView: 'register', cart: [] });
          return true;
        }
        return false;
      },

      logout: () => set({ currentStaff: null, currentView: 'register', cart: [], selectedMember: null }),

      clockIn: (staffId) => {
        set(state => ({
          staff: state.staff.map(s =>
            s.id === staffId
              ? { ...s, clockedIn: true, clockInTime: new Date().toISOString() }
              : s
          ),
        }));
      },

      clockOut: (staffId) => {
        set(state => ({
          staff: state.staff.map(s =>
            s.id === staffId
              ? { ...s, clockedIn: false, clockInTime: undefined }
              : s
          ),
        }));
      },

      addToCart: (product, quantity = 1) => {
        const cart = [...get().cart];
        const existing = cart.find(i => i.productId === product.id);
        if (existing) {
          existing.quantity += quantity;
          existing.subtotal = existing.price * existing.quantity;
        } else {
          cart.push({
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            quantity,
            subtotal: product.price * quantity,
          });
        }
        set({ cart });
      },

      updateCartItem: (productId, quantity) => {
        const cart = get().cart
          .map(i =>
            i.productId === productId
              ? { ...i, quantity, subtotal: i.price * quantity }
              : i
          )
          .filter(i => i.quantity > 0);
        set({ cart });
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(i => i.productId !== productId) });
      },

      clearCart: () => set({ cart: [], selectedMember: null, discountRate: 0 }),

      applyDiscount: (rate) => set({ discountRate: rate }),

      selectMember: (member) => set({ selectedMember: member }),

      checkout: (paymentMethod, paidAmount) => {
        const { cart, products, members, currentStaff, settings, discountRate, selectedMember } = get();
        if (cart.length === 0 || !currentStaff) return null;

        const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
        const discount = subtotal * discountRate;
        const afterDiscount = subtotal - discount;
        const tax = settings.taxInclusive ? 0 : afterDiscount * settings.taxRate;
        const total = afterDiscount + tax;
        const change = paidAmount - total;

        const tx: Transaction = {
          id: generateId('tx'),
          orderNo: generateOrderNo(),
          items: [...cart],
          subtotal,
          discount,
          tax,
          total,
          paymentMethod,
          paidAmount,
          change: Math.max(0, change),
          memberId: selectedMember?.id,
          memberName: selectedMember?.name,
          staffId: currentStaff.id,
          staffName: currentStaff.name,
          status: 'completed',
          createdAt: new Date().toISOString(),
        };

        // 扣庫存
        const newProducts = products.map(p => {
          const cartItem = cart.find(i => i.productId === p.id);
          if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          return p;
        });

        // 更新會員
        let newMembers = members;
        if (selectedMember) {
          const pointsEarned = Math.floor(total * settings.pointsPerDollar);
          newMembers = members.map(m =>
            m.id === selectedMember.id
              ? {
                  ...m,
                  points: m.points + pointsEarned,
                  totalSpent: m.totalSpent + total,
                  tier: calcTier(m.totalSpent + total),
                  lastVisitAt: new Date().toISOString(),
                }
              : m
          );
        }

        set({
          transactions: [tx, ...get().transactions],
          products: newProducts,
          members: newMembers,
          cart: [],
          selectedMember: null,
          discountRate: 0,
        });

        return tx;
      },

      voidTransaction: (txId, reason) => {
        const tx = get().transactions.find(t => t.id === txId);
        if (!tx || tx.status !== 'completed') return;

        // 還原庫存
        const newProducts = get().products.map(p => {
          const item = tx.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: p.stock + item.quantity };
          return p;
        });

        set({
          transactions: get().transactions.map(t =>
            t.id === txId ? { ...t, status: 'voided', refundReason: reason, refundedAt: new Date().toISOString() } : t
          ),
          products: newProducts,
        });
      },

      refundTransaction: (txId, reason) => {
        const tx = get().transactions.find(t => t.id === txId);
        if (!tx || tx.status !== 'completed') return;

        const newProducts = get().products.map(p => {
          const item = tx.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: p.stock + item.quantity };
          return p;
        });

        let newMembers = get().members;
        if (tx.memberId) {
          newMembers = newMembers.map(m =>
            m.id === tx.memberId
              ? { ...m, totalSpent: Math.max(0, m.totalSpent - tx.total) }
              : m
          );
        }

        set({
          transactions: get().transactions.map(t =>
            t.id === txId ? { ...t, status: 'refunded', refundReason: reason, refundedAt: new Date().toISOString() } : t
          ),
          products: newProducts,
          members: newMembers,
        });
      },

      addProduct: (data) => {
        const product: Product = { ...data, id: generateId('p'), createdAt: new Date().toISOString().slice(0, 10) };
        set({ products: [product, ...get().products] });
      },

      updateProduct: (id, updates) => {
        set({
          products: get().products.map(p => p.id === id ? { ...p, ...updates } : p),
        });
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
      },

      addMember: (data) => {
        const member: Member = {
          ...data,
          id: generateId('m'),
          joinedAt: new Date().toISOString().slice(0, 10),
          tier: calcTier(data.totalSpent),
        };
        set({ members: [member, ...get().members] });
      },

      updateMember: (id, updates) => {
        set({
          members: get().members.map(m => {
            if (m.id !== id) return m;
            const updated = { ...m, ...updates };
            updated.tier = calcTier(updated.totalSpent);
            return updated;
          }),
        });
      },

      deleteMember: (id) => {
        set({ members: get().members.filter(m => m.id !== id) });
      },

      topUpMember: (id, amount) => {
        set({
          members: get().members.map(m =>
            m.id === id ? { ...m, balance: m.balance + amount } : m
          ),
        });
      },

      addStaff: (data) => {
        const staff: Staff = {
          ...data,
          id: generateId('s'),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ staff: [staff, ...get().staff] });
      },

      updateStaff: (id, updates) => {
        set({
          staff: get().staff.map(s => s.id === id ? { ...s, ...updates } : s),
        });
      },

      deleteStaff: (id) => {
        set({ staff: get().staff.filter(s => s.id !== id) });
      },

      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },
    }),
    {
      name: 'pos-storage',
      version: 1,
    }
  )
);