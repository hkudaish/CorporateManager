import React from 'react';
import { Modal } from './Modal';
import { Employee, Institution } from '../types';
import { calculateDaysUntil, getUrgencyStatus } from '../utils/helpers';
import { User, Building, Phone, Calendar, Clock, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  institution?: Institution;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  institution,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!employee || !isOpen) return null;

  const daysUntilIqama = calculateDaysUntil(employee.iqamaExpiry);
  const statusInfo = getUrgencyStatus(daysUntilIqama);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee.name} subtitle={employee.role} maxWidth="md">
      <div className="space-y-5 text-xs">
        {/* Status header card */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-200">
            {employee.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-slate-800">{employee.name}</h4>
            <p className="text-slate-500 text-xs mt-0.5">{employee.role} • {institution?.name}</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px]">
            {employee.status}
          </span>
        </div>

        {/* Iqama Alert if foreign */}
        {employee.iqamaExpiry !== '-' && (
          <div className={`p-4 rounded-xl border flex items-center justify-between ${statusInfo.color}`}>
            <div className="flex items-center gap-2">
              <statusInfo.icon size={18} />
              <div>
                <p className="font-bold text-xs">{statusInfo.label} (الإقامة)</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {daysUntilIqama !== null
                    ? daysUntilIqama < 0
                      ? `منتهية منذ ${Math.abs(daysUntilIqama)} يوم`
                      : `متبقي على تجديد الإقامة ${daysUntilIqama} يوم`
                    : 'لا يوجد تاريخ محدد'}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-black px-2 py-0.5 bg-white/80 rounded border">
              {employee.iqama}
            </span>
          </div>
        )}

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">الجنسية</span>
            <span className="font-bold text-slate-800 text-sm">{employee.nationality}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">رقم الهوية / الإقامة</span>
            <span className="font-bold font-mono text-slate-800 text-sm">{employee.iqama}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">تاريخ انتهاء الإقامة</span>
            <span className="font-bold font-mono text-slate-800 text-sm">{employee.iqamaExpiry}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1">تاريخ انتهاء الجواز</span>
            <span className="font-bold font-mono text-slate-800 text-sm">{employee.passExpiry}</span>
          </div>

          {employee.phone && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <Phone size={13} /> رقم الاتصال
              </span>
              <span className="font-bold font-mono text-slate-800 text-sm" dir="ltr">{employee.phone}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`هل أنت متأكد من حذف الموظف ${employee.name}؟`)) {
                onDelete(employee.id);
                onClose();
              }
            }}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors"
          >
            حذف الموظف
          </button>
        </div>
      </div>
    </Modal>
  );
};
