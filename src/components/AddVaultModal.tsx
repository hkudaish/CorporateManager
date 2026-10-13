import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution, VaultAccount } from '../types';
import { TODAY_STR } from '../utils/helpers';

interface AddVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (account: VaultAccount) => void;
}

export const AddVaultModal: React.FC<AddVaultModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    platform: '',
    username: '',
    password: '',
    url: '',
    instId: institutions[0]?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.username || !form.password) return;

    const newVault: VaultAccount = {
      id: Date.now(),
      platform: form.platform,
      username: form.username,
      password: form.password,
      url: form.url || `${form.platform.toLowerCase().replace(/\s+/g, '')}.gov.sa`,
      updated: TODAY_STR,
      instId: Number(form.instId),
    };

    onAdd(newVault);
    onClose();
    setForm({
      platform: '',
      username: '',
      password: '',
      url: '',
      instId: institutions[0]?.id || 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة حساب إلى خزنة البيانات" subtitle="حفظ بيانات الدخول للمنصات الحكومية والبنوك بتشفير آمن" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">اسم المنصة / البوابة *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="مثال: أبشر أعمال، منصة قوى، ZATCA، التأمينات، البنك الأهلي..."
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم المستخدم / الهوية *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Username أو رقم الهوية"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">كلمة المرور المشفرة *</label>
            <input
              required
              type="password"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الرابط / الموقع الإلكتروني</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="مثال: business.absher.sa"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المنشأة المالكة</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.instId}
              onChange={(e) => setForm({ ...form, instId: Number(e.target.value) })}
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 flex gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors"
          >
            حفظ في الخزنة
          </button>
        </div>
      </form>
    </Modal>
  );
};
