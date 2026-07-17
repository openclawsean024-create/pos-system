'use client';

import { useMemo, useState } from 'react';
import { usePOSStore } from '@/lib/store';
import { fmtMoney, fmtNumber } from '@/lib/utils';
import { TrendingUp, DollarSign, Users, ShoppingBag, Award, Calendar } from 'lucide-react';
import { format, parseISO, isToday, isThisWeek, isThisMonth, startOfDay, subDays } from 'date-fns';

export default function AnalyticsView() {
  const transactions = usePOSStore(s => s.transactions);
  const products = usePOSStore(s => s.products);
  const members = usePOSStore(s => s.members);
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.status !== 'completed') return false;
      const d = parseISO(tx.createdAt);
      if (range === 'today') return isToday(d);
      if (range === 'week') return isThisWeek(d);
      if (range === 'month') return isThisMonth(d);
      return true;
    });
  }, [transactions, range]);

  const stats = useMemo(() => {
    const revenue = filtered.reduce((s, t) => s + t.total, 0);
    const count = filtered.length;
    const avg = count > 0 ? revenue / count : 0;
    const uniqueMembers = new Set(filtered.map(t => t.memberId).filter(Boolean)).size;

    // 付款方式分佈
    const byPayment: Record<string, number> = {};
    filtered.forEach(t => {
      byPayment[t.paymentMethod] = (byPayment[t.paymentMethod] || 0) + t.total;
    });

    // 每日營收（最近 14 天）
    const daily: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date('2026-07-13'), i));
      daily[format(d, 'MM/dd')] = 0;
    }
    transactions.filter(t => t.status === 'completed').forEach(t => {
      const d = parseISO(t.createdAt);
      if (d >= subDays(new Date('2026-07-13'), 13)) {
        const key = format(d, 'MM/dd');
        daily[key] = (daily[key] || 0) + t.total;
      }
    });

    // 熱銷商品
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    filtered.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // 會員消費排行
    const memberSpending: Record<string, { name: string; total: number; count: number }> = {};
    filtered.forEach(t => {
      if (!t.memberId || !t.memberName) return;
      if (!memberSpending[t.memberId]) {
        memberSpending[t.memberId] = { name: t.memberName, total: 0, count: 0 };
      }
      memberSpending[t.memberId].total += t.total;
      memberSpending[t.memberId].count += 1;
    });
    const topMembers = Object.values(memberSpending).sort((a, b) => b.total - a.total).slice(0, 5);

    // 毛利估算
    const totalCost = filtered.reduce((sum, t) => {
      return sum + t.items.reduce((s, i) => {
        const p = products.find(pp => pp.id === i.productId);
        return s + (p?.cost || 0) * i.quantity;
      }, 0);
    }, 0);
    const grossProfit = revenue - totalCost;
    const margin = revenue > 0 ? (grossProfit / revenue * 100) : 0;

    return { revenue, count, avg, uniqueMembers, byPayment, daily, topProducts, topMembers, grossProfit, margin };
  }, [filtered, products]);

  const maxDaily = Math.max(...Object.values(stats.daily), 1);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">報表中心</h2>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {([
            ['today', '今日'],
            ['week', '本週'],
            ['month', '本月'],
            ['all', '全部'],
          ] as const).map(([key, label]) => (
            <button aria-label="按鈕"
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                range === key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 核心指標 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          label="營收"
          value={fmtMoney(stats.revenue)}
          color="emerald"
        />
        <StatCard
          icon={ShoppingBag}
          label="訂單數"
          value={fmtNumber(stats.count)}
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="平均客單"
          value={fmtMoney(stats.avg)}
          color="amber"
        />
        <StatCard
          icon={Users}
          label="活躍會員"
          value={fmtNumber(stats.uniqueMembers)}
          color="purple"
        />
      </div>

      {/* 毛利 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-700">毛利分析</div>
          <div className="text-xs text-slate-500">基於商品成本估算</div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-500">營收</div>
            <div className="text-xl font-bold text-slate-900">{fmtMoney(stats.revenue)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">毛利</div>
            <div className="text-xl font-bold text-emerald-600">{fmtMoney(stats.grossProfit)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">毛利率</div>
            <div className="text-xl font-bold text-indigo-600">{stats.margin.toFixed(1)}%</div>
          </div>
        </div>
        <div className="mt-3 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all"
            style={{ width: `${Math.min(100, stats.margin)}%` }}
          />
        </div>
      </div>

      {/* 每日營收趨勢 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-slate-700">最近 14 天營收趨勢</div>
          <Calendar className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-end gap-1 h-40">
          {Object.entries(stats.daily).map(([date, value]) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-colors"
                  style={{ height: `${(value / maxDaily) * 100}%`, minHeight: '2px' }}
                  title={`${date}: ${fmtMoney(value)}`}
                />
              </div>
              <div className="text-[10px] text-slate-500 -rotate-45 origin-top-left whitespace-nowrap">{date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 熱銷商品 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 mb-3">熱銷商品 TOP 5</div>
          <div className="space-y-2">
            {stats.topProducts.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">尚無資料</div>
            ) : (
              stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500">銷量 {p.qty}</div>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600">{fmtMoney(p.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 會員消費排行 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-700">會員消費排行 TOP 5</div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            {stats.topMembers.length === 0 ? (
              <div className="text-center text-slate-400 py-8 text-sm">尚無會員消費</div>
            ) : (
              stats.topMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.count} 筆交易</div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">{fmtMoney(m.total)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 付款方式分佈 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="text-sm font-medium text-slate-700 mb-3">付款方式分佈</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['cash', 'credit_card', 'line_pay', 'jkopay'] as const).map(method => {
            const amount = stats.byPayment[method] || 0;
            const pct = stats.revenue > 0 ? (amount / stats.revenue * 100) : 0;
            return (
              <div key={method} className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">
                  {method === 'cash' ? '現金' : method === 'credit_card' ? '信用卡' : method === 'line_pay' ? 'Line Pay' : '街口支付'}
                </div>
                <div className="text-lg font-bold text-slate-900">{fmtMoney(amount)}</div>
                <div className="mt-2 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-1">{pct.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'indigo' | 'emerald' | 'amber' | 'purple';
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}