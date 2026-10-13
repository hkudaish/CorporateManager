import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query } from '../db';
import { upload, DOCUMENTS_UPLOAD_DIR } from '../middleware/upload';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/documents (List documents)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { instId, search } = req.query;
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params: any[] = [];

    if (instId && instId !== 'all') {
      params.push(parseInt(instId as string, 10));
      sql += ` AND inst_id = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(issuer) LIKE $${params.length} OR LOWER(ref) LIKE $${params.length})`;
    }

    sql += ' ORDER BY id DESC;';

    const result = await query(sql, params);

    // Format response to match frontend camelCase/snake_case
    const docs = result.rows.map((row) => ({
      id: row.id,
      instId: row.inst_id,
      title: row.title,
      type: row.type,
      issuer: row.issuer,
      ref: row.ref,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date,
      status: row.status,
      resPerson: row.res_person,
      notes: row.notes,
      fileUrl: row.file_url,
      fileName: row.file_name,
      fileSize: row.file_size ? parseInt(row.file_size, 10) : null,
      mimeType: row.mime_type,
      createdAt: row.created_at,
    }));

    res.json({ success: true, count: docs.length, documents: docs });
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ success: false, message: 'فشل في استرجاع الوثائق.', error: error.message });
  }
});

// POST /api/documents (Create document with optional file upload)
router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        instId,
        title,
        type,
        issuer,
        ref,
        issueDate,
        expiryDate,
        status,
        resPerson,
        notes,
      } = req.body;

      if (!title || !expiryDate) {
        res.status(400).json({ success: false, message: 'عنوان الوثيقة وتاريخ الانتهاء حقول إلزامية.' });
        return;
      }

      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      if (req.file) {
        fileName = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
        fileUrl = `/uploads/documents/${req.file.filename}`;
      }

      const insertRes = await query(
        `INSERT INTO documents 
         (inst_id, title, type, issuer, ref, issue_date, expiry_date, status, res_person, notes, file_url, file_name, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *;`,
        [
          instId ? parseInt(instId, 10) : 1,
          title,
          type || 'سجل تجاري',
          issuer || 'وزارة التجارة',
          ref || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate || null,
          expiryDate,
          status || 'سارية',
          resPerson || req.user?.name || 'المسؤول العام',
          notes || null,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
        ]
      );

      const created = insertRes.rows[0];

      // Audit Log
      await query(
        'INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5);',
        [
          req.user?.id,
          'إضافة وثيقة جديدة',
          'documents',
          created.id,
          `تم تسجيل وثيقة: ${created.title} برقم مرجعي ${created.ref} مع ملف ${fileName || 'بدون ملف مرفق'}.`,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'تم حفظ الوثيقة وتخزينها بنجاح في قاعدة البيانات.',
        document: {
          id: created.id,
          instId: created.inst_id,
          title: created.title,
          type: created.type,
          issuer: created.issuer,
          ref: created.ref,
          issueDate: created.issue_date,
          expiryDate: created.expiry_date,
          status: created.status,
          resPerson: created.res_person,
          notes: created.notes,
          fileUrl: created.file_url,
          fileName: created.file_name,
          fileSize: created.file_size ? parseInt(created.file_size, 10) : null,
          mimeType: created.mime_type,
          createdAt: created.created_at,
        },
      });
    } catch (error: any) {
      console.error('Create document error:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الوثيقة.', error: error.message });
    }
  }
);

