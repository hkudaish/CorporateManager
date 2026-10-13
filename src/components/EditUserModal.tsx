import React, { useState, useEffect } from 'react';
import { UserCheck, User as UserIcon, Mail, Phone, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { User } from '../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentUser: User | null;
  onUpdate: (id: number, data: {
    name: string;
    email: string;
    role: User['role'];
    phone?: string;
  }) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
  onUpdate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<User['role']>('compliance_officer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setRole(user.role);
      setErrorMsg('');
    }
  }, [user]);

  if (!user) return null;

  const isSelf = currentUser?.id === user.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('الاسم والبريد الإلكتروني حقلان إلزاميان.');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(user.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        phone: phone.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تحديث بيانات المستخدم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`تعديل بيانات المستخدم: ${user.name}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans" dir="rtl">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        {isSelf && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl font-medium text-[11px]">
            ℹ️ أنت تقوم بتعديل حسابك الشخصي الحالي.
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
          <div className="relative">
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
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

        <div>
          <label className="block font-bold text-slate-700 mb-1">الدور والصلاحية في النظام *</label>
          <div className="relative">
            <select
              disabled={isSelf}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-60"
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
          {isSelf && (
            <p className="text-[10px] text-slate-400 mt-1">لا يمكنك تعديل صلاحية حسابك بنفسك لحماية النظام.</p>
          )}
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
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck size={15} />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
