import { CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';

export const TODAY_STR = '2026-10-12';
export const TODAY = new Date(TODAY_STR);

export const calculateDaysUntil = (dateString?: string): number | null => {
  if (!dateString || dateString === '-' || dateString.trim() === '') return null;
  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) return null;
  const diffTime = Math.ceil((targetDate.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
  return diffTime;
};

export const getUrgencyStatus = (days: number | null) => {
  if (days === null) {
    return {
      label: 'غير محدد',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeColor: 'bg-slate-500',
      icon: CheckCircle2,
      isAlert: false,
    };
  }
  if (days < 0) {
    return {
      label: 'منتهي الصلاحية',
      color: 'bg-red-50 text-red-700 border-red-200',
      badgeColor: 'bg-red-500',
      icon: XCircle,
      isAlert: true,
    };
  }
  if (days <= 30) {
    return {
      label: 'حرج جداً',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeColor: 'bg-rose-500',
      icon: AlertTriangle,
      isAlert: true,
    };
  }
  if (days <= 90) {
    return {
      label: 'قريب الانتهاء',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-500',
      icon: Clock,
      isAlert: true,
    };
  }
  return {
    label: 'ساري وصالح',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeColor: 'bg-emerald-500',
    icon: CheckCircle2,
    isAlert: false,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const COLOR_THEMES: Record<string, { bg: string; text: string; lightBg: string; border: string; bar: string }> = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', lightBg: 'bg-purple-50', border: 'border-purple-200', bar: 'bg-purple-500' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', lightBg: 'bg-indigo-50', border: 'border-indigo-200', bar: 'bg-indigo-500' },
};

export const getEntityColor = (colorName: string = 'blue') => {
  return COLOR_THEMES[colorName] || COLOR_THEMES.blue;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};
