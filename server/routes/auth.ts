import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { generateToken, authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1;', [cleanEmail]);

    if (userRes.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد أو كلمة المرور.',
      });
      return;
    }

    const user = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة. كلمة المرور غير مطابقة.',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Record audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [user.id, 'تسجيل دخول ناجح', 'users', `قام المستخدم ${user.name} بتسجيل الدخول إلى لوحة التحكم.`]
    );

    res.json({
      success: true,
      message: `مرحباً بك مجدداً، ${user.name}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم أثناء تسجيل الدخول.',
      error: error.message,
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'جميع الحقول الأساسية (الاسم، البريد، كلمة المرور) مطلوبة.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1;', [cleanEmail]);

    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً في النظام.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role || 'compliance_officer';

    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, phone, created_at;`,
      [name.trim(), cleanEmail, passwordHash, assignedRole, phone || null]
    );

    const newUser = insertRes.rows[0];

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [newUser.id, 'إنشاء حساب جديد', 'users', `تم إنشاء حساب جديد باسم ${newUser.name} بصلاحية ${newUser.role}.`]
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح.',
      token,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحساب.',
      error: error.message,
    });
  }
});

// GET /api/auth/me (Current authenticated user profile)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRes = await query('SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = $1;', [userId]);

    if (userRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
      return;
    }

    res.json({
      success: true,
      user: userRes.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء جلب الملف الشخصي.' });
  }
});

// PUT /api/auth/profile (Update profile)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, phone, currentPassword, newPassword } = req.body;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ success: false, message: 'يلزم إدخال كلمة المرور الحالية لتحديث كلمة المرور.' });
        return;
      }

      const userRes = await query('SELECT password_hash FROM users WHERE id = $1;', [userId]);
      const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2;', [newHash, userId]);
    }

    const updated = await query(
      `UPDATE users 
       SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, name, email, role, phone, updated_at;`,
      [name || null, phone || null, userId]
    );

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح.',
      user: updated.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تحديث الملف الشخصي.' });
  }
});

// GET /api/auth/users (List system users)
router.get('/users', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listRes = await query(
      'SELECT id, name, email, role, phone, created_at FROM users ORDER BY id ASC;'
    );
    res.json({
      success: true,
      users: listRes.rows,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء جلب قائمة المستخدمين.' });
  }
});

// POST /api/auth/users (Admin: create new user)
router.post('/users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1;', [cleanEmail]);
    if (existing.rows.length > 0) {
      res.status(409).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً لمستخدم آخر.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role || 'compliance_officer';

    const insertRes = await query(
      `INSERT INTO users (name, email, password_hash, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, phone, created_at;`,
      [name.trim(), cleanEmail, passwordHash, assignedRole, phone ? phone.trim() : null]
    );

    const newUser = insertRes.rows[0];

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [req.user?.id || newUser.id, 'إضافة مستخدم جديد', 'users', `قام المدير العام بإضافة المستخدم ${newUser.name} بصلاحية ${newUser.role}.`]
    );

    res.status(201).json({
      success: true,
      message: 'تمت إضافة المستخدم بنجاح.',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة المستخدم.', error: error.message });
  }
});

// PUT /api/auth/users/:id (Admin: update user)
router.put('/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { name, email, role, phone } = req.body;

    const userCheck = await query('SELECT id, name, email, role FROM users WHERE id = $1;', [targetId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
      return;
    }

    // Check email uniqueness if changed
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2 LIMIT 1;', [cleanEmail, targetId]);
      if (existing.rows.length > 0) {
        res.status(409).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل بحساب آخر.' });
        return;
      }
    }

    const updateRes = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           phone = COALESCE($4, phone),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING id, name, email, role, phone, created_at, updated_at;`,
      [name ? name.trim() : null, email ? email.trim().toLowerCase() : null, role || null, phone ? phone.trim() : null, targetId]
    );

    const updatedUser = updateRes.rows[0];

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [req.user?.id, 'تعديل بيانات مستخدم', 'users', `قام المدير العام بتعديل بيانات المستخدم ${updatedUser.name} (${updatedUser.email}).`]
    );

    res.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تعديل بيانات المستخدم.', error: error.message });
  }
});

// DELETE /api/auth/users/:id (Admin: delete user)
router.delete('/users/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = parseInt(req.params.id, 10);

    const userCheck = await query('SELECT id, name, email FROM users WHERE id = $1;', [targetId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
      return;
    }

    const userName = userCheck.rows[0].name;

    await query('DELETE FROM users WHERE id = $1;', [targetId]);

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [req.user?.id, 'حذف مستخدم', 'users', `قام المدير العام بحذف حساب المستخدم ${userName} (معرف: ${targetId}).`]
    );

    res.json({
      success: true,
      message: `تم حذف حساب ${userName} بنجاح.`,
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف المستخدم.', error: error.message });
  }
});

// POST /api/auth/users/:id/reset-password (Admin: reset user password)
router.post('/users/:id/reset-password', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات.' });
      return;
    }

    const userCheck = await query('SELECT id, name, email FROM users WHERE id = $1;', [targetId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;', [passwordHash, targetId]);

    const userName = userCheck.rows[0].name;

    // Audit log
    await query(
      'INSERT INTO audit_logs (user_id, action, entity, details) VALUES ($1, $2, $3, $4);',
      [req.user?.id, 'إعادة تعيين كلمة المرور', 'users', `قام المدير العام بإعادة تعيين كلمة المرور للمستخدم ${userName}.`]
    );

    res.json({
      success: true,
      message: `تمت إعادة ضبط كلمة المرور للمستخدم ${userName} بنجاح.`,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إعادة ضبط كلمة المرور.', error: error.message });
  }
});

export default router;
