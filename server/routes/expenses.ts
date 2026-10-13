import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/expenses
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId } = req.query;
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    sql += ' ORDER BY due_date ASC;';
    const result = await query(sql, params);

    const expenses = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      type: row.type,
      amount: parseFloat(row.amount),
      dueDate: row.due_date,
      status: row.status,
      payee: row.payee,
      category: row.category,
      receiptUrl: row.receipt_url,
      createdAt: row.created_at,
    }));

    res.json({ success: true, expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع المصروفات.', error: error.message });
  }
});

// POST /api/expenses
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, type, amount, dueDate, status, payee, category } = req.body;

    if (!type || !amount || !payee) {
      res.status(400).json({ success: false, message: 'بيان المصروف والمبلغ والمستفيد حقول إلزامية.' });
      return;
    }

    const insertRes = await query(
      `INSERT INTO expenses (inst_id, type, amount, due_date, status, payee, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        instId ? parseInt(instId, 10) : 1,
        type,
        parseFloat(amount),
        dueDate || new Date().toISOString().split('T')[0],
        status || 'مستحق',
        payee,
        category || 'رسوم حكومية',
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الالتزام المالي بنجاح.',
      expense: {
        id: created.id,
        instId: created.inst_id,
        type: created.type,
        amount: parseFloat(created.amount),
        dueDate: created.due_date,
        status: created.status,
        payee: created.payee,
        category: created.category,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تسجيل المصروف.', error: error.message });
  }
});

// PUT /api/expenses/:id/toggle-status
router.put('/:id/toggle-status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query('SELECT status FROM expenses WHERE id = $1;', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المصروف غير موجود.' });
      return;
    }

    const newStatus = existing.rows[0].status === 'مدفوع' ? 'مستحق' : 'مدفوع';
    const updated = await query('UPDATE expenses SET status = $1 WHERE id = $2 RETURNING *;', [newStatus, id]);

    res.json({
      success: true,
      message: `تم تحديث الحالة إلى "${newStatus}".`,
      expense: {
        id: updated.rows[0].id,
        status: updated.rows[0].status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في تحديث حالة المصروف.' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM expenses WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف المصروف بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف المصروف.' });
  }
});

export default router;
