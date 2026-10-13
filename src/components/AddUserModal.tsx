import React, { useState } from 'react';
import { UserPlus, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { User } from '../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    phone?: string;
  }) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<User['role']>('compliance_officer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب ألا تقل عن 6 خانات.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setLoading(true);
      await onAdd({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
      });
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setRole('compliance_officer');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إضافة المستخدم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مستخدم جديد للنظام" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans" dir="rtl">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        {/* User Info */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">الاسم الكامل للمستخدم *</label>
          <div className="relative">
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="مثال: سلمان فهد الدوسري"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <UserIcon size={16} className="absolute right-3.5 top-3 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني المؤسسي *</label>
            <div className="relative">
              <input
                required
                type="email"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                placeholder="salman@corporate.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الجوال</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="05XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Phone size={16} className="absolute right-3.5 top-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">الدور والصلاحية في النظام *</label>
          <div className="relative">
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
            >
              <option value="admin">👑 المدير العام (كامل الصلاحيات والإدارة)</option>
              <option value="compliance_officer">⚖️ مسؤول الامتثال (الوثائق والتراخيص والكوادر)</option>
              <option value="finance_manager">💼 المدير المالي (البنوك والرسوم والمصروفات)</option>
              <option value="viewer">👁️ مستعرض ومدقق (قراءة فقط بدون تعديل)</option>
            </select>
            <Shield size={16} className="absolute right-3.5 top-3 text-slate-400" />
          </div>
        </div>

        {/* Password Fields */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock size={14} className="text-blue-600" />
              تعيين كلمة المرور الأولية *
            </span>
            <button
              type="button"
              onClick={generateStrongPassword}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={12} />
              توليد كلمة مرور عشوائية
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">تأكيد كلمة المرور</label>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={15} />
                إضافة المستخدم
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
