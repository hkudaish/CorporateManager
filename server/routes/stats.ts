import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { query, checkDatabaseHealth } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { DOCUMENTS_UPLOAD_DIR } from '../middleware/upload';

const router = Router();

// GET /api/stats/health
router.get('/health', async (_req, res: Response): Promise<void> => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    success: dbHealth.status,
    database: {
      type: 'PostgreSQL 18',
      connected: dbHealth.status,
      latencyMs: dbHealth.latency,
      details: dbHealth.details,
    },
    serverTime: new Date().toISOString(),
  });
});

// GET /api/stats/storage
router.get('/storage', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let totalFiles = 0;
    let totalSizeBytes = 0;

    if (fs.existsSync(DOCUMENTS_UPLOAD_DIR)) {
      const files = fs.readdirSync(DOCUMENTS_UPLOAD_DIR);
      totalFiles = files.length;
      for (const file of files) {
        const filePath = path.join(DOCUMENTS_UPLOAD_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          totalSizeBytes += stats.size;
        } catch (e) {
          /* ignore */
        }
      }
    }

    const dbDocsCount = await query('SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as db_size FROM documents;');
    const totalEntities = await query('SELECT COUNT(*) as count FROM institutions;');
    const totalEmployees = await query('SELECT COUNT(*) as count FROM employees;');

    res.json({
      success: true,
      storage: {
        physicalFilesCount: totalFiles,
        totalSizeBytes,
        totalSizeFormatted: `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
        dbReportedSize: parseInt(dbDocsCount.rows[0].db_size, 10),
      },
      counts: {
        documents: parseInt(dbDocsCount.rows[0].count, 10),
        institutions: parseInt(totalEntities.rows[0].count, 10),
        employees: parseInt(totalEmployees.rows[0].count, 10),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات التخزين.', error: error.message });
  }
});

// GET /api/stats/audit-logs
router.get('/audit-logs', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logsRes = await query(
      `SELECT a.*, u.name as user_name, u.email as user_email 
       FROM audit_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.id DESC 
       LIMIT 50;`
    );
    res.json({ success: true, logs: logsRes.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب سجل التدقيق.' });
  }
});

export default router;
