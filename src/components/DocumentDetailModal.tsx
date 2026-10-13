import React from 'react';
import { Modal } from './Modal';
import { DocumentItem, Institution } from '../types';
import { calculateDaysUntil, getUrgencyStatus, TODAY_STR } from '../utils/helpers';
import { FileText, Calendar, Building, User, Clock, ShieldCheck, Download, AlertCircle, Paperclip } from 'lucide-react';
import { api } from '../services/api';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  institution?: Institution;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  institution,
  isOpen,
  onClose,
  onDelete,
}) => {
  if (!document || !isOpen) return null;

  const daysUntil = calculateDaysUntil(document.expiryDate);
  const statusInfo = getUrgencyStatus(daysUntil);

  // Calculate validity percentage
  const issue = new Date(document.issueDate || '2025-01-01').getTime();
  const expiry = new Date(document.expiryDate).getTime();
  const todayTime = new Date(TODAY_STR).getTime();
  const totalDuration = Math.max(1, expiry - issue);
  const elapsed = Math.max(0, todayTime - issue);
  const validityPct = Math.min(100, Math.max(0, Math.round(((totalDuration - elapsed) / totalDuration) * 100)));

  const handleDownload = () => {
    if (document.fileUrl) {
      window.open(api.documents.getDownloadUrl(document.id), '_blank');
    } else {
      // Synthetic export
      const textContent = `وثيقة: ${document.title}\nالنوع: ${document.type}\nالمرجع: ${document.ref}\nالجهة: ${document.issuer}\nالمنشأة: ${institution?.name || '-'}\nتاريخ الانتهاء: ${document.expiryDate}\nالمسؤول: ${document.resPerson}\nملاحظات: ${document.notes || '-'}`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/\s+/g, '_')}_بيانات_الوثيقة.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={document.title} subtitle={document.type} maxWidth="lg">
      <div className="space-y-6">
        {/* Top Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${statusInfo.color}`}>
          <div className="flex items-center gap-2.5">
            <statusInfo.icon size={20} />
            <div>
              <p className="font-bold text-sm">{statusInfo.label}</p>
              <p className="text-xs opacity-80 mt-0.5">
                {daysUntil !== null
                  ? daysUntil < 0
                    ? `منتهية الصلاحية منذ ${Math.abs(daysUntil)} يوم`
                    : `متبقي على الانتهاء ${daysUntil} يوم`
                  : 'تاريخ الصلاحية غير محدد'}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-white/70 shadow-sm">
            {document.ref}
          </span>
        </div>

        {/* Validity Gauge Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>مؤشر فترة الصلاحية المتبقية</span>
            <span>{validityPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                validityPct > 40 ? 'bg-emerald-500' : validityPct > 15 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${validityPct}%` }}
            />
          </div>
        </div>

        {/* Document Specifications Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Building size={13} /> المنشأة المالكة
            </span>
            <span className="font-bold text-slate-800 text-sm">{institution?.name || 'غير محدد'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <ShieldCheck size={13} /> الجهة المصدرة
            </span>
            <span className="font-bold text-slate-800 text-sm">{document.issuer}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Calendar size={13} /> تاريخ الإصدار
            </span>
            <span className="font-bold font-mono text-slate-800 text-sm">{document.issueDate || '—'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Clock size={13} /> تاريخ الانتهاء
            </span>
            <span className="font-bold font-mono text-slate-800 text-sm">{document.expiryDate}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <User size={13} /> المسؤول عن المتابعة والتجديد
            </span>
            <span className="font-bold text-slate-800 text-sm">{document.resPerson}</span>
          </div>
        </div>

        {/* Attached File Storage Box */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${document.fileUrl ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
              <Paperclip size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">
                {document.fileName || 'لا يوجد ملف أصلي مرفق (سجل بيانات فقط)'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {document.fileSize
                  ? `${(document.fileSize / 1024).toFixed(1)} KB • مخزن ومؤمن على خادم PostgreSQL`
                  : 'يمكنك إرفاق ملف الوثيقة الأصلية عند التعديل'}
              </p>
            </div>
          </div>
          {document.fileUrl && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              جاهز للتحميل
            </span>
          )}
        </div>

        {/* Notes if any */}
        {document.notes && (
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">ملاحظات الامتثال:</strong> {document.notes}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
          >
            <Download size={16} />
            {document.fileUrl ? 'تنزيل ملف الوثيقة المرفق' : 'تنزيل ملخص بيانات الوثيقة'}
          </button>
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف هذه الوثيقة من السجلات؟')) {
                onDelete(document.id);
                onClose();
              }
            }}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors"
          >
            حذف السجل
          </button>
        </div>
      </div>
    </Modal>
  );
};
