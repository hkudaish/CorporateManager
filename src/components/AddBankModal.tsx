import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution, BankAccount } from '../types';

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (bank: BankAccount) => void;
}

export const AddBankModal: React.FC<AddBankModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    bank: 'مصرف الراجحي',
    accountName: '',
    iban: '',
    currency: 'SAR',
    status: 'نشط' as const,
    instId: institutions[0]?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bank || !form.accountName || !form.iban) return;

    let cleanIban = form.iban.replace(/\s+/g, '').toUpperCase();
    if (!cleanIban.startsWith('SA')) {
      cleanIban = `SA${cleanIban}`;
    }

    const newBank: BankAccount = {
      id: Date.now(),
      bank: form.bank,
      accountName: form.accountName,
      iban: cleanIban,
      currency: form.currency,
      status: form.status,
      instId: Number(form.instId),
    };

    onAdd(newBank);
    onClose();
    setForm({
      bank: 'مصرف الراجحي',
      accountName: '',
      iban: '',
      currency: 'SAR',
      status: 'نشط',
      instId: institutions[0]?.id || 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة حساب بنكي" subtitle="تسجيل حساب مصرفي جديد ورقم الآيبان الموحد" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">اسم البنك *</label>
          <select
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
          >
            <option>مصرف الراجحي</option>
            <option>البنك الأهلي السعودي (SNB)</option>
            <option>مصرف الإنماء</option>
            <option>بنك الرياض</option>
            <option>بنك البلاد</option>
            <option>البنك الأول (SAB)</option>
            <option>بنك الجزيرة</option>
            <option>بنك الاستثمار السعودي</option>
            <option>بنك الخليج الدولي</option>
            <option>أخرى</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">اسم الحساب الرسمي *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: شركة الأفق التقنية - الحساب التشغيلي"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">رقم الآيبان (IBAN) *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-wider uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="SA0000000000000000000000"
            value={form.iban}
            onChange={(e) => setForm({ ...form, iban: e.target.value })}
          />
          <p className="text-[10px] text-slate-400 mt-1">يبدأ بـ SA متبوعاً بـ 22 رقماً</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المنشأة التابع لها</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">حالة الحساب</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="نشط">نشط وجاري</option>
              <option value="مجمد">مجمد / متوقف</option>
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
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-colors"
          >
            حفظ الحساب
          </button>
        </div>
      </form>
    </Modal>
  );
};
