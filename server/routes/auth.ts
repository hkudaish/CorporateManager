import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

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

export default router;
