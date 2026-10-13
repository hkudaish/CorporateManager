import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution } from '../types';
import { TODAY_STR } from '../utils/helpers';

interface AddInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (institution: Institution) => void;
}

export const AddInstitutionModal: React.FC<AddInstitutionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [form, setForm] = useState({
    name: '',
    type: 'شركة ذات مسؤولية محدودة',
    cr: '',
    taxId: '',
    city: 'الرياض',
    owner: 'عبدالله محمد',
    color: 'blue' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cr) return;

    const newInst: Institution = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      cr: form.cr,
      taxId: form.taxId || `300${Math.floor(10000000 + Math.random() * 90000000)}00003`,
      city: form.city,
      status: 'نشطة',
      estDate: TODAY_STR,
      owner: form.owner,
      color: form.color,
    };

    onAdd(newInst);
    onClose();
    setForm({
      name: '',
      type: 'شركة ذات مسؤولية محدودة',
      cr: '',
      taxId: '',
      city: 'الرياض',
      owner: 'عبدالله محمد',
      color: 'blue',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة كيان مؤسسي أو فرع جديد" subtitle="تسجيل شركة أو مؤسسة جديدة في منظومة الامتثال" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">اسم المنشأة أو الشركة الرسمي *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: شركة الرواد للتطوير التقني ذ.م.م"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم السجل التجاري (CR) *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="1010XXXXXX"
              value={form.cr}
              onChange={(e) => setForm({ ...form, cr: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الرقم الضريبي (ZATCA)</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="300XXXXXXXXXXX3"
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الشكل القانوني</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>شركة ذات مسؤولية محدودة</option>
              <option>مؤسسة فردية</option>
              <option>شركة مساهمة مبسطة</option>
              <option>شركة مساهمة مقفلة</option>
              <option>فرع شركة محلية</option>
              <option>فرع شركة أجنبية</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المدينة / المقر الرئيسي</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="الرياض، جدة، الدمام، الخبر..."
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المالك أو المدير التنفيذي</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="اسم صاحب المؤسسة أو المدير العام"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">اللون المميز للكيان</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value as any })}
            >
              <option value="blue">أزرق ملكي</option>
              <option value="emerald">أخضر زمردي</option>
              <option value="purple">بنفسجي داكن</option>
              <option value="amber">ذهبي كهرماني</option>
              <option value="rose">وردي أنيق</option>
              <option value="indigo">نيلي كلاسيكي</option>
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
            حفظ الكيان
          </button>
        </div>
      </form>
    </Modal>
  );
};
