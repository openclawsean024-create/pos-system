'use client';
import { useState } from 'react';
import { usePOSStore } from '@/lib/store';
import type { Staff, StaffRole } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/utils';
import { Plus, Edit, Trash2, X, UserCheck, UserX } from 'lucide-react';

export default function StaffView() {
  const staff = usePOSStore(s => s.staff);
  const transactions = usePOSStore(s => s.transactions);
  const addStaff = usePOSStore(s => s.addStaff);
  const updateStaff = usePOSStore(s => s.updateStaff);
  const deleteStaff = usePOSStore(s => s.deleteStaff);
  const clockIn = usePOSStore(s => s.clockIn);
  const clockOut = usePOSStore(s => s.clockOut);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [creating, setCreating] = useState(false);

  const stats = staff.map(s => ({
    ...s,
    txCount: transactions.filter(t => t.staffId === s.id && t.status === 'completed').length,
    totalSales: transactions.filter(t => t.staffId === s.id && t.status === 'completed').reduce((sum, t) => sum + t.total, 0),
  })).sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">員工管理</h2>
          <p className="text-sm text-slate-500 mt-1">共 {staff.length} 位 · {staff.filter(s => s.clockedIn).length} 人值班</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" />新增
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${s.role === 'admin' ? 'bg-rose-500' : s.role === 'manager' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>{s.name.slice(0, 1)}</div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-slate-500">@{s.username} · {ROLE_LABELS[s.role]}</div>
                </div>
              </div>
              {s.clockedIn ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">值班</span> : <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">離線</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-center text-sm">
              <div className="bg-slate-50 rounded p-2"><div className="text-xs text-slate-500">交易</div><div className="font-bold">{s.txCount}</div></div>
              <div className="bg-slate-50 rounded p-2"><div className="text-xs text-slate-500">營收</div><div className="font-bold text-emerald-600">NT$ {s.totalSales.toLocaleString()}</div></div>
            </div>
            <div className="flex gap-1">
              {s.clockedIn ? <button onClick={() => clockOut(s.id)} className="flex-1 text-xs px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded"><UserX className="w-3 h-3 inline" /> 下班</button> : <button onClick={() => clockIn(s.id)} className="flex-1 text-xs px-2 py-1.5 bg-emerald-50 text-emerald-700 rounded"><UserCheck className="w-3 h-3 inline" /> 上班</button>}
              <button onClick={() => setEditing(s)} className="text-xs px-2 py-1.5 bg-slate-100 rounded"><Edit className="w-3 h-3" /></button>
              {s.role !== 'admin' && <button onClick={() => { if (confirm('刪除？')) deleteStaff(s.id); }} className="text-xs px-2 py-1.5 bg-rose-50 text-rose-700 rounded"><Trash2 className="w-3 h-3" /></button>}
            </div>
          </div>
        ))}
      </div>
      {(editing || creating) && <StaffModal staff={editing || { username: '', password: '1234', name: '', role: 'cashier', active: true }} isNew={creating} onSave={(d) => { if (creating) addStaff(d); else if (editing) updateStaff(editing.id, d); setEditing(null); setCreating(false); }} onClose={() => { setEditing(null); setCreating(false); }} />}
    </div>
  );
}

function StaffModal({ staff, isNew, onSave, onClose }: { staff: Partial<Staff>; isNew: boolean; onSave: (d: Omit<Staff, 'id' | 'createdAt'>) => void; onClose: () => void }) {
  const [data, setData] = useState({ username: staff.username || '', password: staff.password || '1234', name: staff.name || '', role: (staff.role || 'cashier') as StaffRole, active: staff.active !== false });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">{isNew ? '新增員工' : '編輯員工'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!data.username || !data.name) { alert('請填寫'); return; } onSave(data); }} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm block mb-1">帳號</label><input value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
            <div><label className="text-sm block mb-1">姓名</label><input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm block mb-1">密碼</label><input value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
            <div><label className="text-sm block mb-1">角色</label><select value={data.role} onChange={(e) => setData({ ...data, role: e.target.value as StaffRole })} className="w-full px-3 py-2 border rounded"><option value="cashier">收銀員</option><option value="manager">店長</option><option value="admin">管理員</option></select></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.active} onChange={(e) => setData({ ...data, active: e.target.checked })} />啟用</label>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">取消</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
