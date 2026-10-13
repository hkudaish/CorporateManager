import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from '../server/routes/auth';
import documentsRouter from '../server/routes/documents';
import institutionsRouter from '../server/routes/institutions';
import employeesRouter from '../server/routes/employees';
import expensesRouter from '../server/routes/expenses';
import banksRouter from '../server/routes/banks';
import vaultRouter from '../server/routes/vault';
import transactionsRouter from '../server/routes/transactions';
import statsRouter from '../server/routes/stats';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

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
    message: 'Corporate Compliance Manager API is running on Vercel Serverless.',
    timestamp: new Date().toISOString(),
  });
});

export default app;
