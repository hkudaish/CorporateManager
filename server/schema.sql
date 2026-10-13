-- Corporate Manager - PostgreSQL Schema
-- Database: corporate_manager

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'compliance_officer', 'finance_manager', 'viewer'
    phone VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    cr VARCHAR(50) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'نشطة',
    city VARCHAR(100) NOT NULL,
    est_date VARCHAR(50),
    owner VARCHAR(255),
    color VARCHAR(50) DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    ref VARCHAR(100),
    issue_date VARCHAR(50),
    expiry_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'سارية',
    res_person VARCHAR(255),
    notes TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    iqama VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    iqama_expiry VARCHAR(50),
    pass_expiry VARCHAR(50),
    status VARCHAR(50) DEFAULT 'على رأس العمل',
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    due_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'مستحق',
    payee VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    receipt_url VARCHAR(500),
    receipt_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    bank VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    iban VARCHAR(100) NOT NULL,
    currency VARCHAR(20) DEFAULT 'SAR',
    status VARCHAR(50) DEFAULT 'نشط',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vault_accounts (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    platform VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    updated VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    inst_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    gov VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'جديدة',
    ref VARCHAR(100),
    date VARCHAR(50),
    res VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'عادية',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_docs_inst_id ON documents(inst_id);
CREATE INDEX IF NOT EXISTS idx_docs_expiry ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_emps_inst_id ON employees(inst_id);
CREATE INDEX IF NOT EXISTS idx_emps_iqama ON employees(iqama_expiry);
CREATE INDEX IF NOT EXISTS idx_expenses_due ON expenses(due_date);
