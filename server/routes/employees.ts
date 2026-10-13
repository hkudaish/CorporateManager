import { Router, Response } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/employees
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId } = req.query;
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    sql += ' ORDER BY id DESC;';
    const result = await query(sql, params);

    const employees = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      name: row.name,
      iqama: row.iqama,
      nationality: row.nationality,
      role: row.role,
      iqamaExpiry: row.iqama_expiry,
      passExpiry: row.pass_expiry,
      status: row.status,
      phone: row.phone,
      createdAt: row.created_at,
    }));

    res.json({ success: true, employees });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في استرجاع الموظفين.', error: error.message });
  }
});

// POST /api/employees
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, name, iqama, nationality, role, iqamaExpiry, passExpiry, status, phone } = req.body;

    if (!name || !role) {
      res.status(400).json({ success: false, message: 'اسم الموظف والمسمى الوظيفي حقول إلزامية.' });
      return;
    }

    const insertRes = await query(
      `INSERT INTO employees (inst_id, name, iqama, nationality, role, iqama_expiry, pass_expiry, status, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        instId ? parseInt(instId, 10) : 1,
        name,
        iqama || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        nationality || 'السعودية',
        role,
        iqamaExpiry || (nationality === 'السعودية' ? '-' : null),
        passExpiry || '-',
        status || 'على رأس العمل',
        phone || null,
      ]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      success: true,
      message: 'تم تسجيل بيانات الموظف بنجاح.',
      employee: {
        id: created.id,
        instId: created.inst_id,
        name: created.name,
        iqama: created.iqama,
        nationality: created.nationality,
        role: created.role,
        iqamaExpiry: created.iqama_expiry,
        passExpiry: created.pass_expiry,
        status: created.status,
        phone: created.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة الموظف.', error: error.message });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await query('DELETE FROM employees WHERE id = $1;', [id]);
    res.json({ success: true, message: 'تم حذف الموظف من السجلات بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف الموظف.', error: error.message });
  }
});

export default router;
