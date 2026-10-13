import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/transactions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId } = req.query;
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    sql += ' ORDER BY id DESC;';
    const result = await query(sql, params);

    const transactions = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      title: row.title,
      gov: row.gov,
      status: row.status,
      ref: row.ref,
      date: row.date,
      res: row.res,
      priority: row.priority,
      createdAt: row.created_at,
    }));

    res.json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع المعاملات.', error: error.message });
  }
});

// POST /api/transactions
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, title, gov, ref, date, res: resPerson, status, priority } = req.body;

    if (!title || !gov) {
      res.status(400).json({ success: false, message: 'عنوان المعاملة والجهة حقول إلزامية.' });
      return;
    }

    const insertRes = await query(
      `INSERT INTO transactions (inst_id, title, gov, ref, date, res, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        instId ? parseInt(instId, 10) : 1,
        title,
        gov,
        ref || `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        date || new Date().toISOString().split('T')[0],
        resPerson || req.user?.name || 'المسؤول',
        status || 'جديدة',
        priority || 'عادية',
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تم تسجيل المعاملة بنجاح.',
      transaction: {
        id: created.id,
        instId: created.inst_id,
        title: created.title,
        gov: created.gov,
        ref: created.ref,
        date: created.date,
        res: created.res,
        status: created.status,
        priority: created.priority,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تسجيل المعاملة.', error: error.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM transactions WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف المعاملة بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف المعاملة.' });
  }
});

export default router;
