'use client';

import { useState } from 'react';
import { usePOSStore } from '@/lib/store';
import { ShoppingBag, Lock, User } from 'lucide-react';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = usePOSStore(s => s.login);
  const staff = usePOSStore(s => s.staff);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(username, password)) {
      setError('帳號或密碼錯誤');
    }
  };

  const quickLogin = (un: string, pw: string) => {
    setUsername(un);
    setPassword(pw);
    if (login(un, pw)) {
      setError('');
    } else {
      setError('登入失敗');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">POS 收銀管理系統</h1>
          <p className="text-sm text-slate-500 mt-1">全通路零售一站搞定</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">帳號</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="請輸入帳號"
                autoFocus
                aria-label="請輸入帳號"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="請輸入密碼"
                aria-label="請輸入密碼"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            登入
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">測試帳號（點擊快速登入）：</p>
          <div className="grid grid-cols-2 gap-2">
            {staff.filter(s => s.active).map(s => (
              <button aria-label="按鈕"
                key={s.id}
                onClick={() => quickLogin(s.username, s.password || '')}
                className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                <div className="font-medium">{s.username}</div>
                <div className="text-slate-500">{s.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}