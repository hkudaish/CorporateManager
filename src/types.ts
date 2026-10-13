export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'compliance_officer' | 'finance_manager' | 'viewer';
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Institution {
  id: number;
  name: string;
  type: string;
  cr: string;
  taxId: string;
  status: 'نشطة' | 'تحت التأسيس' | 'معلقة';
  city: string;
  estDate: string;
  owner: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

export interface DocumentItem {
  id: number;
  instId: number;
  title: string;
  type: string;
  issuer: string;
  ref: string;
  issueDate: string;
  expiryDate: string;
  status?: string;
  resPerson: string;
  notes?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt?: string;
}

export interface Employee {
  id: number;
  instId: number;
  name: string;
  iqama: string;
  nationality: string;
  role: string;
  iqamaExpiry: string;
  passExpiry: string;
  status: 'على رأس العمل' | 'إجازة' | 'منتدب' | 'منتهي';
  phone?: string;
}

export interface Expense {
  id: number;
  instId: number;
  type: string;
  amount: number;
  dueDate: string;
  status: 'مستحق' | 'متأخر' | 'مدفوع';
  payee: string;
  category: string;
}

export interface BankAccount {
  id: number;
  instId: number;
  bank: string;
  accountName: string;
  iban: string;
  currency: string;
  status: 'نشط' | 'مجمد';
}

export interface VaultAccount {
  id: number;
  instId: number;
  platform: string;
  username: string;
  password: string;
  url: string;
  updated: string;
}

export interface Transaction {
  id: number;
  instId: number;
  title: string;
  gov: string;
  status: 'قيد الإجراء' | 'بانتظار مستند' | 'مكتملة' | 'متأخرة' | 'جديدة';
  ref: string;
  date: string;
  res: string;
  priority?: 'عالية' | 'متوسطة' | 'عادية';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface DatabaseHealth {
  connected: boolean;
  type: string;
  latencyMs: number;
}

export interface StorageStats {
  physicalFilesCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}
