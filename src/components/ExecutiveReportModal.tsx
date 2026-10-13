import React from 'react';
import { Printer, X, Building2, AlertTriangle, CheckCircle2, ShieldCheck, Calendar, DollarSign, Users } from 'lucide-react';
import { Institution, DocumentItem, Employee, Expense, BankAccount } from '../types';
import { calculateDaysUntil, formatCurrency, TODAY_STR } from '../utils/helpers';

interface ExecutiveReportProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  documents: DocumentItem[];
  employees: Employee[];
  expenses: Expense[];
  banks: BankAccount[];
}

export const ExecutiveReportModal: React.FC<ExecutiveReportProps> = ({
  isOpen,
  onClose,
  institutions,
  documents,
  employees,
  expenses,
  banks,
}) => {
  if (!isOpen) return null;

  const urgentDocs = documents.filter((d) => {
    const days = calculateDaysUntil(d.expiryDate);
    return days !== null && days <= 90;
  });

  const expiredDocs = documents.filter((d) => {
    const days = calculateDaysUntil(d.expiryDate);
    return days !== null && days < 0;
  });

  const urgentEmployees = employees.filter((e) => {
    const days = calculateDaysUntil(e.iqamaExpiry);
    return days !== null && days <= 90;
  });

  const pendingExpenses = expenses.filter((e) => e.status !== 'مدفوع');
  const totalPendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Overall compliance score
  const totalTrackedItems = documents.length + employees.filter(e => e.iqamaExpiry !== '-').length;
  const criticalIssuesCount = expiredDocs.length + employees.filter(e => {
    const days = calculateDaysUntil(e.iqamaExpiry);
    return days !== null && days < 0;
  }).length;
  const complianceScore = Math.max(0, Math.round(((totalTrackedItems - criticalIssuesCount) / (totalTrackedItems || 1)) * 100));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 print:shadow-none print:border-none print:max-w-none print:w-full">
          {/* Action Bar (hidden in print) */}
          <div className="no-print bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={22} />
              <span className="font-bold text-sm">معاينة التقرير التنفيذي للامتثال المؤسسي</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-900/40"
              >
                <Printer size={16} /> طباعة أو حفظ كـ PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Report Body */}
          <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900">
            {/* Report Header */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md">
                    م
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">تقرير الامتثال والالتزامات التنفيذي</h1>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">مجموعة الكيانات والمؤسسات التابعة</p>
                  </div>
                </div>
              </div>
              <div className="text-left font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p><span className="text-slate-400">تاريخ الإصدار:</span> {TODAY_STR}</p>
                <p><span className="text-slate-400">المُعِد:</span> الإدارة العامة والامتثال</p>
                <p><span className="text-slate-400">حالة التقرير:</span> سري ومعتمد</p>
              </div>
            </div>

            {/* Top Score Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">مؤشر الامتثال العام</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-black ${complianceScore >= 90 ? 'text-emerald-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                    %{complianceScore}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {complianceScore >= 90 ? 'ممتاز' : complianceScore >= 70 ? 'متوسط' : 'حرج'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي الكيانات النشطة</span>
                <span className="text-3xl font-black text-slate-800 mt-2">{institutions.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">وثائق حرجة / منتهية</span>
                <span className="text-3xl font-black text-red-600 mt-2">{urgentDocs.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي الالتزامات المالية</span>
                <span className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(totalPendingAmount)}</span>
              </div>
            </div>

            {/* Institution Roster */}
            <div>
              <h3 className="text-sm font-black text-slate-900 border-r-4 border-blue-600 pr-2 mb-3">
                ملخص الكيانات القانونية
              </h3>
              <table className="w-full text-xs text-right border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2.5 font-bold">اسم المنشأة</th>
                    <th className="p-2.5 font-bold">السجل التجاري</th>
                    <th className="p-2.5 font-bold">الرقم الضريبي</th>
                    <th className="p-2.5 font-bold">المدينة</th>
                    <th className="p-2.5 font-bold">النوع</th>
                    <th className="p-2.5 font-bold">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {institutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">{inst.name}</td>
                      <td className="p-2.5 font-mono">{inst.cr}</td>
                      <td className="p-2.5 font-mono">{inst.taxId}</td>
                      <td className="p-2.5">{inst.city}</td>
                      <td className="p-2.5 text-slate-600">{inst.type}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${inst.status === 'نشطة' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Critical Expirations (Documents + Iqama) */}
            <div>
              <h3 className="text-sm font-black text-slate-900 border-r-4 border-amber-500 pr-2 mb-3">
                الوثائق والتراخيص ذات الأولوية العاجلة (خلال 90 يوماً)
              </h3>
              {urgentDocs.length > 0 ? (
                <table className="w-full text-xs text-right border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5 font-bold">الوثيقة</th>
                      <th className="p-2.5 font-bold">المؤسسة التابعة</th>
                      <th className="p-2.5 font-bold">الجهة المصدرة</th>
                      <th className="p-2.5 font-bold">تاريخ الانتهاء</th>
                      <th className="p-2.5 font-bold">الأيام المتبقية</th>
                      <th className="p-2.5 font-bold">المسؤول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {urgentDocs.map((doc) => {
                      const days = calculateDaysUntil(doc.expiryDate) ?? 0;
                      return (
                        <tr key={doc.id} className={days < 0 ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                          <td className="p-2.5 font-bold">{doc.title}</td>
                          <td className="p-2.5">{institutions.find((i) => i.id === doc.instId)?.name}</td>
                          <td className="p-2.5">{doc.issuer}</td>
                          <td className="p-2.5 font-mono">{doc.expiryDate}</td>
                          <td className={`p-2.5 font-bold ${days < 0 ? 'text-red-700' : 'text-amber-700'}`}>
                            {days < 0 ? `منتهي منذ ${Math.abs(days)} يوم` : `متبقي ${days} يوم`}
                          </td>
                          <td className="p-2.5">{doc.resPerson}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">جميع الوثائق والتراخيص سارية بشكل سليم.</p>
              )}
            </div>

            {/* Signatures */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-800">توقيع مسؤول الامتثال</p>
                <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mt-2"></div>
              </div>
              <div>
                <p className="font-bold text-slate-800">اعتماد المدير العام</p>
                <div className="h-12 border-b border-dashed border-slate-300 w-48 mx-auto mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
