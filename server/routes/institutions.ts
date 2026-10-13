import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/institutions
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM institutions ORDER BY id ASC;');
    const institutions = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      cr: row.cr,
      taxId: row.tax_id,
      status: row.status,
      city: row.city,
      estDate: row.est_date,
      owner: row.owner,
      color: row.color,
      createdAt: row.created_at,
    }));
    res.json({ success: true, institutions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع المنشآت.', error: error.message });
  }
});

// POST /api/institutions
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, cr, taxId, city, estDate, owner, color } = req.body;
    if (!name || !cr) {
      res.status(400).json({ success: false, message: 'اسم المنشأة والسجل التجاري حقول إلزامية.' });
      return;
    }

    const insertRes = await query(
      `INSERT INTO institutions (name, type, cr, tax_id, status, city, est_date, owner, color)
       VALUES ($1, $2, $3, $4, 'نشطة', $5, $6, $7, $8)
       RETURNING *;`,
      [
        name,
        type || 'شركة ذات مسؤولية محدودة',
        cr,
        taxId || `300${Math.floor(10000000 + Math.random() * 90000000)}00003`,
        city || 'الرياض',
        estDate || new Date().toISOString().split('T')[0],
        owner || req.user?.name || 'المالك الحالي',
        color || 'blue',
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الكيان المؤسسي بنجاح.',
      institution: {
        id: created.id,
        name: created.name,
        type: created.type,
        cr: created.cr,
        taxId: created.tax_id,
        status: created.status,
        city: created.city,
        estDate: created.est_date,
        owner: created.owner,
        color: created.color,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة المنشأة.', error: error.message });
  }
});

// DELETE /api/institutions/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM institutions WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف المنشأة وجميع سجلاتها المرتبطة بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف المنشأة.', error: error.message });
  }
});

export default router;
