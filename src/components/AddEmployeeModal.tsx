import React, { useState } from 'react';
import { Modal } from './Modal';
import { Institution, Employee } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (emp: Employee) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    name: '',
    role: '',
    nationality: 'السعودية',
    iqama: '',
    iqamaExpiry: '',
    passExpiry: '',
    status: 'على رأس العمل' as const,
    phone: '',
    instId: institutions[0]?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;

    const newEmp: Employee = {
      id: Date.now(),
      name: form.name,
      role: form.role,
      nationality: form.nationality,
      iqama: form.iqama || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      iqamaExpiry: form.nationality === 'السعودية' && !form.iqamaExpiry ? '-' : form.iqamaExpiry,
      passExpiry: form.passExpiry || '-',
      status: form.status,
      phone: form.phone,
      instId: Number(form.instId),
    };

    onAdd(newEmp);
    onClose();
    setForm({
      name: '',
      role: '',
      nationality: 'السعودية',
      iqama: '',
      iqamaExpiry: '',
      passExpiry: '',
      status: 'على رأس العمل',
      phone: '',
      instId: institutions[0]?.id || 1,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موظف جديد" subtitle="تسجيل بيانات العاملين والإقامات والجوازات" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم الموظف بالكامل *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: محمد عبدالله السبيعي"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي *</label>
            <input
              required
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: مدير مشتريات، مهندس، محاسب..."
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الجنسية</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="السعودية، مصر، الهند..."
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الهوية / الإقامة</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="10XXXXXXXX أو 2XXXXXXXXX"
              value={form.iqama}
              onChange={(e) => setForm({ ...form, iqama: e.target.value })}
            />
          </div>

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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الإقامة (إن وجد)</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.iqamaExpiry}
              onChange={(e) => setForm({ ...form, iqamaExpiry: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الجواز</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.passExpiry}
              onChange={(e) => setForm({ ...form, passExpiry: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">حالة العمل</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="على رأس العمل">على رأس العمل</option>
              <option value="إجازة">إجازة</option>
              <option value="منتدب">منتدب</option>
              <option value="منتهي">منتهي العقد</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الجوال (اختياري)</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="05XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
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
            حفظ الموظف
          </button>
        </div>
      </form>
    </Modal>
  );
};
