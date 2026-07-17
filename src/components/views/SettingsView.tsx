'use client';
import { useState } from 'react';
import { usePOSStore } from '@/lib/store';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

export default function SettingsView() {
  const settings = usePOSStore(s => s.settings);
  const updateSettings = usePOSStore(s => s.updateSettings);
  const resetDemo = usePOSStore(s => s.resetDemo);
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">系統設定</h2>
      <p className="text-sm text-slate-500 mb-4">店家資訊、稅率、收據格式</p>

      <div className="bg-white border rounded-lg p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">店家資訊</h3>
          <div className="space-y-3">
            <Field label="店家名稱" value={draft.storeName} onChange={(v) => setDraft({ ...draft, storeName: v })} />
            <Field label="店家地址" value={draft.storeAddress} onChange={(v) => setDraft({ ...draft, storeAddress: v })} />
            <Field label="店家電話" value={draft.storePhone} onChange={(v) => setDraft({ ...draft, storePhone: v })} />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">稅務設定</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">營業稅率 (%)</label><input type="number" step="0.01" value={draft.taxRate * 100} onChange={(e) => setDraft({ ...draft, taxRate: Number(e.target.value) / 100 })} className="w-full px-3 py-2 border rounded-lg text-sm"
                aria-label="number 輸入"
              /></div>
            <div><label className="block text-sm font-medium mb-1">價格含稅？</label><select value={draft.taxInclusive ? 'yes' : 'no'} onChange={(e) => setDraft({ ...draft, taxInclusive: e.target.value === 'yes' })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="yes">內含稅</option><option value="no">外加稅</option></select></div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">會員制度</h3>
          <div><label className="block text-sm font-medium mb-1">每元消費累積點數</label><input type="number" step="0.01" value={draft.pointsPerDollar} onChange={(e) => setDraft({ ...draft, pointsPerDollar: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm"
                aria-label="number 輸入"
              /><div className="text-xs text-slate-500 mt-1">例如 0.1 表示每 10 元累積 1 點</div></div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">收據頁尾訊息</h3>
          <textarea value={draft.receiptFooter} onChange={(e) => setDraft({ ...draft, receiptFooter: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div className="border-t pt-4 flex items-center gap-3">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"><Save className="w-4 h-4" />儲存設定</button>
          {saved && <span className="text-sm text-emerald-600">✓ 已儲存</span>}
        </div>
      </div>

      <div className="bg-white border border-rose-200 rounded-lg p-5 mt-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900">危險操作</h3>
            <p className="text-xs text-rose-700 mt-1">重置 Demo 會清除所有資料並重新載入示範資料</p>
          </div>
        </div>
        <button onClick={() => { if (confirm('確定重置？')) { if (confirm('再次確認？')) resetDemo(); } }} className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium">
          <RefreshCw className="w-4 h-4" />重置 Demo 資料
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm"
                aria-label="text 輸入"
              />
    </div>
  );
}
