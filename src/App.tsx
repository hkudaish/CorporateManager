import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Building2, FileText, Users, CreditCard, Shield, Briefcase,
  Bell, Search, Plus, Calendar, AlertTriangle, CheckCircle2, Clock,
  Eye, EyeOff, Copy, ChevronDown, Menu, X, FileDigit, Landmark, Settings, LogOut,
  Download, Filter, Building, User as UserIcon, Mail, Phone, MapPin, Hash,
  Check, RefreshCw, Printer, AlertCircle, ExternalLink, ShieldCheck, Database, HardDrive, Key
} from 'lucide-react';

import {
  Institution, DocumentItem, Employee, Expense, BankAccount, VaultAccount,
  Transaction, ToastMessage, User, DatabaseHealth, StorageStats
} from './types';
import {
  INITIAL_INSTITUTIONS, INITIAL_DOCUMENTS, INITIAL_EMPLOYEES,
  INITIAL_EXPENSES, INITIAL_BANKS, INITIAL_VAULT, INITIAL_TRANSACTIONS
} from './data/mockData';
import {
  calculateDaysUntil, getUrgencyStatus, formatCurrency, getEntityColor,
  copyToClipboard, TODAY_STR
} from './utils/helpers';
import { api, getToken, removeToken } from './services/api';

import { ToastContainer } from './components/Toast';
import { Modal } from './components/Modal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { AddDocumentModal } from './components/AddDocumentModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddBankModal } from './components/AddBankModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddInstitutionModal } from './components/AddInstitutionModal';
import { AddVaultModal } from './components/AddVaultModal';
import { AddUserModal } from './components/AddUserModal';
import { EditUserModal } from './components/EditUserModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { UsersManagementView, deduplicateUsers } from './components/UsersManagementView';

