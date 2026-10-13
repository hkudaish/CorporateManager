import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution, Expense } from '../types';
import { TODAY_STR } from '../utils/helpers';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (expense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    type: '',
    category: 'رسوم حكومية',
    amount: '',
    dueDate: TODAY_STR,
    status: 'مستحق' as const,
    payee: '',
    instId: institutions[0]?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.amount || !form.payee) return;

    const newExpense: Expense = {
      id: Date.now(),
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      dueDate: form.dueDate,
      status: form.status,
      payee: form.payee,
      instId: Number(form.instId),
    };

    onAdd(newExpense);
    onClose();
    setForm({
      type: '',
      category: 'رسوم حكومية',
      amount: '',
      dueDate: TODAY_STR,
      status: 'مستحق',
      payee: '',
      instId: institutions[0]?.id || 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل التزام أو مصروف مالي" subtitle="إضافة رسوم حكومية، إيجار، أو فواتير مستحقة" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">بيان المصروف / الالتزام *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: رسوم تجديد اشتراك الغرفة التجارية، دفعة إيجار..."
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المبلغ المطلوب (ريال) *</label>
            <input
              required
              type="number"
              min="0"
              step="any"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تصنيف المصروف</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>رسوم حكومية</option>
              <option>إيجارات</option>
              <option>تأمينات ورواتب</option>
              <option>غرامات وتراخيص</option>
              <option>فواتير وتشغيل</option>
              <option>أصول رأسمالية</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الجهة المستفيدة / الدائنة *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: وزارة التجارة، شركة العقار..."
              value={form.payee}
              onChange={(e) => setForm({ ...form, payee: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المنشأة المسؤولة</label>
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق *</label>
            <input
              required
              type="date"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">حالة السداد</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="مستحق">مستحق</option>
              <option value="متأخر">متأخر</option>
              <option value="مدفوع">مدفوع ومسدد</option>
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
            حفظ الالتزام
          </button>
        </div>
      </form>
    </Modal>
  );
};
