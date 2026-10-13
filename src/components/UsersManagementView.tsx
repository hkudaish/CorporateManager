import React, { useState } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Edit, Trash2, Search,
  Filter, CheckCircle2, AlertTriangle, Mail, Phone, Calendar, Clock,
  Lock, AlertCircle, RefreshCw
} from 'lucide-react';
import { User } from '../types';

interface UsersManagementViewProps {
  users: User[];
  currentUser: User | null;
  onOpenAddModal: () => void;
  onOpenEditModal: (user: User) => void;
  onOpenResetPasswordModal: (user: User) => void;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
  onRefreshUsers: () => void;
  onDeduplicateUsers?: () => void;
}

// Helper to deduplicate users by email
export const deduplicateUsers = (usersList: User[]): User[] => {
  const seenEmails = new Set<string>();
  const result: User[] = [];
  for (const u of usersList) {
    if (!u || !u.email) continue;
    const cleanEmail = u.email.toLowerCase().trim();
    if (!seenEmails.has(cleanEmail)) {
      seenEmails.add(cleanEmail);
      result.push(u);
    }
  }
  return result;
};

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onOpenResetPasswordModal,
  onDeleteUser,
  onRefreshUsers,
  onDeduplicateUsers,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Automatically deduplicate users
  const cleanUsers = deduplicateUsers(users);

  // Metrics calculation
  const totalUsers = cleanUsers.length;
  const adminCount = cleanUsers.filter((u) => u.role === 'admin').length;
  const complianceCount = cleanUsers.filter((u) => u.role === 'compliance_officer').length;
  const financeCount = cleanUsers.filter((u) => u.role === 'finance_manager').length;

  // Filtered users
  const filteredUsers = cleanUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
            👑 المدير العام
          </span>
        );
      case 'compliance_officer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300">
            ⚖️ مسؤول الامتثال
          </span>
        );
      case 'finance_manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            💼 المدير المالي
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            👁️ مستعرض ومدقق
          </span>
        );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      setIsDeleting(true);
      await onDeleteUser(deleteConfirmUser.id, deleteConfirmUser.name);
      setDeleteConfirmUser(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-red-200 shadow-xl text-center" dir="rtl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">منطقة محمية بالصلاحيات</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          عذراً، صفحة إدارة المستخدمين وتعديل الصلاحيات مقتصرة حصراً على **المدير العام (Admin)**.
          يرجى تسجيل الدخول بحساب المدير العام للمتابعة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-white/10">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">إدارة المستخدمين والصلاحيات</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold">
                  👑 صلاحية المدير العام
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                إضافة وتعديل وحذف أي مستخدم في النظام وإعادة تعيين كلمات المرور وتحديد الصلاحيات (RBAC).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onDeduplicateUsers && (
              <button
                onClick={onDeduplicateUsers}
                className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                title="فحص وإزالة أي حسابات مكررة تلقائياً"
              >
                <Filter size={15} />
                <span>إزالة التكرار</span>
              </button>
            )}
            <button
              onClick={onRefreshUsers}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all text-xs font-bold flex items-center gap-1.5"
              title="تحديث القائمة"
            >
              <RefreshCw size={15} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={16} />
              إضافة مستخدم جديد
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">إجمالي المستخدمين</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalUsers}</p>
          </div>
          <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">المدراء العامون</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{adminCount}</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">مسؤولو الامتثال</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{complianceCount}</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">الإدارة المالية</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{financeCount}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الجوال..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              roleFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({totalUsers})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              roleFilter === 'admin'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المدراء ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('compliance_officer')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              roleFilter === 'compliance_officer'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الامتثال ({complianceCount})
          </button>
          <button
            onClick={() => setRoleFilter('finance_manager')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              roleFilter === 'finance_manager'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المالية ({financeCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">المستخدم</th>
                <th className="py-3.5 px-4">البريد الإلكتروني</th>
                <th className="py-3.5 px-4">رقم الجوال</th>
                <th className="py-3.5 px-4">الصلاحية الوظيفية</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات المدير العام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 text-slate-300" />
                    لا توجد حسابات مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-700 text-white font-black flex items-center justify-center text-xs shadow-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                                  حسابك الحالي
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600 font-medium">{u.email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600">{u.phone || '—'}</span>
                      </td>

                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          نشط ومفعل
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => onOpenResetPasswordModal(u)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                            title="إعادة ضبط كلمة المرور"
                          >
                            <Key size={15} />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => onOpenEditModal(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="تعديل بيانات المستخدم"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title={isCurrent ? 'حذف هذا الحساب' : 'حذف المستخدم'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 text-right animate-in zoom-in-95" dir="rtl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-black text-slate-800 text-center mb-1">
              تأكيد حذف حساب المستخدم
            </h3>

            {currentUser?.id === deleteConfirmUser.id && (
              <div className="my-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-center text-xs font-bold leading-relaxed">
                ⚠️ تنبيه: أنت على وشك حذف حسابك الحالي! في حال التأكيد، سيتم إنهاء جلستك وإعادتك لشاشة تسجيل الدخول فوراً.
              </div>
            )}

            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب <span className="font-bold text-slate-800">{deleteConfirmUser.name}</span> ({deleteConfirmUser.email})؟
              سيتم إلغاء كافة صلاحيات الدخول لهذا المستخدم فوراً.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} />
                    تأكيد الحذف النهائي
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
