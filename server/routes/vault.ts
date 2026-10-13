import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/vault
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId } = req.query;
    let sql = 'SELECT * FROM vault_accounts WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    sql += ' ORDER BY id ASC;';
    const result = await query(sql, params);

    const accounts = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      platform: row.platform,
      username: row.username,
      password: row.password,
      url: row.url,
      updated: row.updated,
      createdAt: row.created_at,
    }));

    res.json({ success: true, vault: accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع بيانات الخزنة.', error: error.message });
  }
});

// POST /api/vault
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, platform, username, password, url } = req.body;

    if (!platform || !username || !password) {
      res.status(400).json({ success: false, message: 'اسم المنصة واسم المستخدم وكلمة المرور حقول إلزامية.' });
      return;
    }

    const insertRes = await query(
      `INSERT INTO vault_accounts (inst_id, platform, username, password, url, updated)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        instId ? parseInt(instId, 10) : 1,
        platform,
        username,
        password,
        url || `${platform.toLowerCase().replace(/\s+/g, '')}.gov.sa`,
        new Date().toISOString().split('T')[0],
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تم حفظ حساب المنصة في الخزنة بنجاح.',
      item: {
        id: created.id,
        instId: created.inst_id,
        platform: created.platform,
        username: created.username,
        password: created.password,
        url: created.url,
        updated: created.updated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة الحساب للخزنة.', error: error.message });
  }
});

// DELETE /api/vault/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM vault_accounts WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف الحساب من الخزنة بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف حساب الخزنة.' });
  }
});

export default router;
