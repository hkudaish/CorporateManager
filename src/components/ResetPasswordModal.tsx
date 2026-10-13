import React, { useState } from 'react';
import { Key, Lock, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { User } from '../types';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onReset: (userId: number, newPassword: string) => Promise<void>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onReset,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setLoading(true);
      await onReset(user.id, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إعادة ضبط كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إعادة ضبط كلمة المرور للمستخدم" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans" dir="rtl">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
          <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">أنت على وشك تعيين كلمة مرور جديدة للمستخدم:</p>
            <p className="font-mono text-[11px] mt-0.5 text-amber-800">{user.name} ({user.email})</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-700">كلمة المرور الجديدة *</label>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={12} />
              توليد كلمة مرور قوية
            </button>
          </div>

          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-10 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة *</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key size={15} />
                تأكيد إعادة التعيين
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
