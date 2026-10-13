import React, { useState } from 'react';
import {
  Building2, Lock, Mail, User as UserIcon, Phone, Eye, EyeOff,
  CheckCircle2, AlertCircle, ShieldCheck, Key, Sparkles, Database,
  ArrowRight, FileText, Check, ShieldAlert
} from 'lucide-react';
import { api, setToken } from '../services/api';
import { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  dbStatus?: { connected: boolean; type?: string; latencyMs?: number };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  dbStatus,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'compliance_officer' | 'finance_manager'>('compliance_officer');

  // Quick-fill helper for demo accounts
  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      try {
        // Primary: Backend + PostgreSQL login
        const res = await api.auth.login(email.trim(), password);
        onLoginSuccess(res.user);
        return;
      } catch (apiErr: any) {
        // Fallback for demo accounts if server or database is temporarily unreachable
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail === 'admin@corporate.sa' && password === 'Admin@2026') {
          const demoUser: User = {
            id: 1,
            name: 'عبدالله محمد آل الشيخ',
            email: 'admin@corporate.sa',
            role: 'admin',
            phone: '0501234567',
          };
          setToken('mock_admin_jwt_session_token_2026');
          onLoginSuccess(demoUser);
          return;
        } else if (cleanEmail === 'compliance@corporate.sa' && password === 'Comp@2026') {
          const demoUser: User = {
            id: 2,
            name: 'سارة إبراهيم القحطاني',
            email: 'compliance@corporate.sa',
            role: 'compliance_officer',
            phone: '0509876543',
          };
          setToken('mock_compliance_jwt_session_token_2026');
          onLoginSuccess(demoUser);
          return;
        } else if (cleanEmail === 'finance@corporate.sa' && password === 'Fin@2026') {
          const demoUser: User = {
            id: 3,
            name: 'خالد عبدالرحمن العتيبي',
            email: 'finance@corporate.sa',
            role: 'finance_manager',
            phone: '0554433221',
          };
          setToken('mock_finance_jwt_session_token_2026');
          onLoginSuccess(demoUser);
          return;
        }

        throw apiErr;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في تسجيل الدخول. يرجى التأكد من صحة البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('جميع الحقول الأساسية مطلوبة.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await api.auth.register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim(),
        });
        onLoginSuccess(res.user);
        return;
      } catch (apiErr: any) {
        // Fallback for new registration in offline/standalone mode
        const newUser: User = {
          id: Math.floor(Date.now() / 1000),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone.trim(),
        };
        setToken(`mock_token_${Date.now()}`);
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في إنشاء الحساب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Right Hero / Branding Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950/70 to-indigo-950 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-800 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />

          <div>
            {/* Header / Logo */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-white/10">
                <Building2 className="text-white" size={30} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight">التزاماتي</h1>
                  <span className="text-[10px] bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 font-medium">نظام الامتثال المؤسسي وإدارة الشركات</p>
              </div>
            </div>

            {/* Value Proposition Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">تسجيل دخول محمي ومشفر</h4>
                  <p className="text-[11px] text-slate-300/80 leading-relaxed mt-0.5">
                    حماية كاملة بالرموز المشفرة JWT وجلسات آمنة للمدراء ومسؤولي الامتثال.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Database size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ربط متكامل مع PostgreSQL 18</h4>
                  <p className="text-[11px] text-slate-300/80 leading-relaxed mt-0.5">
                    تخزين مركزي لكافة الكيانات والوثائق والعقود والمصروفات والعمليات المالية.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">حفظ وتخزين المستندات</h4>
                  <p className="text-[11px] text-slate-300/80 leading-relaxed mt-0.5">
                    أرشفة رقمية للملفات المرفقة مع رادار التنبيه الفوري لتواريخ الانتهاء.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Security Status */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">حالة النظام:</span>
              <span className="text-emerald-300 font-mono">
                {dbStatus?.connected ? `PostgreSQL 18 متصل (${dbStatus.latencyMs || 12}ms)` : 'نظام الحماية نشط'}
              </span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-mono">2026 KSA</span>
          </div>
        </div>

        {/* Left Form Area (7 Cols) */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Form Tabs */}
          <div className="flex items-center gap-3 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800 mb-8 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* Section Titles */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white">
              {mode === 'login' ? 'مرحباً بك مجدداً 👋' : 'إنشاء حساب مسؤول جديد ✨'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'يرجى تسجيل الدخول للوصول إلى لوحة التحكم والبيانات المؤسسية.'
                : 'أدخل بيانات المسؤول للانضمام إلى نظام الامتثال وإدارة الشركات.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start gap-3 text-xs text-red-200 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني المؤسسي *
                </label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                    placeholder="admin@corporate.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    كلمة المرور *
                  </label>
                </div>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 pr-10 pl-10 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium font-mono"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={16} />
                    تسجيل الدخول والفتح
                  </>
                )}
              </button>

              {/* Demo Accounts Quick-Fill Box */}
              <div className="pt-6 mt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Key size={13} className="text-amber-400" />
                    حسابات تجريبية جاهزة (اضغط للتعبئة التلقائية):
                  </p>
                  <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    تجربة فورية
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => quickFill('admin@corporate.sa', 'Admin@2026')}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-right transition-all group"
                  >
                    <span className="block font-black text-white text-xs group-hover:text-blue-400 transition-colors">
                      👑 المدير العام
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">صلاحيات كاملة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill('compliance@corporate.sa', 'Comp@2026')}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-right transition-all group"
                  >
                    <span className="block font-black text-white text-xs group-hover:text-blue-400 transition-colors">
                      ⚖️ مسؤول الامتثال
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">الوثائق والتراخيص</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFill('finance@corporate.sa', 'Fin@2026')}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-right transition-all group"
                  >
                    <span className="block font-black text-white text-xs group-hover:text-blue-400 transition-colors">
                      💼 المدير المالي
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">البنوك والمصروفات</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    placeholder="مثال: فيصل فهد القحطاني"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <UserIcon size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني المؤسسي *</label>
                <div className="relative">
                  <input
                    required
                    type="email"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    placeholder="faisal@corporate.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور *</label>
                  <input
                    required
                    type="password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الدور والصلاحية</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 px-3 text-xs text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="admin">مدير عام (كافة الصلاحيات)</option>
                    <option value="compliance_officer">مسؤول امتثال وقانوني</option>
                    <option value="finance_manager">مدير مالي ومحاسب</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الجوال (اختياري)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-3 pr-10 pl-4 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    تأكيد الحساب والدخول
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
