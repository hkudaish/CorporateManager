import multer from 'multer';
import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const defaultUploadDir = isVercel ? '/tmp/uploads' : './uploads';
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || defaultUploadDir);
export const DOCUMENTS_UPLOAD_DIR = path.join(UPLOAD_ROOT, 'documents');

// Ensure directories exist
try {
  if (!fs.existsSync(UPLOAD_ROOT)) {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  }
  if (!fs.existsSync(DOCUMENTS_UPLOAD_DIR)) {
    fs.mkdirSync(DOCUMENTS_UPLOAD_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Upload directory creation warning (acceptable in read-only serverless):', e);
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DOCUMENTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_')
      .substring(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter (documents, certificates, images)
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /pdf|doc|docx|png|jpg|jpeg|webp|xls|xlsx|zip/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('صيغة الملف غير مدعومة. يسمح بـ PDF, DOCX, PNG, JPG, XLS, ZIP فقط.'));
  }
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10)) * 1024 * 1024;

export const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
  },
  fileFilter,
});
