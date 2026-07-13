'use client';

import { useState, useMemo } from 'react';
import { usePOSStore } from '@/lib/store';
import type { PaymentMethod, Product, Member } from '@/lib/types';
import { fmtMoney, PAYMENT_LABELS } from '@/lib/utils';
import {
  Search, Plus, Minus, Trash2, User, X, Check,
  DollarSign, CreditCard, Smartphone, Wallet, Receipt as ReceiptIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['全部', '飲料', '烘焙', '輕食', '零食', '日用品'];

const paymentIcons: Record<PaymentMethod, React.ElementType> = {
  cash: DollarSign,
  credit_card: CreditCard,
  line_pay: Smartphone,
  jkopay: Wallet,
};

export default function RegisterView() {
  const products = usePOSStore(s => s.products);
  const cart = usePOSStore(s => s.cart);
  const addToCart = usePOSStore(s => s.addToCart);
  const updateCartItem = usePOSStore(s => s.updateCartItem);
  const removeFromCart = usePOSStore(s => s.removeFromCart);
  const clearCart = usePOSStore(s => s.clearCart);
  const discountRate = usePOSStore(s => s.discountRate);
  const applyDiscount = usePOSStore(s => s.applyDiscount);
  const selectedMember = usePOSStore(s => s.selectedMember);
  const selectMember = usePOSStore(s => s.selectMember);
  const checkout = usePOSStore(s => s.checkout);
  const settings = usePOSStore(s => s.settings);

  const [category, setCategory] = useState('全部');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastTx, setLastTx] = useState<{ no: string; total: number; change: number } | null>(null);

  const filtered = useMemo(() => {
    return products.filter(p => p.active).filter(p => {
      if (category !== '全部' && p.category !== category) return false;
      if (search && !p.name.includes(search) && !p.sku.includes(search)) return false;
      return true;
    });
  }, [products, category, search]);

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const tax = settings.taxInclusive ? 0 : afterDiscount * settings.taxRate;
  const total = afterDiscount + tax;

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.sku === barcodeInput.trim() && p.active);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('找不到此條碼的商品');
    }
  };

  const handleCheckout = (method: PaymentMethod, paid: number) => {
    const tx = checkout(method, paid);
    if (tx) {
      setLastTx({ no: tx.orderNo, total: tx.total, change: tx.change });
      setShowCheckout(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* 左側：商品選擇 */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* 條碼掃描 + 搜尋 */}
        <div className="flex gap-2 mb-3">
          <form onSubmit={handleBarcodeSubmit} className="flex-1">
            <div className="relative">
              <ReceiptIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="掃碼或輸入條碼（Enter）"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </form>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋商品名稱或 SKU"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* 分類標籤 */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                category === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 商品網格 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock === 0}
                className={cn(
                  'text-left bg-white border rounded-lg p-3 transition-all',
                  p.stock === 0
                    ? 'opacity-50 cursor-not-allowed border-slate-200'
                    : 'border-slate-200 hover:border-indigo-400 hover:shadow-md active:scale-95'
                )}
              >
                <div className="text-xs text-slate-500 mb-1">{p.category}</div>
                <div className="font-medium text-sm text-slate-900 line-clamp-2 mb-2 h-10">{p.name}</div>
                <div className="flex items-end justify-between">
                  <div className="text-lg font-bold text-indigo-600">{fmtMoney(p.price, '')}</div>
                  <div className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    p.stock <= p.reorderLevel ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  )}>
                    庫存 {p.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-slate-400 py-12">沒有符合條件的商品</div>
          )}
        </div>
      </div>

      {/* 右側：購物車 */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
        {/* 會員選擇 */}
        <div className="p-3 border-b border-slate-200">
          {selectedMember ? (
            <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {selectedMember.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{selectedMember.name}</div>
                  <div className="text-xs text-indigo-600">{selectedMember.tier.toUpperCase()} · 點數 {selectedMember.points}</div>
                </div>
              </div>
              <button onClick={() => selectMember(null)} className="p-1 hover:bg-indigo-100 rounded">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMemberPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
            >
              <User className="w-4 h-4" />
              選擇會員（累積點數）
            </button>
          )}
        </div>

        {/* 購物車清單 */}
        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <ReceiptIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <div className="text-sm">購物車是空的</div>
              <div className="text-xs mt-1">點擊商品加入</div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                    <div className="text-xs text-slate-500">{fmtMoney(item.price)} × {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-slate-900">{fmtMoney(item.subtotal)}</div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 折扣 */}
        {cart.length > 0 && (
          <div className="px-3 py-2 border-t border-slate-200 flex gap-1.5">
            {[0, 0.05, 0.1, 0.2].map(rate => (
              <button
                key={rate}
                onClick={() => applyDiscount(rate)}
                className={cn(
                  'flex-1 py-1 rounded text-xs font-medium',
                  discountRate === rate
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {rate === 0 ? '無折扣' : `${(rate * 100).toFixed(0)}% OFF`}
              </button>
            ))}
          </div>
        )}

        {/* 金額明細 */}
        <div className="px-3 py-2 border-t border-slate-200 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>小計</span>
            <span>{fmtMoney(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>折扣 ({(discountRate * 100).toFixed(0)}%)</span>
              <span>-{fmtMoney(discount)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>營業稅 ({(settings.taxRate * 100).toFixed(0)}%)</span>
              <span>{fmtMoney(tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-1 border-t border-slate-200 text-slate-900">
            <span>總計</span>
            <span>{fmtMoney(total)}</span>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="p-3 border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="px-4 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-medium"
          >
            清空
          </button>
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            結帳
          </button>
        </div>
      </div>

      {/* 會員選擇 Modal */}
      {showMemberPicker && (
        <MemberPicker
          onClose={() => setShowMemberPicker(false)}
          onSelect={(m) => {
            selectMember(m);
            setShowMemberPicker(false);
          }}
        />
      )}

      {/* 結帳 Modal */}
      {showCheckout && (
        <CheckoutModal
          total={total}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleCheckout}
        />
      )}

      {/* 交易完成 Modal */}
      {lastTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">交易完成</div>
            <div className="text-sm text-slate-500 mb-4">訂單編號 {lastTx.no}</div>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">應收</span>
                <span className="font-medium">{fmtMoney(lastTx.total)}</span>
              </div>
              {lastTx.change > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">找零</span>
                  <span className="font-medium text-emerald-600">{fmtMoney(lastTx.change)}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setLastTx(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium"
            >
              繼續下一筆
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// === 會員選擇 Modal ===
function MemberPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (m: Member) => void }) {
  const members = usePOSStore(s => s.members);
  const [q, setQ] = useState('');
  const filtered = members.filter(m =>
    m.name.includes(q) || m.phone.includes(q)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">選擇會員</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋姓名或手機"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-12">找不到會員</div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg text-left"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium">
                  {m.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">點數</div>
                  <div className="text-sm font-semibold text-indigo-600">{m.points}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// === 結帳 Modal ===
function CheckoutModal({ total, onClose, onConfirm }: {
  total: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, paid: number) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [paid, setPaid] = useState(total);

  const change = method === 'cash' ? Math.max(0, paid - total) : 0;
  const quickAmounts = method === 'cash'
    ? [total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000].filter((v, i, arr) => arr.indexOf(v) === i)
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">結帳</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500 mb-1">應收金額</div>
            <div className="text-4xl font-bold text-indigo-600">{fmtMoney(total)}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-slate-700 mb-2">付款方式</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(m => {
                const Icon = paymentIcons[m];
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setMethod(m);
                      setPaid(total);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium',
                      method === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {PAYMENT_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {method === 'cash' && (
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-700 mb-2">收取金額</div>
              <input
                type="number"
                value={paid}
                onChange={(e) => setPaid(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium text-right"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {quickAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setPaid(a)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium"
                  >
                    {fmtMoney(a)}
                  </button>
                ))}
              </div>
              {change > 0 && (
                <div className="mt-3 bg-emerald-50 px-3 py-2 rounded-lg flex justify-between">
                  <span className="text-sm text-emerald-700">找零</span>
                  <span className="text-lg font-bold text-emerald-600">{fmtMoney(change)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
            取消
          </button>
          <button
            onClick={() => onConfirm(method, paid)}
            disabled={method === 'cash' && paid < total}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            確認收款
          </button>
        </div>
      </div>
    </div>
  );
}