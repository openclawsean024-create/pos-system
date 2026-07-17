'use client';

import { useState } from 'react';
import { usePOSStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { fmtMoney } from '@/lib/utils';
import { Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMPTY_PRODUCT: Omit<Product, 'id' | 'createdAt'> = {
  sku: '', name: '', category: '飲料', price: 0, cost: 0,
  stock: 0, reorderLevel: 10, unit: '個', active: true,
};

export default function InventoryView() {
  const products = usePOSStore(s => s.products);
  const addProduct = usePOSStore(s => s.addProduct);
  const updateProduct = usePOSStore(s => s.updateProduct);
  const deleteProduct = usePOSStore(s => s.deleteProduct);

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState('全部');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const categories = ['全部', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    if (filterCat !== '全部' && p.category !== filterCat) return false;
    if (q && !p.name.includes(q) && !p.sku.includes(q)) return false;
    if (lowStockOnly && p.stock > p.reorderLevel) return false;
    return true;
  });

  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;
  const totalValue = products.reduce((s, p) => s + p.cost * p.stock, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">庫存管理</h2>
          <p className="text-sm text-slate-500 mt-1">共 {products.length} 項商品 · 庫存總值 {fmtMoney(totalValue)}</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新增商品
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <div className="text-sm text-rose-700">有 <strong>{lowStockCount}</strong> 項商品低於安全庫存，請盡快補貨</div>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋商品名稱或 SKU"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="搜尋商品名稱或 SKU"
              />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded"
                aria-label="checkbox 輸入"
              />
          低庫存
        </label>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">SKU</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">商品名稱</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">分類</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">售價</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">成本</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">毛利</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">庫存</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => {
              const margin = p.price > 0 ? ((p.price - p.cost) / p.price * 100) : 0;
              const isLow = p.stock <= p.reorderLevel;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{p.sku}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                  <td className="px-3 py-2 text-slate-600">{p.category}</td>
                  <td className="px-3 py-2 text-right">{fmtMoney(p.price)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{fmtMoney(p.cost)}</td>
                  <td className={cn('px-3 py-2 text-right font-medium', margin > 50 ? 'text-emerald-600' : margin > 30 ? 'text-amber-600' : 'text-rose-600')}>
                    {margin.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', isLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700')}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button aria-label="按鈕" onClick={() => setEditing(p)} className="p-1 hover:bg-slate-100 rounded">
                        <Edit className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`確定刪除「${p.name}」？`)) deleteProduct(p.id);
                        }}
                        className="p-1 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-12">沒有符合條件的商品</div>
        )}
      </div>

      {(editing || creating) && (
        <ProductModal
          product={editing || EMPTY_PRODUCT}
          isNew={creating}
          onSave={(data) => {
            if (creating) addProduct(data);
            else if (editing) updateProduct(editing.id, data);
            setEditing(null);
            setCreating(false);
          }}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, isNew, onSave, onClose }: {
  product: Omit<Product, 'id' | 'createdAt'>;
  isNew: boolean;
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.sku.trim()) {
      alert('請填寫商品名稱與條碼');
      return;
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{isNew ? '新增商品' : '編輯商品'}</h3>
          <button aria-label="按鈕" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">條碼 / SKU</label>
              <input
                type="text"
                value={data.sku}
                onChange={(e) => setData({ ...data, sku: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
              <input
                type="text"
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">商品名稱</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">售價</label>
              <input
                type="number"
                value={data.price}
                onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">成本</label>
              <input
                type="number"
                value={data.cost}
                onChange={(e) => setData({ ...data, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">單位</label>
              <input
                type="text"
                value={data.unit}
                onChange={(e) => setData({ ...data, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">目前庫存</label>
              <input
                type="number"
                value={data.stock}
                onChange={(e) => setData({ ...data, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">低庫存閾值</label>
              <input
                type="number"
                value={data.reorderLevel}
                onChange={(e) => setData({ ...data, reorderLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.active}
              onChange={(e) => setData({ ...data, active: e.target.checked })}
              className="rounded"
                aria-label="checkbox 輸入"
              />
            啟用（在收銀介面顯示）
          </label>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
              取消
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}