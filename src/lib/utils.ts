// 工具函式
import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// 貨幣格式化
export const fmtMoney = (n: number, currency = 'NT$') => {
  return `${currency}${Math.round(n).toLocaleString('zh-TW')}`;
};

export const fmtNumber = (n: number) => Math.round(n).toLocaleString('zh-TW');

// 日期格式化
export const fmtDate = (date: string | Date, pattern = 'yyyy-MM-dd HH:mm') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhTW });
};

export const fmtShortDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MM/dd', { locale: zhTW });
};

export const fmtTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

// 日期分組判斷
export { isToday, isThisWeek, isThisMonth };

// 付款方式中文
export const PAYMENT_LABELS: Record<string, string> = {
  cash: '現金',
  credit_card: '信用卡',
  line_pay: 'Line Pay',
  jkopay: '街口支付',
};

// 員工角色中文
export const ROLE_LABELS: Record<string, string> = {
  admin: '管理員',
  manager: '店長',
  cashier: '收銀員',
};

// 會員等級中文
export const TIER_LABELS: Record<string, string> = {
  bronze: '銅級',
  silver: '銀級',
  gold: '金級',
  vip: 'VIP',
};

export const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-700',
  silver: 'bg-slate-200 text-slate-700',
  gold: 'bg-yellow-100 text-yellow-700',
  vip: 'bg-purple-100 text-purple-700',
};