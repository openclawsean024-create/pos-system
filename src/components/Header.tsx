'use client';

import { useState, useEffect } from 'react';
import { usePOSStore } from '@/lib/store';
import { LogOut, Clock, Store } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/utils';

export default function Header() {
  const currentStaff = usePOSStore(s => s.currentStaff);
  const logout = usePOSStore(s => s.logout);
  const settings = usePOSStore(s => s.settings);
  const clockOut = usePOSStore(s => s.clockOut);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Store className="w-5 h-5 text-indigo-600" />
        <div>
          <div className="text-sm font-semibold text-slate-900">{settings.storeName}</div>
          <div className="text-xs text-slate-500">{settings.storePhone}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-mono font-medium text-slate-700">{fmt(now)}</div>
          <div className="text-xs text-slate-500">{now.toLocaleDateString('zh-TW', { weekday: 'long' })}</div>
        </div>

        {currentStaff && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {currentStaff.name.slice(0, 1)}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-slate-900">{currentStaff.name}</div>
                <div className="text-xs text-slate-500">{ROLE_LABELS[currentStaff.role]}</div>
              </div>
              {currentStaff.clockedIn ? (
                <button
                  onClick={() => clockOut(currentStaff.id)}
                  className="ml-2 p-1 hover:bg-slate-200 rounded"
                  title="下班打卡"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              ) : null}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>登出</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}