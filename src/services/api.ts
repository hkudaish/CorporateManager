import {
  User, Institution, DocumentItem, Employee, Expense, BankAccount,
  VaultAccount, Transaction, DatabaseHealth, StorageStats
} from '../types';

const BASE_URL = '/api';

export const getToken = (): string | null => {
  return localStorage.getItem('corp_jwt_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('corp_jwt_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('corp_jwt_token');
};

const getHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Generic fetch handler with error normalization
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const contentType = response.headers.get('content-type') || '';

  // If server returned HTML (e.g. Vercel SPA rewrite fallback when backend is offline)
  if (contentType.includes('text/html')) {
    throw new Error('خادم الواجهة الخلفية غير متصل أو يعمل بوضع الاستضافة الثابتة.');
  }

  const data = await response.json().catch(() => {
    throw new Error('تعذر قراءة الاستجابة من الخادم.');
  });

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || `خطأ في الطلب (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Auth API
  auth: {
    async login(email: string, password: string): Promise<{ user: User; token: string; message: string }> {
      const data = await request<{ success: boolean; user: User; token: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      return data;
    },

    async register(userData: {
      name: string;
      email: string;
      password: string;
      role?: string;
      phone?: string;
    }): Promise<{ user: User; token: string; message: string }> {
      const data = await request<{ success: boolean; user: User; token: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      setToken(data.token);
      return data;
    },

    async getMe(): Promise<User> {
      const data = await request<{ success: boolean; user: User }>('/auth/me');
      return data.user;
    },

    async updateProfile(profileData: {
      name?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    }): Promise<{ user: User; message: string }> {
      return request<{ success: boolean; user: User; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    async getUsers(): Promise<User[]> {
      const data = await request<{ success: boolean; users: User[] }>('/auth/users');
      return data.users;
    },

    async createUser(userData: {
      name: string;
      email: string;
      password: string;
      role: string;
      phone?: string;
    }): Promise<User> {
      const data = await request<{ success: boolean; user: User; message: string }>('/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return data.user;
    },

    async updateUser(id: number, userData: {
      name: string;
      email: string;
      role: string;
      phone?: string;
    }): Promise<User> {
      const data = await request<{ success: boolean; user: User; message: string }>(`/auth/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return data.user;
    },

    async deleteUser(id: number): Promise<void> {
      await request<{ success: boolean; message: string }>(`/auth/users/${id}`, {
        method: 'DELETE',
      });
    },

    async resetUserPassword(id: number, newPassword: string): Promise<void> {
      await request<{ success: boolean; message: string }>(`/auth/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      });
    },

    logout(): void {
      removeToken();
    },
  },

  // Documents & Storage API
  documents: {
    async getAll(instId?: string, search?: string): Promise<DocumentItem[]> {
      const params = new URLSearchParams();
      if (instId && instId !== 'all') params.append('instId', instId);
      if (search) params.append('search', search);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const data = await request<{ success: boolean; documents: DocumentItem[] }>(`/documents${queryStr}`);
      return data.documents;
    },

    async create(formData: FormData): Promise<DocumentItem> {
      const data = await request<{ success: boolean; document: DocumentItem }>('/documents', {
        method: 'POST',
        body: formData,
      });
      return data.document;
    },

    async update(id: number, formData: FormData): Promise<DocumentItem> {
      const data = await request<{ success: boolean; document: DocumentItem }>(`/documents/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return data.document;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/documents/${id}`, {
        method: 'DELETE',
      });
    },

    getDownloadUrl(id: number): string {
      return `${BASE_URL}/documents/${id}/download`;
    },
  },

  // Institutions API
  institutions: {
    async getAll(): Promise<Institution[]> {
      const data = await request<{ success: boolean; institutions: Institution[] }>('/institutions');
      return data.institutions;
    },

    async create(inst: Partial<Institution>): Promise<Institution> {
      const data = await request<{ success: boolean; institution: Institution }>('/institutions', {
        method: 'POST',
        body: JSON.stringify(inst),
      });
      return data.institution;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/institutions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Employees API
  employees: {
    async getAll(instId?: string): Promise<Employee[]> {
      const queryStr = instId && instId !== 'all' ? `?instId=${instId}` : '';
      const data = await request<{ success: boolean; employees: Employee[] }>(`/employees${queryStr}`);
      return data.employees;
    },

    async create(emp: Partial<Employee>): Promise<Employee> {
      const data = await request<{ success: boolean; employee: Employee }>('/employees', {
        method: 'POST',
        body: JSON.stringify(emp),
      });
      return data.employee;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/employees/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Expenses API
  expenses: {
    async getAll(instId?: string): Promise<Expense[]> {
      const queryStr = instId && instId !== 'all' ? `?instId=${instId}` : '';
      const data = await request<{ success: boolean; expenses: Expense[] }>(`/expenses${queryStr}`);
      return data.expenses;
    },

    async create(exp: Partial<Expense>): Promise<Expense> {
      const data = await request<{ success: boolean; expense: Expense }>('/expenses', {
        method: 'POST',
        body: JSON.stringify(exp),
      });
      return data.expense;
    },

    async toggleStatus(id: number): Promise<{ id: number; status: 'مستحق' | 'متأخر' | 'مدفوع' }> {
      const data = await request<{ success: boolean; expense: { id: number; status: any } }>(
        `/expenses/${id}/toggle-status`,
        { method: 'PUT' }
      );
      return data.expense;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/expenses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Bank Accounts API
  banks: {
    async getAll(instId?: string): Promise<BankAccount[]> {
      const queryStr = instId && instId !== 'all' ? `?instId=${instId}` : '';
      const data = await request<{ success: boolean; banks: BankAccount[] }>(`/banks${queryStr}`);
      return data.banks;
    },

    async create(bank: Partial<BankAccount>): Promise<BankAccount> {
      const data = await request<{ success: boolean; bank: BankAccount }>('/banks', {
        method: 'POST',
        body: JSON.stringify(bank),
      });
      return data.bank;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/banks/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Vault API
  vault: {
    async getAll(instId?: string): Promise<VaultAccount[]> {
      const queryStr = instId && instId !== 'all' ? `?instId=${instId}` : '';
      const data = await request<{ success: boolean; vault: VaultAccount[] }>(`/vault${queryStr}`);
      return data.vault;
    },

    async create(account: Partial<VaultAccount>): Promise<VaultAccount> {
      const data = await request<{ success: boolean; item: VaultAccount }>('/vault', {
        method: 'POST',
        body: JSON.stringify(account),
      });
      return data.item;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/vault/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Transactions API
  transactions: {
    async getAll(instId?: string): Promise<Transaction[]> {
      const queryStr = instId && instId !== 'all' ? `?instId=${instId}` : '';
      const data = await request<{ success: boolean; transactions: Transaction[] }>(`/transactions${queryStr}`);
      return data.transactions;
    },

    async create(tr: Partial<Transaction>): Promise<Transaction> {
      const data = await request<{ success: boolean; transaction: Transaction }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(tr),
      });
      return data.transaction;
    },

    async delete(id: number): Promise<void> {
      await request<{ success: boolean }>(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Stats & Health API
  stats: {
    async getHealth(): Promise<DatabaseHealth> {
      const data = await request<{ success: boolean; database: DatabaseHealth }>('/stats/health');
      return data.database;
    },

    async getStorage(): Promise<StorageStats> {
      const data = await request<{ success: boolean; storage: StorageStats }>('/stats/storage');
      return data.storage;
    },
  },
};
