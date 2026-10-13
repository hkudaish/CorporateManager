import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Institution, DocumentItem } from '../types';
import { TODAY_STR } from '../utils/helpers';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  onAdd: (formData: FormData, previewDoc: DocumentItem) => Promise<void> | void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  institutions,
  onAdd,
}) => {
  const [form, setForm] = useState({
    title: '',
    type: 'سجل تجاري',
    issuer: 'وزارة التجارة',
    ref: '',
    issueDate: TODAY_STR,
    expiryDate: '',
    instId: institutions[0]?.id || 1,
    resPerson: 'عبدالله محمد',
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.expiryDate) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('issuer', form.issuer);
      formData.append('ref', form.ref || `DOC-${Math.floor(100000 + Math.random() * 900000)}`);
      formData.append('issueDate', form.issueDate || TODAY_STR);
      formData.append('expiryDate', form.expiryDate);
      formData.append('instId', String(form.instId));
      formData.append('resPerson', form.resPerson || 'المسؤول العام');
      formData.append('notes', form.notes || '');

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const previewDoc: DocumentItem = {
        id: Date.now(),
        title: form.title,
        type: form.type,
        issuer: form.issuer,
        ref: form.ref || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate: form.issueDate || TODAY_STR,
        expiryDate: form.expiryDate,
        instId: Number(form.instId),
        resPerson: form.resPerson || 'المسؤول العام',
        notes: form.notes,
        fileName: selectedFile ? selectedFile.name : null,
        fileSize: selectedFile ? selectedFile.size : null,
        mimeType: selectedFile ? selectedFile.type : null,
      };

      await onAdd(formData, previewDoc);
      onClose();

      // Reset
      setForm({
        title: '',
        type: 'سجل تجاري',
        issuer: 'وزارة التجارة',
        ref: '',
        issueDate: TODAY_STR,
        expiryDate: '',
        instId: institutions[0]?.id || 1,
        resPerson: 'عبدالله محمد',
        notes: '',
      });
      setSelectedFile(null);
    } catch (err) {
      console.error('Error submitting doc:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة وثيقة أو ترخيص جديد"
      subtitle="حفظ الوثيقة في قاعدة بيانات PostgreSQL مع إمكانية رفع الملف الأصلي"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">اسم الوثيقة / الترخيص *</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            placeholder="مثال: رخصة البلدية للمقر الرئيسي، شهادة السعودة..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع الوثيقة</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>سجل تجاري</option>
              <option>ضريبة وزكاة</option>
              <option>رخصة بلدية</option>
              <option>عقد إيجار</option>
              <option>تأمينات اجتماعية</option>
              <option>غرفة تجارية</option>
              <option>دفاع مدني</option>
              <option>شهادة توطين</option>
              <option>عقد قانوني</option>
              <option>أخرى</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الجهة الحكومية / المصدرة</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="مثال: أمانة منطقة الرياض، ZATCA..."
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المنشأة المرتبطة</label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
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
            <label className="block font-bold text-slate-700 mb-1">رقم المرجع / الرخصة (اختياري)</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: CR-1010123456"
              value={form.ref}
              onChange={(e) => setForm({ ...form, ref: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ الإصدار</label>
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
            <input
              required
              type="date"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>
        </div>

        {/* File Upload Zone */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">إرفاق الملف والمستند الأصلي (PDF أو صور)</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-xs truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 py-2">
                <UploadCloud className="mx-auto text-slate-400" size={28} />
                <p className="text-xs font-bold text-slate-700">اسحب الملف وأفلته هنا، أو اضغط للتصفح</p>
                <p className="text-[10px] text-slate-400">يدعم PDF، صور التراخيص (PNG, JPG)، ومستندات Word حتى 25 ميجابايت</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">الشخص المسؤول عن المتابعة</label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            placeholder="اسم الموظف أو المعقب المسؤول..."
            value={form.resPerson}
            onChange={(e) => setForm({ ...form, resPerson: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
          <textarea
            rows={2}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"
            placeholder="متطلبات التجديد، منصة التقديم، رسوم متوقعة..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
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
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'حفظ وتخزين الوثيقة'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
