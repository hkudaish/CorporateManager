import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution, Transaction } from '../types';
import { TODAY_STR } from '../utils/helpers';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (transaction: Transaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    title: '',
    gov: 'وزارة التجارة - منصة الأعمال',
    ref: '',
    date: TODAY_STR,
    res: 'عبدالله محمد',
    status: 'جديدة' as const,
    priority: 'عالية' as const,
    instId: institutions[0]?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.gov) return;

    const newTr: Transaction = {
      id: Date.now(),
      title: form.title,
      gov: form.gov,
      ref: form.ref || `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      date: form.date,
      res: form.res,
      status: form.status,
      priority: form.priority,
      instId: Number(form.instId),
    };

    onAdd(newTr);
    onClose();
    setForm({
      title: '',
      gov: 'وزارة التجارة - منصة الأعمال',
      ref: '',
      date: TODAY_STR,
      res: 'عبدالله محمد',
      status: 'جديدة',
      priority: 'عالية',
      instId: institutions[0]?.id || 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة معاملة أو طلب حكومي" subtitle="متابعة الطلبات، التراخيص، والاعتراضات لدى الجهات" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">عنوان المعاملة / موضوع الطلب *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: تعديل أنشطة السجل التجاري، اعتراض زكوي، تجديد رخصة الدفاع المدني..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الجهة الحكومية *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="وزارة التجارة، البلدية، قوى، ZATCA..."
              value={form.gov}
              onChange={(e) => setForm({ ...form, gov: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الطلب / المرجع</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="REQ-123456"
              value={form.ref}
              onChange={(e) => setForm({ ...form, ref: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المنشأة المعنية</label>
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
            <label className="block font-bold text-slate-700 mb-1">الموظف المسؤول</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.res}
              onChange={(e) => setForm({ ...form, res: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">حالة المعاملة</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="جديدة">جديدة</option>
              <option value="قيد الإجراء">قيد الإجراء</option>
              <option value="بانتظار مستند">بانتظار مستند أو متطلب</option>
              <option value="مكتملة">مكتملة ومنتهية</option>
              <option value="متأخرة">متأخرة عن الموعد</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">درجة الأهمية</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
            >
              <option value="عالية">عالية جداً (عاجل)</option>
              <option value="متوسطة">متوسطة</option>
              <option value="عادية">عادية</option>
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
            حفظ المعاملة
          </button>
        </div>
      </form>
    </Modal>
  );
};
