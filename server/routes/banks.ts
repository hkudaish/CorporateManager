import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/banks
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId } = req.query;
    let sql = 'SELECT * FROM bank_accounts WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    sql += ' ORDER BY id ASC;';
    const result = await query(sql, params);

    const banks = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      bank: row.bank,
      accountName: row.account_name,
      iban: row.iban,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
    }));

    res.json({ success: true, banks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع الحسابات البنكية.', error: error.message });
  }
});

// POST /api/banks
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, bank, accountName, iban, currency, status } = req.body;

    if (!bank || !accountName || !iban) {
      res.status(400).json({ success: false, message: 'اسم البنك، اسم الحساب، والآيبان حقول إلزامية.' });
      return;
    }

    let cleanIban = iban.replace(/\s+/g, '').toUpperCase();
    if (!cleanIban.startsWith('SA')) {
      cleanIban = `SA${cleanIban}`;
    }

    const insertRes = await query(
      `INSERT INTO bank_accounts (inst_id, bank, account_name, iban, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        instId ? parseInt(instId, 10) : 1,
        bank,
        accountName,
        cleanIban,
        currency || 'SAR',
        status || 'نشط',
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الحساب البنكي بنجاح.',
      bank: {
        id: created.id,
        instId: created.inst_id,
        bank: created.bank,
        accountName: created.account_name,
        iban: created.iban,
        currency: created.currency,
        status: created.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة الحساب البنكي.', error: error.message });
  }
});

// DELETE /api/banks/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM bank_accounts WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف الحساب البنكي بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف الحساب البنكي.' });
  }
});

export default router;
