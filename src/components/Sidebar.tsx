'use client';

import { usePOSStore } from '@/lib/store';
import type { View } from '@/lib/types';
import {
  ShoppingCart, Package, Users, Receipt, BarChart3,
  UserCog, Sparkles, Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS: Array<{ view: View; label: string; icon: React.ElementType; adminOnly?: boolean }> = [
  { view: 'register', label: '收銀', icon: ShoppingCart },
  { view: 'inventory', label: '庫存', icon: Package },
  { view: 'members', label: '會員', icon: Users },
  { view: 'transactions', label: '交易', icon: Receipt },
  { view: 'analytics', label: '報表', icon: BarChart3 },
  { view: 'staff', label: '員工', icon: UserCog, adminOnly: true },
  { view: 'ai_assistant', label: 'AI 助理', icon: Sparkles },
  { view: 'settings', label: '設定', icon: SettingsIcon, adminOnly: true },
];

export default function Sidebar() {
  const currentView = usePOSStore(s => s.currentView);
  const setView = usePOSStore(s => s.setView);
  const currentStaff = usePOSStore(s => s.currentStaff);

  const isAdmin = currentStaff?.role === 'admin';

  return (
    <aside className="w-56 bg-slate-900 text-white flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">POS System</div>
            <div className="text-xs text-slate-400">v0.1 MVP</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const Icon = item.icon;
          const active = currentView === item.view;
          return (
            <button aria-label="按鈕"
              key={item.view}
              onClick={() => setView(item.view)}
              className={cn(
                'w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors',
                active
                  ? 'bg-indigo-600 text-white border-l-4 border-indigo-300'
                  : 'text-slate-300 hover:bg-slate-800 border-l-4 border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500">
        <div>© 2026 OpenClaw</div>
      </div>
    </aside>
  );
}