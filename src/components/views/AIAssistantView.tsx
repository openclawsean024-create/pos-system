'use client';
import { useMemo } from 'react';
import { usePOSStore } from '@/lib/store';
import { fmtMoney } from '@/lib/utils';
import { Sparkles, AlertTriangle, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';
import { parseISO, subDays } from 'date-fns';

export default function AIAssistantView() {
  const transactions = usePOSStore(s => s.transactions);
  const products = usePOSStore(s => s.products);

  const insights = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'completed');
    const now = new Date('2026-07-13T20:00:00');
    const weekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);

    const lowMargin = products.filter(p => p.price > 0 && p.active).map(p => ({ ...p, margin: ((p.price - p.cost) / p.price) * 100 })).filter(p => p.margin < 40).sort((a, b) => a.margin - b.margin).slice(0, 5);

    const lowStock = products.filter(p => p.stock <= p.reorderLevel && p.active).sort((a, b) => (a.stock / Math.max(1, a.reorderLevel)) - (b.stock / Math.max(1, b.reorderLevel))).slice(0, 5);

    const productSales: Record<string, { name: string; thisWeek: number; lastWeek: number }> = {};
    completed.forEach(t => {
      const d = parseISO(t.createdAt);
      t.items.forEach(item => {
        if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, thisWeek: 0, lastWeek: 0 };
        if (d >= weekAgo) productSales[item.productId].thisWeek += item.subtotal;
        else if (d >= twoWeeksAgo) productSales[item.productId].lastWeek += item.subtotal;
      });
    });
    const declining = Object.values(productSales).filter(p => p.lastWeek > 0 && p.thisWeek < p.lastWeek * 0.7).sort((a, b) => (a.thisWeek / Math.max(1, a.lastWeek)) - (b.thisWeek / Math.max(1, b.lastWeek))).slice(0, 5);
    const rising = Object.values(productSales).filter(p => p.lastWeek > 0 && p.thisWeek > p.lastWeek * 1.3).sort((a, b) => (b.thisWeek / b.lastWeek) - (a.thisWeek / Math.max(1, a.lastWeek))).slice(0, 5);

    const memberTotal: Record<string, { name: string; total: number }> = {};
    completed.forEach(t => {
      if (!t.memberId || !t.memberName) return;
      if (!memberTotal[t.memberId]) memberTotal[t.memberId] = { name: t.memberName, total: 0 };
      memberTotal[t.memberId].total += t.total;
    });
    const avgSpend = Object.values(memberTotal).reduce((s, m) => s + m.total, 0) / Math.max(1, Object.keys(memberTotal).length);
    const vipMembers = Object.values(memberTotal).filter(m => m.total > avgSpend * 2).sort((a, b) => b.total - a.total);

    const avgTicket = completed.length > 0 ? completed.reduce((s, t) => s + t.total, 0) / completed.length : 0;
    const lowTicketPct = completed.length > 0 ? (completed.filter(t => t.total < avgTicket * 0.5).length / completed.length * 100) : 0;

    const hourSales: Record<number, number> = {};
    for (let h = 8; h < 20; h++) hourSales[h] = 0;
    completed.forEach(t => { const h = parseISO(t.createdAt).getHours(); if (h >= 8 && h < 20) hourSales[h] = (hourSales[h] || 0) + t.total; });
    const peakHour = Object.entries(hourSales).sort((a, b) => b[1] - a[1])[0];

    return { lowMargin, lowStock, declining, rising, vipMembers, avgTicket, lowTicketPct, peakHour };
  }, [transactions, products]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI 經營助理</h2>
          <p className="text-sm text-slate-500">基於過去 30 天交易資料分析</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <div className="font-semibold text-indigo-900 mb-1">今日重點建議</div>
            <div className="text-sm text-indigo-800">
              平均客單價 <strong>{fmtMoney(insights.avgTicket)}</strong>，{insights.lowTicketPct.toFixed(0)}% 為低價訂單。
              高峰時段為 <strong>{insights.peakHour?.[0]}:00</strong>，建議安排更多人手與促銷。
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard title="低毛利警示" icon={TrendingDown} color="rose" items={insights.lowMargin.map(p => ({ label: p.name, value: `毛利 ${p.margin.toFixed(1)}%`, sub: `售 ${fmtMoney(p.price)} / 成 ${fmtMoney(p.cost)}` }))} empty="所有商品毛利都合理" />
        <InsightCard title="即將缺貨" icon={AlertTriangle} color="amber" items={insights.lowStock.map(p => ({ label: p.name, value: `剩 ${p.stock} ${p.unit}`, sub: `安全庫存 ${p.reorderLevel}` }))} empty="所有商品庫存充足" />
        <InsightCard title="銷售下滑商品" icon={TrendingDown} color="rose" items={insights.declining.map(p => ({ label: p.name, value: `本週 ${fmtMoney(p.thisWeek)}`, sub: `上週 ${fmtMoney(p.lastWeek)}` }))} empty="沒有明顯下滑" />
        <InsightCard title="銷售成長商品" icon={TrendingUp} color="emerald" items={insights.rising.map(p => ({ label: p.name, value: `本週 ${fmtMoney(p.thisWeek)}`, sub: `上週 ${fmtMoney(p.lastWeek)}` }))} empty="尚無明顯成長" />
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-slate-700">高貢獻會員（消費 &gt; 平均 2 倍）</div>
          <div className="text-xs text-slate-500">{insights.vipMembers.length} 位</div>
        </div>
        {insights.vipMembers.length === 0 ? <div className="text-center text-slate-400 py-6 text-sm">尚無符合條件的會員</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {insights.vipMembers.slice(0, 6).map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-sm font-bold text-emerald-600">{fmtMoney(m.total)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InsightCard({ title, icon: Icon, color, items, empty }: { title: string; icon: React.ElementType; color: 'rose' | 'amber' | 'emerald'; items: Array<{ label: string; value: string; sub?: string }>; empty: string }) {
  const colors = { rose: 'bg-rose-50 text-rose-600', amber: 'bg-amber-50 text-amber-600', emerald: 'bg-emerald-50 text-emerald-600' };
  const valColors = { rose: 'text-rose-600', amber: 'text-amber-600', emerald: 'text-emerald-600' };
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}><Icon className="w-4 h-4" /></div>
        <div className="text-sm font-medium text-slate-700">{title}</div>
      </div>
      {items.length === 0 ? <div className="text-center text-slate-400 py-6 text-sm">{empty}</div> : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{item.label}</div>
                {item.sub && <div className="text-xs text-slate-500">{item.sub}</div>}
              </div>
              <div className={`text-sm font-semibold whitespace-nowrap ${valColors[color]}`}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
