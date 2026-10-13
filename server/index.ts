import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { initializeDatabase } from './initDb';
import authRouter from './routes/auth';
import documentsRouter from './routes/documents';
import institutionsRouter from './routes/institutions';
import employeesRouter from './routes/employees';
import expensesRouter from './routes/expenses';
import banksRouter from './routes/banks';
import vaultRouter from './routes/vault';
import transactionsRouter from './routes/transactions';
import statsRouter from './routes/stats';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Global Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Static uploads serving
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/banks', banksRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/stats', statsRouter);

// Health check root
app.get('/api', (_req, res) => {
  res.json({
    status: 'online',
    message: 'Corporate Compliance Manager API is running smoothly.',
    db: 'PostgreSQL 18',
    timestamp: new Date().toISOString(),
  });
});

// Start Server and Initialize Database
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 خادم الواجهة الخلفية وقاعدة بيانات PostgreSQL يعمل الآن على المنفذ: http://localhost:${PORT}`);
      console.log(`📁 مجلد رفع وحفظ المستندات المعتمد: ${uploadDir}`);
    });
  } catch (error) {
    console.error('❌ تعذر تشغيل الخادم:', error);
    process.exit(1);
  }
};

startServer();