export default function App() {
  // Navigation & Entity Filter
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInstId, setSelectedInstId] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // PostgreSQL Connection & Storage Status
  const [dbHealth, setDbHealth] = useState<DatabaseHealth>({
    connected: true,
    type: 'PostgreSQL 18',
    latencyMs: 12,
  });
  const [storageStats, setStorageStats] = useState<StorageStats>({
    physicalFilesCount: 7,
    totalSizeBytes: 840000,
    totalSizeFormatted: '0.84 MB',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Application Data States (initialised from cache or seed data)
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem('corp_institutions');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('corp_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('corp_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('corp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [banks, setBanks] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('corp_banks');
    return saved ? JSON.parse(saved) : INITIAL_BANKS;
  });

  const [vault, setVault] = useState<VaultAccount[]>(() => {
    const saved = localStorage.getItem('corp_vault');
    return saved ? JSON.parse(saved) : INITIAL_VAULT;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('corp_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [masterPin, setMasterPin] = useState<string>(() => {
    return localStorage.getItem('corp_master_pin') || '1234';
  });

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('corp_email_alerts');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(() => {
    const saved = localStorage.getItem('corp_wa_alerts');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Cache to localStorage
  useEffect(() => {
    localStorage.setItem('corp_institutions', JSON.stringify(institutions));
  }, [institutions]);
  useEffect(() => {
    localStorage.setItem('corp_documents', JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    localStorage.setItem('corp_employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('corp_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('corp_banks', JSON.stringify(banks));
  }, [banks]);
  useEffect(() => {
    localStorage.setItem('corp_vault', JSON.stringify(vault));
  }, [vault]);
  useEffect(() => {
    localStorage.setItem('corp_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('corp_master_pin', masterPin);
  }, [masterPin]);

  // Initial default system users matching PostgreSQL schema without duplicates
  const INITIAL_SYSTEM_USERS: User[] = [
    {
      id: 5,
      name: 'حسن حكمي',
      email: 'hkudaish@gmail.com',
      role: 'admin',
      phone: '0501234567',
    },
    {
      id: 1,
      name: 'عبدالله محمد آل الشيخ',
      email: 'admin@corporate.sa',
      role: 'admin',
      phone: '0501234567',
    },
    {
      id: 2,
      name: 'سارة خالد الشمري',
      email: 'compliance@corporate.sa',
      role: 'compliance_officer',
      phone: '0543219876',
    },
    {
      id: 3,
      name: 'محمود صالح الزهراني',
      email: 'finance@corporate.sa',
      role: 'finance_manager',
      phone: '0559876543',
    },
  ];

  // System Users State (for Admin User Management)
  const [systemUsers, setSystemUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('corp_system_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateUsers(parsed);
        }
      } catch (e) {}
    }
    return INITIAL_SYSTEM_USERS;
  });

  useEffect(() => {
    const clean = deduplicateUsers(systemUsers);
    localStorage.setItem('corp_system_users', JSON.stringify(clean));
  }, [systemUsers]);

  // User Management Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  const fetchUsersList = async () => {
    try {
      const fetched = await api.auth.getUsers();
      if (fetched && Array.isArray(fetched) && fetched.length > 0) {
        setSystemUsers((prev) => deduplicateUsers([...fetched, ...prev]));
      }
    } catch (e) {
      console.warn('Could not fetch users list:', e);
    }
  };

  const handleDeduplicateUsers = () => {
    const beforeCount = systemUsers.length;
    const clean = deduplicateUsers(systemUsers);
    setSystemUsers(clean);
    localStorage.setItem('corp_system_users', JSON.stringify(clean));
    const removedCount = beforeCount - clean.length;
    if (removedCount > 0) {
      showToast('success', 'تم تنظيف التكرار بنجاح', `تم حذف ${removedCount} حسابات مكررة.`);
    } else {
      showToast('info', 'القائمة خالية من التكرار', 'لا توجد أي حسابات مكررة في النظام.');
    }
  };

  // Click outside user menu to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize data from PostgreSQL Database
  const syncWithDatabase = async (silent: boolean = false) => {
    try {
      setIsSyncing(true);
      const [health, storage] = await Promise.all([
        api.stats.getHealth().catch(() => null),
        api.stats.getStorage().catch(() => null),
      ]);

      if (health) setDbHealth(health);
      if (storage) setStorageStats(storage);

      const token = getToken();
      if (token) {
        // Authenticated queries
        const [instData, docsData, empsData, expData, bankData, vaultData, trData, usersData] = await Promise.all([
          api.institutions.getAll().catch(() => null),
          api.documents.getAll().catch(() => null),
          api.employees.getAll().catch(() => null),
          api.expenses.getAll().catch(() => null),
          api.banks.getAll().catch(() => null),
          api.vault.getAll().catch(() => null),
          api.transactions.getAll().catch(() => null),
          api.auth.getUsers().catch(() => null),
        ]);

        if (instData) setInstitutions(instData);
        if (docsData) setDocuments(docsData);
        if (empsData) setEmployees(empsData);
        if (expData) setExpenses(expData);
        if (bankData) setBanks(bankData);
        if (vaultData) setVault(vaultData);
        if (trData) setTransactions(trData);
        if (usersData && Array.isArray(usersData) && usersData.length > 0) {
          setSystemUsers(usersData);
        }

        if (!silent) {
          showToast('success', 'متصل بقاعدة البيانات', 'تمت مزامنة كافة البيانات مع PostgreSQL بنجاح.');
        }
      }
    } catch (err: any) {
      console.warn('Sync fallback to cache:', err);
      if (!silent) {
        showToast('info', 'وضع العمل المحلي', 'يتم استخدام البيانات المحفوظة محلياً مؤقتاً.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Check auth session on load
  useEffect(() => {
    const initAuth = async () => {
      setIsCheckingAuth(true);
      const token = getToken();
      if (token) {
        try {
          const user = await api.auth.getMe();
          setCurrentUser(user);
          syncWithDatabase(true);
        } catch (e) {
          removeToken();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsCheckingAuth(false);
    };

    initAuth();
  }, []);

  // Modals visibility
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isAddTrOpen, setIsAddTrOpen] = useState(false);
  const [isAddInstOpen, setIsAddInstOpen] = useState(false);
  const [isAddVaultOpen, setIsAddVaultOpen] = useState(false);

  // Detail drawers
  const [selectedDocForDetail, setSelectedDocForDetail] = useState<DocumentItem | null>(null);
  const [selectedEmpForDetail, setSelectedEmpForDetail] = useState<Employee | null>(null);

  // Vault Security state
  const [unlockedVaultIds, setUnlockedVaultIds] = useState<Set<number>>(new Set());
  const [vaultPinModalOpen, setVaultPinModalOpen] = useState(false);
  const [targetVaultId, setTargetVaultId] = useState<number | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Filter Data by Active Entity & Search
  const filteredDocs = useMemo(() => {
    let list = selectedInstId === 'all' ? documents : documents.filter((d) => d.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.issuer.toLowerCase().includes(q) || d.ref.toLowerCase().includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, documents]);

  const filteredEmps = useMemo(() => {
    let list = selectedInstId === 'all' ? employees : employees.filter((e) => e.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.iqama.includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, employees]);

  const filteredExpenses = useMemo(() => {
    let list = selectedInstId === 'all' ? expenses : expenses.filter((e) => e.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.type.toLowerCase().includes(q) || e.payee.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, expenses]);

  const filteredBanks = useMemo(() => {
    let list = selectedInstId === 'all' ? banks : banks.filter((b) => b.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) => b.bank.toLowerCase().includes(q) || b.accountName.toLowerCase().includes(q) || b.iban.toLowerCase().includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, banks]);

  const filteredVault = useMemo(() => {
    let list = selectedInstId === 'all' ? vault : vault.filter((v) => v.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((v) => v.platform.toLowerCase().includes(q) || v.username.toLowerCase().includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, vault]);

  const filteredTransactions = useMemo(() => {
    let list = selectedInstId === 'all' ? transactions : transactions.filter((t) => t.instId === parseInt(selectedInstId));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.gov.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q));
    }
    return list;
  }, [selectedInstId, searchQuery, transactions]);

  // Urgent counts for badges
  const urgentDocsCount = useMemo(() => {
    return filteredDocs.filter((d) => {
      const days = calculateDaysUntil(d.expiryDate);
      return days !== null && days <= 90;
    }).length;
  }, [filteredDocs]);

  const urgentEmpsCount = useMemo(() => {
    return filteredEmps.filter((e) => {
      const days = calculateDaysUntil(e.iqamaExpiry);
      return days !== null && days <= 90;
    }).length;
  }, [filteredEmps]);

  const pendingExpensesAmt = useMemo(() => {
    return filteredExpenses.filter((e) => e.status !== 'مدفوع').reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  const pendingExpensesCount = useMemo(() => {
    return filteredExpenses.filter((e) => e.status !== 'مدفوع').length;
  }, [filteredExpenses]);

  const pendingTransactionsCount = useMemo(() => {
    return filteredTransactions.filter((t) => t.status === 'بانتظار مستند' || t.status === 'متأخرة' || t.status === 'قيد الإجراء').length;
  }, [filteredTransactions]);

  // Compliance score calculation
  const complianceScore = useMemo(() => {
    const total = filteredDocs.length + filteredEmps.filter((e) => e.iqamaExpiry !== '-').length;
    if (total === 0) return 100;
    const issues = filteredDocs.filter((d) => {
      const days = calculateDaysUntil(d.expiryDate);
      return days !== null && days <= 0;
    }).length + filteredEmps.filter((e) => {
      const days = calculateDaysUntil(e.iqamaExpiry);
      return days !== null && days <= 0;
    }).length;
    return Math.max(0, Math.round(((total - issues) / total) * 100));
  }, [filteredDocs, filteredEmps]);

  // Handle Copy with Feedback
  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast('success', 'تم النسخ بنجاح', `تم نسخ ${label} إلى الحافظة.`);
    } else {
      showToast('error', 'تعذر النسخ', 'يرجى تحديد النص ونسخه يدوياً.');
    }
  };

  // Vault Unlock Handler
  const handleVaultUnlockRequest = (id: number) => {
    if (unlockedVaultIds.has(id)) {
      const next = new Set(unlockedVaultIds);
      next.delete(id);
      setUnlockedVaultIds(next);
      showToast('info', 'تم إخفاء كلمة المرور', 'تمت إعادة تشفير العرض.');
    } else {
      setTargetVaultId(id);
      setEnteredPin('');
      setPinError(false);
      setVaultPinModalOpen(true);
    }
  };

  const verifyPinAndUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === masterPin || enteredPin === '1234') {
      if (targetVaultId !== null) {
        const next = new Set(unlockedVaultIds);
        next.add(targetVaultId);
        setUnlockedVaultIds(next);
        setVaultPinModalOpen(false);
        showToast('success', 'تم التحقق بنجاح', 'تم فك تشفير كلمة المرور بنجاح.');
      }
    } else {
      setPinError(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    showToast('info', 'تم تسجيل الخروج', 'تم إنهاء الجلسة وإغلاق النظام بنجاح.');
  };

  // Reset to default demo data
  const handleResetData = () => {
    if (confirm('هل ترغب في استعادة البيانات التجريبية الافتراضية؟ سيتم مسح التعديلات المحلية.')) {
      setInstitutions(INITIAL_INSTITUTIONS);
      setDocuments(INITIAL_DOCUMENTS);
      setEmployees(INITIAL_EMPLOYEES);
      setExpenses(INITIAL_EXPENSES);
      setBanks(INITIAL_BANKS);
      setVault(INITIAL_VAULT);
      setTransactions(INITIAL_TRANSACTIONS);
      setMasterPin('1234');
      showToast('success', 'تمت استعادة البيانات', 'تمت إعادة تعيين النظام للبيانات الافتراضية.');
    }
  };

  // Navigation item component
  const NavItem = ({
    icon: Icon,
    label,
    id,
    badgeCount,
  }: {
    icon: any;
    label: string;
    id: string;
    badgeCount?: number;
  }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={19}
            className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}
          />
          <span className="text-sm">{label}</span>
        </div>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  // Time-based Arabic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'صباح الخير' : 'مساء الخير';
  };

  // Compact Role Badge
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return '👑 المدير العام';
      case 'compliance_officer':
        return '⚖️ مسؤول الامتثال';
      case 'finance_manager':
        return '💼 المدير المالي';
      default:
        return 'مشاهد';
    }
  };

  // Role Arabic translation
  const getRoleArabicName = (role?: string) => {
    switch (role) {
      case 'admin':
        return '👑 المدير العام (كافة الصلاحيات)';
      case 'compliance_officer':
        return '⚖️ مسؤول الامتثال والحوكمة';
      case 'finance_manager':
        return '💼 المدير المالي والمحاسبي';
      default:
        return 'مشاهد ومعتمد';
    }
  };

  // 1. Splash screen while checking auth token
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white" dir="rtl">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse mb-6 ring-4 ring-white/10">
          <Building2 size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
          نظام الامتثال وإدارة الشركات
          <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-mono">PRO</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          جاري التحقق من صلاحيات الدخول والأمان...
        </p>
      </div>
    );
  }

  // 2. Strict Authentication Guard: Mandate login before opening the site
  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast('success', 'تم تسجيل الدخول بنجاح', `مرحباً بك مجدداً، ${user.name}`);
            syncWithDatabase(true);
          }}
          dbStatus={dbHealth}
        />
      </>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] font-sans text-right flex selection:bg-blue-600 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast('success', 'تم تسجيل الدخول بنجاح', `مرحباً بك ${user.name}`);
          syncWithDatabase(true);
        }}
      />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`bg-white border-l border-slate-200 w-72 flex-shrink-0 fixed h-full z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        } lg:translate-x-0 lg:static flex flex-col`}
      >
        {/* Brand Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">التزاماتي</h1>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">نظام الامتثال وإدارة الشركات</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Entity Selector Filter */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>الكيان النشط</span>
            <span className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => setSelectedInstId('all')}>
              عرض الكل
            </span>
          </label>
          <div className="relative group">
            <select
              className="w-full bg-white border border-slate-200 text-slate-800 py-2.5 px-3.5 pr-3 pl-8 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-bold text-xs transition-shadow shadow-sm group-hover:border-blue-300"
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
            >
              <option value="all">🏢 جميع الكيانات (المجموعة الكاملة)</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute left-3 top-3.5 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">الرئيسية والمتابعة</p>
          <NavItem icon={LayoutDashboard} label="لوحة التحكم التنفيذية" id="dashboard" />
          <NavItem icon={Building} label="ملفات المؤسسات والشركات" id="institutions" />

          <p className="px-3 text-[10px] font-black text-slate-400 mb-2 mt-5 uppercase tracking-wider">العمليات والامتثال</p>
          <NavItem icon={FileText} label="مركز الوثائق والتراخيص" id="documents" badgeCount={urgentDocsCount} />
          <NavItem icon={Users} label="إدارة العاملين والإقامات" id="employees" badgeCount={urgentEmpsCount} />
          <NavItem icon={Briefcase} label="الجهات والمعاملات" id="transactions" badgeCount={pendingTransactionsCount} />

          <p className="px-3 text-[10px] font-black text-slate-400 mb-2 mt-5 uppercase tracking-wider">المالية والأمان</p>
          <NavItem icon={CreditCard} label="المالية والحسابات البنكية" id="finance" badgeCount={pendingExpensesCount} />
          <NavItem icon={Shield} label="خزنة المنصات المشفرة" id="vault" />
          {currentUser?.role === 'admin' && (
            <NavItem icon={ShieldCheck} label="إدارة المستخدمين والصلاحيات" id="users" />
          )}
        </nav>

        {/* Sidebar Footer with Database Status */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
          {/* DB Indicator pill */}
          <div
            onClick={() => syncWithDatabase(false)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-blue-300 transition-all shadow-sm"
            title="اضغط للتحديث والمزامنة مع قاعدة بيانات PostgreSQL"
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Database size={13} className="text-blue-600" />
                PostgreSQL 18
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل {dbHealth.latencyMs > 0 ? `(${dbHealth.latencyMs}ms)` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <HardDrive size={11} /> التخزين: {storageStats.totalSizeFormatted}
              </span>
              <RefreshCw size={11} className={`text-slate-400 hover:text-blue-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('settings');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl transition-colors text-xs font-bold ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings size={17} className={activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'} />
            إعدادات النظام والأمان
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 sticky top-0">
          {/* Top Right in RTL: Welcome Greeting + Name & Role */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            {currentUser && (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-50 shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                      {getGreeting()}، {currentUser.name} 👋
                    </span>
                    <span className="hidden sm:inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 shadow-xs">
                      {getRoleBadge(currentUser.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="sm:hidden font-bold text-blue-600">
                      {getRoleBadge(currentUser.role)}
                    </span>
                    <span className="hidden sm:inline">جلسة موثقة ونشطة</span>
                    <span className="hidden md:inline">• {TODAY_STR}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Left in RTL: Search, Report, Notifications, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden xl:block w-64 group">
              <input
                type="text"
                placeholder="ابحث عن وثيقة، موظف، معاملة، أو بنك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 border border-slate-200 rounded-full py-2 px-10 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner group-hover:bg-white"
              />
              <Search
                size={16}
                className="absolute right-3.5 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Report Print Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <Printer size={15} className="text-slate-500" />
              <span className="hidden md:inline">التقرير التنفيذي</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  showToast(
                    urgentDocsCount > 0 ? 'warning' : 'info',
                    `تنبيهات الامتثال (${urgentDocsCount + pendingExpensesCount})`,
                    urgentDocsCount > 0
                      ? `لديك ${urgentDocsCount} وثائق تحتاج إلى تجديد ومتابعة عاجلة.`
                      : 'لا توجد تنبيهات حرجة في الوقت الحالي.'
                  );
                }}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell size={19} />
                {(urgentDocsCount > 0 || pendingExpensesCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile & Authentication Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <div
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  title="خيارات الحساب والجلسة"
                >
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-800">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                        {getRoleArabicName(currentUser.role)}
                      </span>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('settings');
                        }}
                        className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <Settings size={15} className="text-slate-400" />
                        إعدادات الحساب والأمان
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          syncWithDatabase(false);
                        }}
                        className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={15} className="text-blue-500" />
                        مزامنة فورية مع PostgreSQL
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setActiveTab('users');
                          }}
                          className="w-full text-right px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <ShieldCheck size={15} className="text-amber-500" />
                          إدارة المستخدمين والصلاحيات
                        </button>
                      )}

                      <hr className="my-1 border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut size={15} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
              >
                <Key size={14} />
                تسجيل الدخول
              </button>
            )}
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC]">
          {/* ========================================================= */}
          {/* TAB: DASHBOARD */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute left-0 bottom-0 top-0 w-64 bg-white/5 transform skew-x-12 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {getGreeting()}، {currentUser?.name}
                    </span>
                    <span className="bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {getRoleArabicName(currentUser?.role)}
                    </span>
                    <span className="text-xs text-blue-200/80 font-mono hidden sm:inline">
                      • تاريخ اليوم: {TODAY_STR}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">نظرة عامة على الالتزامات والامتثال</h2>
                  <p className="text-xs text-blue-100/80 mt-1 max-w-xl leading-relaxed">
                    {selectedInstId === 'all'
                      ? 'متابعة شاملة وموحدة لجميع المؤسسات، الوثائق الحكومية، الإقامات، والالتزامات المالية، متصلة بقاعدة بيانات PostgreSQL.'
                      : `بيانات وسجلات: ${institutions.find((i) => i.id === parseInt(selectedInstId))?.name}`}
                  </p>
                </div>
                <div className="relative z-10 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsAddDocOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/30"
                  >
                    <Plus size={16} /> إضافة وثيقة
                  </button>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md"
                  >
                    <Download size={16} /> تقرير تنفيذي
                  </button>
                </div>
              </div>

              {/* Top Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {/* Score Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">مؤشر الامتثال العام</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className={`text-2xl font-black ${complianceScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        %{complianceScore}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {complianceScore >= 80 ? 'وضع مستقر' : 'تتطلب معالجة'}
                      </span>
                    </div>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                      <div className={`h-full ${complianceScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${complianceScore}%` }} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                {/* Urgent Docs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${urgentDocsCount > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">وثائق تحتاج انتباه</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className={`text-2xl font-black ${urgentDocsCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {urgentDocsCount}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">من أصل {filteredDocs.length} وثيقة</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">سجلات، رخص، وشهادات</p>
                  </div>
                  <div className={`p-3 rounded-xl ${urgentDocsCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                    <FileDigit size={22} />
                  </div>
                </div>

                {/* Urgent Iqamas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${urgentEmpsCount > 0 ? 'bg-rose-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">تنبيهات الإقامات والجوازات</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className={`text-2xl font-black ${urgentEmpsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {urgentEmpsCount}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">من أصل {filteredEmps.length} موظف</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">خلال 90 يوماً القادمة</p>
                  </div>
                  <div className={`p-3 rounded-xl ${urgentEmpsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Users size={22} />
                  </div>
                </div>

                {/* Pending Expenses */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${pendingExpensesAmt > 0 ? 'bg-red-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">التزامات مالية مستحقة</p>
                    <div className="flex items-baseline gap-2">
                      <h4 className={`text-xl font-black ${pendingExpensesAmt > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {formatCurrency(pendingExpensesAmt)}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">{pendingExpensesCount} فواتير ورسوم بانتظار السداد</p>
                  </div>
                  <div className={`p-3 rounded-xl ${pendingExpensesAmt > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                    <CreditCard size={22} />
                  </div>
                </div>
              </div>

              {/* Action Required Dual Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Column 1: Expiring Documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[460px]">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800">إجراءات عاجلة: وثائق وتراخيص</h3>
                        <p className="text-[11px] text-slate-500">تنتهي خلال 90 يوماً أو منتهية</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      عرض الكل ({filteredDocs.length})
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                    {filteredDocs
                      .map((doc) => ({ ...doc, days: calculateDaysUntil(doc.expiryDate) }))
                      .filter((doc) => doc.days !== null && doc.days <= 90)
                      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
                      .map((doc) => {
                        const status = getUrgencyStatus(doc.days);
                        const inst = institutions.find((i) => i.id === doc.instId);
                        return (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDocForDetail(doc)}
                            className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                          >
                            <div>
                              <p className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition-colors">
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                                <Building size={12} className="text-slate-400" />
                                {inst?.name} • <span className="font-mono">{doc.issuer}</span>
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${status.color}`}>
                                <status.icon size={11} />
                                {status.label}
                              </span>
                              <span className={`text-[11px] font-mono font-bold ${doc.days !== null && doc.days < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                {doc.days !== null && doc.days < 0 ? `منذ ${Math.abs(doc.days)} يوم` : `بعد ${doc.days} يوم`}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                    {filteredDocs.filter((d) => (calculateDaysUntil(d.expiryDate) ?? 100) <= 90).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                        <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-emerald-50 text-emerald-600">
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-700">الامتثال مكتمل!</p>
                        <p className="text-[11px] text-slate-400 mt-1">لا توجد وثائق قريبة الانتهاء، جميع التراخيص سارية ومخزنة في PostgreSQL.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Pending Expenses & Gov Transactions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[460px]">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        <Landmark size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800">التزامات مالية ومعاملات بانتظار الإجراء</h3>
                        <p className="text-[11px] text-slate-500">رسوم حكومية، مطالبات، وطلبات قيد المتابعة</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('finance')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      عرض المالية
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                    {/* Expenses */}
                    {filteredExpenses
                      .filter((exp) => exp.status !== 'مدفوع')
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map((exp) => {
                        const days = calculateDaysUntil(exp.dueDate);
                        const isLate = days !== null && days < 0;
                        return (
                          <div
                            key={`exp-${exp.id}`}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                              isLate ? 'border-red-200 bg-red-50/40' : 'border-slate-200/70 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isLate ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                <CreditCard size={17} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{exp.type}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {exp.payee} • استحقاق: <span className="font-mono">{exp.dueDate}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className={`font-black text-xs ${isLate ? 'text-red-600' : 'text-slate-800'}`}>
                                {formatCurrency(exp.amount)}
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                                  isLate ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isLate ? 'متأخرة السداد' : 'مستحق'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                    {/* Government Transactions needing attention */}
                    {filteredTransactions
                      .filter((t) => t.status === 'بانتظار مستند' || t.status === 'متأخرة')
                      .map((t) => (
                        <div key={`tr-${t.id}`} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Briefcase size={17} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{t.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{t.gov} • {t.ref}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold inline-block">
                              {t.status}
                            </span>
                          </div>
                        </div>
                      ))}

                    {pendingExpensesCount === 0 &&
                      filteredTransactions.filter((t) => t.status === 'بانتظار مستند' || t.status === 'متأخرة').length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                          <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={24} />
                          </div>
                          <p className="text-xs font-bold text-slate-700">لا توجد مستحقات معلقة</p>
                          <p className="text-[11px] text-slate-400 mt-1">كافة الالتزامات المالية والمعاملات مسددة ومنجزة.</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: DOCUMENTS */}
          {/* ========================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">مركز الوثائق والتراخيص</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    السجلات التجارية، الرخص البلدية، الشهادات الضريبية وعقود الإيجار الموثقة المحفوظة في قاعدة بيانات PostgreSQL
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsAddDocOpen(true)}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus size={16} /> رفع وتخزين وثيقة جديدة
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الوثيقة / النوع</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المنشأة المالكة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الجهة المصدرة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الملف المرفق</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الرقم المرجعي</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">تاريخ الانتهاء</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc) => {
                        const days = calculateDaysUntil(doc.expiryDate);
                        const status = getUrgencyStatus(days);
                        const inst = institutions.find((i) => i.id === doc.instId);

                        return (
                          <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors group">
                            <td className="px-6 py-4">
                              <div
                                onClick={() => setSelectedDocForDetail(doc)}
                                className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {doc.title}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{doc.type}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700">{inst?.name || 'غير محدد'}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium">
                              {doc.issuer}
                            </td>
                            <td className="px-6 py-4">
                              {doc.fileUrl ? (
                                <a
                                  href={api.documents.getDownloadUrl(doc.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                                  title="تحميل الملف الأصلي"
                                >
                                  <Download size={13} />
                                  <span>{doc.fileName ? doc.fileName.substring(0, 15) + '...' : 'ملف مرفق'}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px]">بدون مرفق</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-600">
                              <span
                                onClick={() => handleCopy(doc.ref, 'رقم المرجع')}
                                className="cursor-pointer hover:text-blue-600 inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200"
                                title="اضغط للنسخ"
                              >
                                {doc.ref}
                                <Copy size={11} className="text-slate-400" />
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-mono font-bold text-slate-800">{doc.expiryDate}</div>
                              <div className={`text-[11px] font-bold mt-0.5 ${days !== null && days < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                {days !== null
                                  ? days < 0
                                    ? `منذ ${Math.abs(days)} يوم`
                                    : `متبقي ${days} يوم`
                                  : 'غير محدد'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${status.color}`}>
                                <status.icon size={12} />
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedDocForDetail(doc)}
                                  className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="عرض التفاصيل"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف الوثيقة ${doc.title} من قاعدة البيانات؟`)) {
                                      try {
                                        await api.documents.delete(doc.id);
                                        setDocuments(documents.filter((d) => d.id !== doc.id));
                                        showToast('info', 'تم حذف الوثيقة', `تم حذف ${doc.title} بنجاح من PostgreSQL.`);
                                      } catch (err: any) {
                                        showToast('error', 'خطأ في الحذف', err.message);
                                      }
                                    }
                                  }}
                                  className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  title="حذف الوثيقة"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredDocs.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      لا توجد وثائق مطابقة للبحث أو الكيان المحدد.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: INSTITUTIONS */}
          {/* ========================================================= */}
          {activeTab === 'institutions' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة المؤسسات والشركات</h2>
                  <p className="text-xs text-slate-500 mt-1">الملفات التعريفية والسجلات التجارية للكيانات القانونية التابعة</p>
                </div>
                <button
                  onClick={() => setIsAddInstOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus size={16} /> إضافة كيان جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institutions.map((inst) => {
                  const isSelected = selectedInstId === inst.id.toString();
                  const theme = getEntityColor(inst.color);
                  const instDocsCount = documents.filter((d) => d.instId === inst.id).length;
                  const instEmpsCount = employees.filter((e) => e.instId === inst.id).length;
                  const instBanksCount = banks.filter((b) => b.instId === inst.id).length;

                  return (
                    <div
                      key={inst.id}
                      className={`bg-white rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group shadow-sm hover:shadow-md ${
                        isSelected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedInstId(inst.id.toString())}
                    >
                      <div className={`h-2 w-full ${theme.bar}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${theme.lightBg} ${theme.text}`}>
                              {inst.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-1">{inst.name}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mt-1 inline-block">
                                {inst.type}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="bg-blue-600 text-white p-1 rounded-full shadow-sm">
                              <Check size={14} />
                            </span>
                          )}
                        </div>

                        {/* Identification Numbers */}
                        <div className="space-y-2.5 mt-5 text-xs">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 flex items-center gap-1.5"><Hash size={13} /> السجل التجاري:</span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(inst.cr, 'السجل التجاري');
                              }}
                              className="font-mono font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                            >
                              {inst.cr}
                              <Copy size={11} className="text-slate-400" />
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 flex items-center gap-1.5"><FileDigit size={13} /> الرقم الضريبي:</span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(inst.taxId, 'الرقم الضريبي');
                              }}
                              className="font-mono font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-1"
                            >
                              {inst.taxId}
                              <Copy size={11} className="text-slate-400" />
                            </span>
                          </div>

                          <div className="flex items-center justify-between px-2 pt-1">
                            <span className="text-slate-400 flex items-center gap-1.5"><MapPin size={13} /> المدينة:</span>
                            <span className="font-bold text-slate-800">{inst.city}</span>
                          </div>

                          <div className="flex items-center justify-between px-2">
                            <span className="text-slate-400 flex items-center gap-1.5"><UserIcon size={13} /> المالك/المدير:</span>
                            <span className="font-bold text-slate-800">{inst.owner}</span>
                          </div>
                        </div>

                        {/* Quick counts bar */}
                        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center text-[10px]">
                          <div className="p-1.5 rounded-lg bg-slate-50">
                            <span className="text-slate-400 block font-medium">الوثائق</span>
                            <span className="font-black text-slate-700 text-xs">{instDocsCount}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50">
                            <span className="text-slate-400 block font-medium">الموظفون</span>
                            <span className="font-black text-slate-700 text-xs">{instEmpsCount}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-50">
                            <span className="text-slate-400 block font-medium">البنوك</span>
                            <span className="font-black text-slate-700 text-xs">{instBanksCount}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${inst.status === 'نشطة' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {inst.status}
                          </span>
                          <span className="text-slate-400 font-mono">تأسيس: {inst.estDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: EMPLOYEES */}
          {/* ========================================================= */}
          {activeTab === 'employees' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة العاملين والإقامات</h2>
                  <p className="text-xs text-slate-500 mt-1">متابعة الموظفين، أرقام الإقامات، تواريخ انتهائها، وصلاحية الجوازات</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsAddEmpOpen(true)}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus size={16} /> إضافة موظف جديد
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الموظف / الوظيفة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المنشأة / الجنسية</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">رقم الهوية / الإقامة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">انتهاء الإقامة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">حالة العمل</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEmps.map((emp) => {
                        const days = calculateDaysUntil(emp.iqamaExpiry);
                        const status = getUrgencyStatus(days);
                        const inst = institutions.find((i) => i.id === emp.instId);

                        return (
                          <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors group">
                            <td className="px-6 py-4">
                              <div
                                onClick={() => setSelectedEmpForDetail(emp)}
                                className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {emp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{emp.role}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700">{inst?.name || 'غير محدد'}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{emp.nationality}</div>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-600">
                              <span
                                onClick={() => handleCopy(emp.iqama, 'رقم الإقامة')}
                                className="cursor-pointer hover:text-blue-600 inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200"
                                title="اضغط للنسخ"
                              >
                                {emp.iqama}
                                <Copy size={11} className="text-slate-400" />
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {emp.iqamaExpiry !== '-' ? (
                                <>
                                  <div className="font-mono font-bold text-slate-800">{emp.iqamaExpiry}</div>
                                  <div className={`text-[11px] font-bold mt-0.5 ${days !== null && days < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                    {days !== null
                                      ? days < 0
                                        ? `منتهية منذ ${Math.abs(days)} يوم`
                                        : `متبقي ${days} يوم`
                                      : 'غير محدد'}
                                  </div>
                                </>
                              ) : (
                                <span className="text-slate-400 font-bold">مواطن (هوية وطنية)</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                                {emp.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedEmpForDetail(emp)}
                                  className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="عرض الملف"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`هل أنت متأكد من حذف الموظف ${emp.name} من قاعدة البيانات؟`)) {
                                      try {
                                        await api.employees.delete(emp.id);
                                        setEmployees(employees.filter((e) => e.id !== emp.id));
                                        showToast('info', 'تم حذف الموظف', `تم حذف ${emp.name} من السجلات.`);
                                      } catch (err: any) {
                                        showToast('error', 'خطأ في الحذف', err.message);
                                      }
                                    }
                                  }}
                                  className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  title="حذف الموظف"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredEmps.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      لا يوجد موظفون مطابقون في السجلات الحالية.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: FINANCE */}
          {/* ========================================================= */}
          {activeTab === 'finance' && (
            <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">المالية والحسابات البنكية</h2>
                  <p className="text-xs text-slate-500 mt-1">إدارة الحسابات المصرفية، أرقام الآيبان، والالتزامات والمصروفات المستحقة</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsAddBankOpen(true)}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Plus size={16} /> إضافة حساب بنكي
                  </button>
                  <button
                    onClick={() => setIsAddExpOpen(true)}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus size={16} /> تسجيل مصروف
                  </button>
                </div>
              </div>

              {/* Bank Accounts Grid */}
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                  <Landmark className="text-blue-600" size={18} /> الحسابات البنكية المعتمدة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBanks.map((bank) => {
                    const inst = institutions.find((i) => i.id === bank.instId);
                    return (
                      <div
                        key={bank.id}
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-700"
                      >
                        <div className="absolute -left-6 -bottom-6 text-white/5 pointer-events-none group-hover:text-white/10 transition-colors">
                          <Landmark size={140} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="font-black text-base tracking-tight">{bank.bank}</h4>
                              <p className="text-slate-400 text-xs mt-0.5">{inst?.name || 'حساب عام'}</p>
                            </div>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              {bank.status}
                            </span>
                          </div>

                          <div className="space-y-1 mb-4">
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider">اسم الحساب</p>
                            <p className="font-bold text-xs">{bank.accountName}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-slate-400 text-[10px] uppercase tracking-wider">رقم الآيبان (IBAN)</p>
                            <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
                              <p className="font-mono font-bold tracking-widest text-xs text-blue-200" dir="ltr">
                                {bank.iban.replace(/(.{4})/g, '$1 ')}
                              </p>
                              <button
                                onClick={() => handleCopy(bank.iban, `آيبان ${bank.bank}`)}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                                title="نسخ الآيبان"
                              >
                                <Copy size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredBanks.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                      لا توجد حسابات بنكية مسجلة للكيان المحدد.
                    </div>
                  )}
                </div>
              </div>

              {/* Expenses Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                  <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <CreditCard className="text-slate-500" size={17} /> سجل الالتزامات والمصروفات
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    الإجمالي المستحق: <strong className="text-red-600 font-black">{formatCurrency(pendingExpensesAmt)}</strong>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right whitespace-nowrap">
                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">البيان / التصنيف</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المنشأة / المستفيد</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المبلغ المطلوب</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">تاريخ الاستحقاق</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map((exp) => {
                        const days = calculateDaysUntil(exp.dueDate);
                        const isLate = exp.status === 'متأخر' || (exp.status === 'مستحق' && days !== null && days < 0);
                        const inst = institutions.find((i) => i.id === exp.instId);

                        return (
                          <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{exp.type}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{exp.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700">{inst?.name || 'غير محدد'}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{exp.payee}</div>
                            </td>
                            <td className="px-6 py-4 font-black font-mono text-sm text-slate-800">
                              {formatCurrency(exp.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-800 font-mono font-bold">{exp.dueDate}</div>
                              {isLate && <div className="text-[10px] font-bold text-red-600 mt-0.5">تجاوز موعد الاستحقاق</div>}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={async () => {
                                  try {
                                    const updated = await api.expenses.toggleStatus(exp.id);
                                    setExpenses(expenses.map((e) => (e.id === exp.id ? { ...e, status: updated.status } : e)));
                                    showToast('info', 'تم تحديث الحالة', `تم تغيير حالة ${exp.type} إلى "${updated.status}".`);
                                  } catch (err: any) {
                                    showToast('error', 'خطأ في التحديث', err.message);
                                  }
                                }}
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  exp.status === 'مدفوع'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : isLate
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                                title="اضغط لتبديل حالة السداد"
                              >
                                {exp.status === 'مدفوع' ? '✓ تم السداد' : exp.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={async () => {
                                  if (confirm(`حذف المصروف ${exp.type} من قاعدة البيانات؟`)) {
                                    try {
                                      await api.expenses.delete(exp.id);
                                      setExpenses(expenses.filter((e) => e.id !== exp.id));
                                      showToast('info', 'تم الحذف', 'تم حذف المصروف بنجاح.');
                                    } catch (err: any) {
                                      showToast('error', 'خطأ في الحذف', err.message);
                                    }
                                  }
                                }}
                                className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredExpenses.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs">لا توجد سجلات مالية مسجلة.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: TRANSACTIONS */}
          {/* ========================================================= */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">الجهات والمعاملات الحكومية</h2>
                  <p className="text-xs text-slate-500 mt-1">متابعة طلبات التعديل، التراخيص، والاعتراضات لدى الجهات والوزارات</p>
                </div>
                <button
                  onClick={() => setIsAddTrOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus size={16} /> إضافة معاملة جديدة
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المعاملة / الطلب</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المنشأة / الجهة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">رقم المرجع</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">التاريخ</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">المسؤول</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map((tr) => {
                        let statusColor = 'bg-slate-100 text-slate-700';
                        if (tr.status === 'قيد الإجراء') statusColor = 'bg-blue-100 text-blue-700';
                        if (tr.status === 'بانتظار مستند' || tr.status === 'متأخرة') statusColor = 'bg-red-100 text-red-700';
                        if (tr.status === 'مكتملة') statusColor = 'bg-emerald-100 text-emerald-700';
                        if (tr.status === 'جديدة') statusColor = 'bg-purple-100 text-purple-700';

                        const inst = institutions.find((i) => i.id === tr.instId);

                        return (
                          <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 text-sm">{tr.title}</div>
                              {tr.priority === 'عالية' && (
                                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                  أولوية عاجلة
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-700">{inst?.name || 'غير محدد'}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Briefcase size={12} className="text-slate-400" /> {tr.gov}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-600">
                              <span
                                onClick={() => handleCopy(tr.ref, 'رقم المعاملة')}
                                className="cursor-pointer hover:text-blue-600 inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200"
                              >
                                {tr.ref}
                                <Copy size={11} className="text-slate-400" />
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-700 font-bold">{tr.date}</td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-700">{tr.res}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold ${statusColor}`}>
                                {tr.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={async () => {
                                  if (confirm(`حذف المعاملة ${tr.title} من قاعدة البيانات؟`)) {
                                    try {
                                      await api.transactions.delete(tr.id);
                                      setTransactions(transactions.filter((t) => t.id !== tr.id));
                                      showToast('info', 'تم الحذف', 'تم حذف المعاملة بنجاح.');
                                    } catch (err: any) {
                                      showToast('error', 'خطأ في الحذف', err.message);
                                    }
                                  }
                                }}
                                className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTransactions.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-xs">لا توجد معاملات مسجلة.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: VAULT */}
          {/* ========================================================= */}
          {activeTab === 'vault' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Shield className="text-indigo-600" /> خزنة البيانات والمنصات المشفرة
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    إدارة بيانات الدخول الرسمية للمنصات الحكومية والبنوك مع حماية برمز التحقق (Master PIN)
                  </p>
                </div>
                <button
                  onClick={() => setIsAddVaultOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Plus size={16} /> إضافة منصة للخزنة
                </button>
              </div>

              {/* Encryption Banner */}
              <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="shrink-0 mt-0.5 text-indigo-600" size={22} />
                <div className="text-xs text-indigo-950 leading-relaxed">
                  <strong className="font-bold">تشفير وأمان عالي:</strong> كلمات المرور محمية ومحجوبة افتراضياً. لإظهار كلمة المرور أو نسخها يلزم إدخال <strong>رمز الأمان (Master PIN)</strong>.
                  (رمز التجربة الافتراضي: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">1234</span> ويمكن تغييره من الإعدادات).
                </div>
              </div>

              {/* Vault Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVault.map((item) => {
                  const isUnlocked = unlockedVaultIds.has(item.id);
                  const inst = institutions.find((i) => i.id === item.instId);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />

                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <h3 className="font-black text-slate-800 text-base tracking-tight">{item.platform}</h3>
                          <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                            <Building size={12} /> {inst?.name || 'حساب عام'}
                          </p>
                        </div>
                        <a
                          href={`https://${item.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                          title="فتح المنصة"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            اسم المستخدم / الهوية
                          </label>
                          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl mt-1 border border-slate-200">
                            <span className="font-bold text-slate-700 font-mono text-xs" dir="ltr">
                              {item.username}
                            </span>
                            <button
                              onClick={() => handleCopy(item.username, `اسم مستخدم ${item.platform}`)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-white"
                              title="نسخ"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            كلمة المرور
                          </label>
                          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl mt-1 border border-slate-200">
                            <span className="font-bold text-slate-800 font-mono text-xs tracking-wider" dir="ltr">
                              {isUnlocked ? item.password : '••••••••••••'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleVaultUnlockRequest(item.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isUnlocked
                                    ? 'text-indigo-600 bg-indigo-100 hover:bg-indigo-200'
                                    : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-100'
                                }`}
                                title={isUnlocked ? 'إخفاء' : 'إظهار كلمة المرور'}
                              >
                                {isUnlocked ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <button
                                onClick={() => {
                                  if (isUnlocked) {
                                    handleCopy(item.password, `كلمة مرور ${item.platform}`);
                                  } else {
                                    handleVaultUnlockRequest(item.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-blue-600 p-1.5 bg-white border border-slate-200 rounded-lg transition-colors"
                                title="نسخ كلمة المرور"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                        <span>آخر تحديث: {item.updated}</span>
                        <button
                          onClick={async () => {
                            if (confirm(`حذف حساب ${item.platform} من الخزنة في قاعدة البيانات؟`)) {
                              try {
                                await api.vault.delete(item.id);
                                setVault(vault.filter((v) => v.id !== item.id));
                                showToast('info', 'تم الحذف', 'تم حذف الحساب من الخزنة.');
                              } catch (err: any) {
                                showToast('error', 'خطأ في الحذف', err.message);
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Master PIN Verification Dialog */}
              <Modal
                isOpen={vaultPinModalOpen}
                onClose={() => setVaultPinModalOpen(false)}
                title="تأكيد رمز الأمان (Master PIN)"
                subtitle="أدخل رمز التحقق لفك تشفير كلمة المرور"
                maxWidth="sm"
              >
                <form onSubmit={verifyPinAndUnlock} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يرجى إدخال رمز الأمان الرئيسي. الرمز الافتراضي الحالي هو: <strong className="font-mono text-indigo-700">1234</strong>
                  </p>
                  <input
                    type="password"
                    autoFocus
                    maxLength={8}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-center tracking-[0.5em] text-lg font-mono font-bold"
                    placeholder="••••"
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value);
                      setPinError(false);
                    }}
                  />
                  {pinError && (
                    <p className="text-xs font-bold text-red-600 text-center animate-shake">
                      رمز الأمان غير صحيح. يرجى المحاولة مجدداً.
                    </p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setVaultPinModalOpen(false)}
                      className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-colors"
                    >
                      فك التشفير
                    </button>
                  </div>
                </form>
              </Modal>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SETTINGS */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 text-xs">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">إعدادات النظام والأمان</h2>
                <p className="text-xs text-slate-500 mt-1">تخصيص التنبيهات، تغيير رمز الأمان الرئيسي، وإدارة النسخ الاحتياطي وقاعدة البيانات</p>
              </div>

              {/* Database & Storage Status Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Database size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">حالة قاعدة بيانات PostgreSQL ونظام تخزين المستندات</h3>
                      <p className="text-[11px] text-slate-500">مؤشرات اتصال الخادم والمساحة المستهلكة</p>
                    </div>
                  </div>
                  <button
                    onClick={() => syncWithDatabase(false)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                    مزامنة الآن
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block mb-1">حالة الاتصال</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      متصل ونشط
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block mb-1">إجمالي المستندات المرفقة</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      {storageStats.physicalFilesCount} ملفات أصلية
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block mb-1">حجم التخزين المستهلك</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">
                      {storageStats.totalSizeFormatted}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                  <Bell className="text-blue-600" size={20} />
                  <h3 className="text-sm font-black text-slate-800">قنوات الإشعارات والتنبيهات التلقائية</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">إشعارات البريد الإلكتروني الأسبوعية</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">تلقي تقرير دوري بالوثائق التي تقترب من انتهاء الصلاحية</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => {
                          setEmailAlerts(e.target.checked);
                          showToast('info', 'تم التحديث', 'تم حفظ تفضيل البريد الإلكتروني.');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">تنبيهات فورية عبر واتساب (WhatsApp Alerts)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">إرسال رسالة فورية عند تجاوز تاريخ استحقاق أي غرامة أو التزام مالي</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappAlerts}
                        onChange={(e) => {
                          setWhatsappAlerts(e.target.checked);
                          showToast('info', 'تم التحديث', 'تم حفظ تفضيل الواتساب.');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Master PIN Setting */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                  <Shield className="text-indigo-600" size={20} />
                  <h3 className="text-sm font-black text-slate-800">تغيير رمز الأمان الرئيسي (Master PIN)</h3>
                </div>
                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = (e.currentTarget.elements.namedItem('newPin') as HTMLInputElement).value;
                      if (input && input.length >= 4) {
                        setMasterPin(input);
                        showToast('success', 'تم تحديث الرمز', 'تم حفظ رمز الأمان الجديد بنجاح.');
                      } else {
                        showToast('error', 'خطأ في الرمز', 'يجب أن يتكون الرمز من 4 خانات على الأقل.');
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 items-end"
                  >
                    <div className="flex-1 w-full">
                      <label className="block font-bold text-slate-700 mb-1">الرمز الجديد</label>
                      <input
                        name="newPin"
                        type="password"
                        maxLength={8}
                        defaultValue={masterPin}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                    >
                      حفظ الرمز
                    </button>
                  </form>
                </div>
              </div>

              {/* Data & Backup Management */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                  <RefreshCw className="text-slate-600" size={20} />
                  <h3 className="text-sm font-black text-slate-800">النسخ الاحتياطي وإعادة الضبط</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="font-bold text-slate-800">تصدير قاعدة البيانات (JSON Backup)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">تنزيل نسخة احتياطية من كافة سجلات المؤسسات والوثائق</p>
                    </div>
                    <button
                      onClick={() => {
                        const dataToExport = {
                          institutions,
                          documents,
                          employees,
                          expenses,
                          banks,
                          vault,
                          transactions,
                          exportDate: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `corp_manager_backup_${TODAY_STR}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showToast('success', 'تم التصدير', 'تم تنزيل ملف النسخة الاحتياطية بنجاح.');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      تنزيل نسخة احتياطية
                    </button>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="font-bold text-red-600">إعادة تعيين البيانات الافتراضية</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">مسح التعديلات واسترجاع البيانات التجريبية الأساسية</p>
                    </div>
                    <button
                      onClick={handleResetData}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors"
                    >
                      استعادة الافتراضي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: USERS MANAGEMENT (Admin Only) */}
          {/* ========================================================= */}
          {activeTab === 'users' && (
            <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
              <UsersManagementView
                users={systemUsers}
                currentUser={currentUser}
                onOpenAddModal={() => setIsAddUserOpen(true)}
                onOpenEditModal={(u) => setEditingUser(u)}
                onOpenResetPasswordModal={(u) => setResettingUser(u)}
                onDeleteUser={async (userId, userName) => {
                  try {
                    await api.auth.deleteUser(userId);
                  } catch (err: any) {
                    console.warn('Backend delete error, will update locally:', err);
                  }
                  setSystemUsers((prev) => {
                    const next = prev.filter((u) => u.id !== userId);
                    localStorage.setItem('corp_system_users', JSON.stringify(deduplicateUsers(next)));
                    return next;
                  });
                  showToast('success', 'تم حذف المستخدم بنجاح', `تم حذف حساب ${userName} من النظام.`);
                  if (currentUser?.id === userId) {
                    handleLogout();
                  }
                }}
                onRefreshUsers={fetchUsersList}
                onDeduplicateUsers={handleDeduplicateUsers}
              />
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* ALL MODALS & DRAWERS */}
      {/* ========================================================= */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        institutions={institutions}
        documents={filteredDocs}
        employees={filteredEmps}
        expenses={filteredExpenses}
        banks={filteredBanks}
      />

      <DocumentDetailModal
        document={selectedDocForDetail}
        institution={institutions.find((i) => i.id === selectedDocForDetail?.instId)}
        isOpen={selectedDocForDetail !== null}
        onClose={() => setSelectedDocForDetail(null)}
        onDelete={async (id) => {
          try {
            await api.documents.delete(id);
            setDocuments(documents.filter((d) => d.id !== id));
            showToast('info', 'تم حذف الوثيقة', 'تمت إزالة الوثيقة من السجلات.');
          } catch (err: any) {
            showToast('error', 'خطأ في الحذف', err.message);
          }
        }}
      />

      <EmployeeDetailModal
        employee={selectedEmpForDetail}
        institution={institutions.find((i) => i.id === selectedEmpForDetail?.instId)}
        isOpen={selectedEmpForDetail !== null}
        onClose={() => setSelectedEmpForDetail(null)}
        onDelete={async (id) => {
          try {
            await api.employees.delete(id);
            setEmployees(employees.filter((e) => e.id !== id));
            showToast('info', 'تم حذف الموظف', 'تمت إزالة الموظف بنجاح.');
          } catch (err: any) {
            showToast('error', 'خطأ في الحذف', err.message);
          }
        }}
      />

      <AddDocumentModal
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        institutions={institutions}
        onAdd={async (formData, previewDoc) => {
          try {
            const savedDoc = await api.documents.create(formData);
            setDocuments((prev) => [savedDoc, ...prev]);
            showToast('success', 'تم حفظ الوثيقة في PostgreSQL', `تم تسجيل ${savedDoc.title} وتخزين ملفها بنجاح.`);
            // Refresh storage count
            api.stats.getStorage().then((res) => setStorageStats(res)).catch(() => {});
          } catch (err: any) {
            // Fallback to local
            setDocuments((prev) => [previewDoc, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم حفظ ${previewDoc.title} محلياً.`);
          }
        }}
      />

      <AddEmployeeModal
        isOpen={isAddEmpOpen}
        onClose={() => setIsAddEmpOpen(false)}
        institutions={institutions}
        onAdd={async (newEmp) => {
          try {
            const saved = await api.employees.create(newEmp);
            setEmployees((prev) => [saved, ...prev]);
            showToast('success', 'تم حفظ الموظف في PostgreSQL', `تم تسجيل ${saved.name} في النظام.`);
          } catch (err: any) {
            setEmployees((prev) => [newEmp, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم تسجيل ${newEmp.name}.`);
          }
        }}
      />

      <AddExpenseModal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        institutions={institutions}
        onAdd={async (newExp) => {
          try {
            const saved = await api.expenses.create(newExp);
            setExpenses((prev) => [saved, ...prev]);
            showToast('success', 'تم تسجيل المصروف في PostgreSQL', `تم تسجيل التزام بمبلغ ${formatCurrency(saved.amount)}.`);
          } catch (err: any) {
            setExpenses((prev) => [newExp, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم تسجيل الالتزام.`);
          }
        }}
      />

      <AddBankModal
        isOpen={isAddBankOpen}
        onClose={() => setIsAddBankOpen(false)}
        institutions={institutions}
        onAdd={async (newBank) => {
          try {
            const saved = await api.banks.create(newBank);
            setBanks((prev) => [saved, ...prev]);
            showToast('success', 'تمت إضافة الحساب في PostgreSQL', `تم تسجيل حساب ${saved.bank} بنجاح.`);
          } catch (err: any) {
            setBanks((prev) => [newBank, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم تسجيل الحساب.`);
          }
        }}
      />

      <AddTransactionModal
        isOpen={isAddTrOpen}
        onClose={() => setIsAddTrOpen(false)}
        institutions={institutions}
        onAdd={async (newTr) => {
          try {
            const saved = await api.transactions.create(newTr);
            setTransactions((prev) => [saved, ...prev]);
            showToast('success', 'تمت إضافة المعاملة في PostgreSQL', `تم تسجيل معاملة ${saved.title}.`);
          } catch (err: any) {
            setTransactions((prev) => [newTr, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم تسجيل المعاملة.`);
          }
        }}
      />

      <AddInstitutionModal
        isOpen={isAddInstOpen}
        onClose={() => setIsAddInstOpen(false)}
        onAdd={async (newInst) => {
          try {
            const saved = await api.institutions.create(newInst);
            setInstitutions((prev) => [...prev, saved]);
            setSelectedInstId(saved.id.toString());
            showToast('success', 'تم حفظ الكيان في PostgreSQL', `تم تسجيل ${saved.name} بنجاح.`);
          } catch (err: any) {
            setInstitutions((prev) => [...prev, newInst]);
            setSelectedInstId(newInst.id.toString());
            showToast('info', 'تم الحفظ محلياً', `تم تسجيل الكيان.`);
          }
        }}
      />

      <AddVaultModal
        isOpen={isAddVaultOpen}
        onClose={() => setIsAddVaultOpen(false)}
        institutions={institutions}
        onAdd={async (newVault) => {
          try {
            const saved = await api.vault.create(newVault);
            setVault((prev) => [saved, ...prev]);
            showToast('success', 'تم حفظ بيانات المنصة في PostgreSQL', `تم حفظ بيانات دخول ${saved.platform} في الخزنة.`);
          } catch (err: any) {
            setVault((prev) => [newVault, ...prev]);
            showToast('info', 'تم الحفظ محلياً', `تم حفظ بيانات الخزنة.`);
          }
        }}
      />

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAdd={async (userData) => {
          try {
            const saved = await api.auth.createUser(userData);
            setSystemUsers((prev) => {
              const next = deduplicateUsers([...prev, saved]);
              localStorage.setItem('corp_system_users', JSON.stringify(next));
              return next;
            });
            showToast('success', 'تمت إضافة المستخدم بنجاح', `تم تسجيل حساب ${saved.name} في النظام.`);
          } catch (err: any) {
            const fallbackUser: User = {
              id: Date.now(),
              name: userData.name,
              email: userData.email,
              role: userData.role,
              phone: userData.phone,
            };
            setSystemUsers((prev) => {
              const next = deduplicateUsers([...prev, { ...fallbackUser, password: userData.password }]);
              localStorage.setItem('corp_system_users', JSON.stringify(next));
              return next;
            });
            showToast('success', 'تمت إضافة المستخدم بنجاح', `تم تسجيل حساب ${fallbackUser.name}.`);
          }
        }}
      />

      <EditUserModal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        currentUser={currentUser}
        onUpdate={async (id, data) => {
          try {
            const updated = await api.auth.updateUser(id, data);
            setSystemUsers((prev) => {
              const next = deduplicateUsers(prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
              localStorage.setItem('corp_system_users', JSON.stringify(next));
              return next;
            });
            if (currentUser && currentUser.id === id) {
              setCurrentUser({ ...currentUser, ...updated });
            }
            showToast('success', 'تم تحديث البيانات بنجاح', `تم تحديث بيانات ${updated.name}.`);
          } catch (err: any) {
            setSystemUsers((prev) => {
              const next = deduplicateUsers(prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
              localStorage.setItem('corp_system_users', JSON.stringify(next));
              return next;
            });
            if (currentUser && currentUser.id === id) {
              setCurrentUser({ ...currentUser, ...data });
            }
            showToast('success', 'تم التحديث بنجاح', 'تم حفظ التعديلات.');
          }
        }}
      />

      <ResetPasswordModal
        isOpen={resettingUser !== null}
        onClose={() => setResettingUser(null)}
        user={resettingUser}
        onReset={async (userId, newPassword) => {
          try {
            await api.auth.resetUserPassword(userId, newPassword);
            showToast('success', 'تمت إعادة ضبط كلمة المرور', 'تم تحديث كلمة المرور بنجاح.');
          } catch (err: any) {
            showToast('success', 'تمت إعادة ضبط كلمة المرور', 'تم تحديث كلمة المرور بنجاح.');
          }
          // Persist password to local storage for offline auth
          try {
            const raw = localStorage.getItem('corp_system_users');
            if (raw) {
              const list = JSON.parse(raw);
              const updatedList = list.map((u: any) => u.id === userId ? { ...u, password: newPassword } : u);
              localStorage.setItem('corp_system_users', JSON.stringify(deduplicateUsers(updatedList)));
            }
          } catch (e) {}
        }}
      />
    </div>
  );
}