// PUT /api/documents/:id (Update document)
router.put(
  '/:id',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const docId = parseInt(req.params.id, 10);
      const {
        instId,
        title,
        type,
        issuer,
        ref,
        issueDate,
        expiryDate,
        status,
        resPerson,
        notes,
      } = req.body;

      // Check existing
      const existingRes = await query('SELECT * FROM documents WHERE id = $1;', [docId]);
      if (existingRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'الوثيقة غير موجودة.' });
        return;
      }

      const existing = existingRes.rows[0];
      let fileUrl = existing.file_url;
      let fileName = existing.file_name;
      let fileSize = existing.file_size;
      let mimeType = existing.mime_type;

      if (req.file) {
        // Delete old physical file if exists
        if (existing.file_url) {
          const oldFilePath = path.join(DOCUMENTS_UPLOAD_DIR, path.basename(existing.file_url));
          if (fs.existsSync(oldFilePath)) {
            try { fs.unlinkSync(oldFilePath); } catch (e) { /* ignore */ }
          }
        }
        fileName = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
        fileUrl = `/uploads/documents/${req.file.filename}`;
      }

      const updateRes = await query(
        `UPDATE documents 
         SET inst_id = COALESCE($1, inst_id),
             title = COALESCE($2, title),
             type = COALESCE($3, type),
             issuer = COALESCE($4, issuer),
             ref = COALESCE($5, ref),
             issue_date = COALESCE($6, issue_date),
             expiry_date = COALESCE($7, expiry_date),
             status = COALESCE($8, status),
             res_person = COALESCE($9, res_person),
             notes = COALESCE($10, notes),
             file_url = $11,
             file_name = $12,
             file_size = $13,
             mime_type = $14,
             updated_at = NOW()
         WHERE id = $15
         RETURNING *;`,
        [
          instId ? parseInt(instId, 10) : null,
          title || null,
          type || null,
          issuer || null,
          ref || null,
          issueDate || null,
          expiryDate || null,
          status || null,
          resPerson || null,
          notes || null,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          docId,
        ]
      );

      const updated = updateRes.rows[0];

      res.json({
        success: true,
        message: 'تم تحديث الوثيقة بنجاح.',
        document: {
          id: updated.id,
          instId: updated.inst_id,
          title: updated.title,
          type: updated.type,
          issuer: updated.issuer,
          ref: updated.ref,
          issueDate: updated.issue_date,
          expiryDate: updated.expiry_date,
          status: updated.status,
          resPerson: updated.res_person,
          notes: updated.notes,
          fileUrl: updated.file_url,
          fileName: updated.file_name,
          fileSize: updated.file_size ? parseInt(updated.file_size, 10) : null,
          mimeType: updated.mime_type,
          updatedAt: updated.updated_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الوثيقة.', error: error.message });
    }
  }
);

// DELETE /api/documents/:id (Delete document & remove file)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const docId = parseInt(req.params.id, 10);
    const existing = await query('SELECT * FROM documents WHERE id = $1;', [docId]);

    if (existing.rows.length === 0) {
      res.status(404).json({ success: false, message: 'الوثيقة غير موجودة.' });
      return;
    }

    const doc = existing.rows[0];

    // Remove file from disk
    if (doc.file_url) {
      const filePath = path.join(DOCUMENTS_UPLOAD_DIR, path.basename(doc.file_url));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    await query('DELETE FROM documents WHERE id = $1;', [docId]);

    await query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5);',
      [req.user?.id, 'حذف وثيقة', 'documents', docId, `تم حذف وثيقة ${doc.title} (${doc.ref}).`]
    );

    res.json({ success: true, message: 'تم حذف الوثيقة وملفها المرفق بنجاح.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'فشل في حذف الوثيقة.', error: error.message });
  }
});

// GET /api/documents/:id/download (Download document file)
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const docId = parseInt(req.params.id, 10);
    const docRes = await query('SELECT * FROM documents WHERE id = $1;', [docId]);

    if (docRes.rows.length === 0 || !docRes.rows[0].file_url) {
      res.status(404).json({ success: false, message: 'الملف المرفق غير موجود لهذه الوثيقة.' });
      return;
    }

    const doc = docRes.rows[0];
    const physicalPath = path.join(DOCUMENTS_UPLOAD_DIR, path.basename(doc.file_url));

    if (!fs.existsSync(physicalPath)) {
      res.status(404).json({ success: false, message: 'الملف غير موجود على خادم التخزين.' });
      return;
    }

    res.download(physicalPath, doc.file_name || 'document.pdf');
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تحميل الملف.' });
  }
});

export default router;
