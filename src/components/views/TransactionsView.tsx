'use client';

import { useState, useMemo } from 'react';
import { usePOSStore } from '@/lib/store';
import { fmtMoney, fmtTime, fmtShortDate, PAYMENT_LABELS } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { Search, Eye, X, Undo2, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export default function TransactionsView() {
  const transactions = usePOSStore(s => s.transactions);
  const voidTransaction = usePOSStore(s => s.voidTransaction);
  const refundTransaction = usePOSStore(s => s.refundTransaction);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded' | 'voided'>('all');
  const [viewing, setViewing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (q) {
        const qLower = q.toLowerCase();
        if (
          !tx.orderNo.toLowerCase().includes(qLower) &&
          !(tx.memberName?.toLowerCase().includes(qLower)) &&
          !(tx.staffName.toLowerCase().includes(qLower))
        ) return false;
      }
      return true;
    });
  }, [transactions, q, statusFilter]);

  const totals = useMemo(() => ({
    count: filtered.length,
    revenue: filtered.reduce((s, t) => s + (t.status === 'completed' ? t.total : 0), 0),
    avg: filtered.length > 0 ? filtered.reduce((s, t) => s + t.total, 0) / filtered.length : 0,
  }), [filtered]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">交易紀錄</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {totals.count} 筆 · 總營收 {fmtMoney(totals.revenue)} · 平均客單 {fmtMoney(totals.avg)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋訂單編號、會員、員工"
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="搜尋訂單編號、會員、員工"
              />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'refunded' | 'voided')}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">全部狀態</option>
          <option value="completed">已完成</option>
          <option value="refunded">已退款</option>
          <option value="voided">已作廢</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">訂單編號</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">時間</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">會員</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">收銀員</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">付款</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">金額</th>
              <th className="text-center px-3 py-2 font-medium text-slate-600">狀態</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice(0, 100).map(tx => (
              <tr key={tx.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">{tx.orderNo}</td>
                <td className="px-3 py-2 text-xs text-slate-600">
                  {format(parseISO(tx.createdAt), 'MM/dd HH:mm')}
                </td>
                <td className="px-3 py-2 text-slate-700">{tx.memberName || <span className="text-slate-400">—</span>}</td>
                <td className="px-3 py-2 text-slate-700">{tx.staffName}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-1.5 py-0.5 bg-slate-100 rounded">{PAYMENT_LABELS[tx.paymentMethod]}</span>
                </td>
                <td className="px-3 py-2 text-right font-semibold">{fmtMoney(tx.total)}</td>
                <td className="px-3 py-2 text-center">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  <button aria-label="按鈕"
                    onClick={() => setViewing(tx)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-200">
            顯示前 100 筆，共 {filtered.length} 筆 · 請縮小搜尋範圍
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center text-slate-400 py-12">沒有符合條件的交易</div>
        )}
      </div>

      {viewing && (
        <TransactionDetailModal
          tx={viewing}
          onClose={() => setViewing(null)}
          onRefund={(reason) => {
            if (confirm(`確定退款此筆交易？\n原因：${reason}`)) {
              refundTransaction(viewing.id, reason);
              setViewing(null);
            }
          }}
          onVoid={(reason) => {
            if (confirm(`確定作廢此筆交易？\n原因：${reason}`)) {
              voidTransaction(viewing.id, reason);
              setViewing(null);
            }
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const styles = {
    completed: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-amber-100 text-amber-700',
    voided: 'bg-rose-100 text-rose-700',
  };
  const labels = {
    completed: '完成',
    refunded: '退款',
    voided: '作廢',
  };
  return <span className={cn('px-2 py-0.5 rounded text-xs font-medium', styles[status])}>{labels[status]}</span>;
}

function TransactionDetailModal({ tx, onClose, onRefund, onVoid }: {
  tx: Transaction;
  onClose: () => void;
  onRefund: (reason: string) => void;
  onVoid: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">交易詳情</h3>
            <div className="text-xs text-slate-500 font-mono">{tx.orderNo}</div>
          </div>
          <button aria-label="按鈕" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="text-xs text-slate-500">{format(parseISO(tx.createdAt), 'yyyy-MM-dd HH:mm:ss')}</div>

          <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">收銀員</span>
              <span className="font-medium">{tx.staffName}</span>
            </div>
            {tx.memberName && (
              <div className="flex justify-between">
                <span className="text-slate-600">會員</span>
                <span className="font-medium">{tx.memberName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">付款方式</span>
              <span className="font-medium">{PAYMENT_LABELS[tx.paymentMethod]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">狀態</span>
              <StatusBadge status={tx.status} />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">商品明細</div>
            <div className="space-y-1.5">
              {tx.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{fmtMoney(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>小計</span><span>{fmtMoney(tx.subtotal)}</span>
            </div>
            {tx.discount > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>折扣</span><span>-{fmtMoney(tx.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>總計</span><span>{fmtMoney(tx.total)}</span>
            </div>
            {tx.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>收取</span><span>{fmtMoney(tx.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>找零</span><span>{fmtMoney(tx.change)}</span>
                </div>
              </>
            )}
          </div>

          {tx.status !== 'completed' && tx.refundReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
              <div className="text-sm font-medium text-rose-700 mb-1">
                {tx.status === 'refunded' ? '退款' : '作廢'}原因
              </div>
              <div className="text-sm text-rose-600">{tx.refundReason}</div>
              {tx.refundedAt && (
                <div className="text-xs text-rose-500 mt-1">{format(parseISO(tx.refundedAt), 'yyyy-MM-dd HH:mm')}</div>
              )}
            </div>
          )}

          {tx.status === 'completed' && (
            <>
              {!showActions ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setShowActions(true)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-medium"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    退款
                  </button>
                  <button
                    onClick={() => setShowActions(true)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-medium"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    作廢
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="請輸入退款/作廢原因"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => reason.trim() && onRefund(reason)}
                      disabled={!reason.trim()}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      確認退款
                    </button>
                    <button
                      onClick={() => reason.trim() && onVoid(reason)}
                      disabled={!reason.trim()}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      確認作廢
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}