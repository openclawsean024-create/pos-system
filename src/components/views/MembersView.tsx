'use client';

import { useState } from 'react';
import { usePOSStore } from '@/lib/store';
import type { Member } from '@/lib/types';
import { fmtMoney, TIER_LABELS, TIER_COLORS } from '@/lib/utils';
import { Plus, Edit, Trash2, X, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MembersView() {
  const members = usePOSStore(s => s.members);
  const addMember = usePOSStore(s => s.addMember);
  const updateMember = usePOSStore(s => s.updateMember);
  const deleteMember = usePOSStore(s => s.deleteMember);
  const topUpMember = usePOSStore(s => s.topUpMember);

  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [toppingUp, setToppingUp] = useState<Member | null>(null);
  const [q, setQ] = useState('');

  const filtered = members.filter(m =>
    !q || m.name.includes(q) || m.phone.includes(q)
  );

  const totalSpent = members.reduce((s, m) => s + m.totalSpent, 0);
  const totalBalance = members.reduce((s, m) => s + m.balance, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">會員管理</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {members.length} 位會員 · 累積消費 {fmtMoney(totalSpent)} · 儲值餘額 {fmtMoney(totalBalance)}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新增會員
        </button>
      </div>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜尋姓名或手機"
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="搜尋姓名或手機"
              />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {m.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.phone}</div>
                </div>
              </div>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', TIER_COLORS[m.tier])}>
                {TIER_LABELS[m.tier]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-slate-50 rounded p-2">
                <div className="text-xs text-slate-500">點數</div>
                <div className="text-sm font-bold text-indigo-600">{m.points}</div>
              </div>
              <div className="bg-slate-50 rounded p-2">
                <div className="text-xs text-slate-500">儲值</div>
                <div className="text-sm font-bold text-emerald-600">{fmtMoney(m.balance)}</div>
              </div>
              <div className="bg-slate-50 rounded p-2">
                <div className="text-xs text-slate-500">累計</div>
                <div className="text-sm font-bold text-slate-700">{fmtMoney(m.totalSpent)}</div>
              </div>
            </div>

            {m.lastVisitAt && (
              <div className="text-xs text-slate-500 mb-3">最後消費：{m.lastVisitAt.slice(0, 10)}</div>
            )}

            <div className="flex gap-1">
              <button
                onClick={() => setToppingUp(m)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
              >
                <Wallet className="w-3 h-3" />
                儲值
              </button>
              <button aria-label="按鈕"
                onClick={() => setEditing(m)}
                className="flex items-center justify-center px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`確定刪除會員「${m.name}」？`)) deleteMember(m.id);
                }}
                className="flex items-center justify-center px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-medium"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-slate-400 py-12">沒有符合條件的會員</div>
      )}

      {(editing || creating) && (
        <MemberModal
          member={editing || {
            name: '', phone: '', email: '', points: 0, balance: 0,
            totalSpent: 0, tier: 'bronze', joinedAt: ''
          }}
          isNew={creating}
          onSave={(data) => {
            if (creating) addMember(data);
            else if (editing) updateMember(editing.id, data);
            setEditing(null);
            setCreating(false);
          }}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}

      {toppingUp && (
        <TopUpModal
          member={toppingUp}
          onConfirm={(amount) => {
            topUpMember(toppingUp.id, amount);
            setToppingUp(null);
          }}
          onClose={() => setToppingUp(null)}
        />
      )}
    </div>
  );
}

function MemberModal({ member, isNew, onSave, onClose }: {
  member: Partial<Member>;
  isNew: boolean;
  onSave: (data: Omit<Member, 'id' | 'joinedAt'>) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState({
    name: member.name || '',
    phone: member.phone || '',
    email: member.email || '',
    points: member.points || 0,
    balance: member.balance || 0,
    totalSpent: member.totalSpent || 0,
    tier: member.tier || 'bronze',
    notes: member.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.phone.trim()) {
      alert('請填寫姓名與電話');
      return;
    }
    onSave(data as Omit<Member, 'id' | 'joinedAt'>);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">{isNew ? '新增會員' : '編輯會員'}</h3>
          <button aria-label="按鈕" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名 *</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">電話 *</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="text 輸入"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="email 輸入"
              />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">點數</label>
              <input
                type="number"
                value={data.points}
                onChange={(e) => setData({ ...data, points: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">儲值</label>
              <input
                type="number"
                value={data.balance}
                onChange={(e) => setData({ ...data, balance: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">累計</label>
              <input
                type="number"
                value={data.totalSpent}
                onChange={(e) => setData({ ...data, totalSpent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

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

function TopUpModal({ member, onConfirm, onClose }: {
  member: Member;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(1000);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">儲值</h3>
          <button aria-label="按鈕" onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="text-center mb-4">
            <div className="text-sm text-slate-500">{member.name}</div>
            <div className="text-xs text-slate-400">目前餘額 {fmtMoney(member.balance)}</div>
          </div>
          <label className="block text-sm font-medium text-slate-700 mb-2">儲值金額</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-3 border border-slate-300 rounded-lg text-2xl font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="number 輸入"
              />
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[500, 1000, 2000, 5000].map(a => (
              <button aria-label="按鈕"
                key={a}
                onClick={() => setAmount(a)}
                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium"
              >
                {fmtMoney(a)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-slate-200 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
            取消
          </button>
          <button
            onClick={() => onConfirm(amount)}
            disabled={amount <= 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 font-medium"
          >
            確認儲值
          </button>
        </div>
      </div>
    </div>
  );
}