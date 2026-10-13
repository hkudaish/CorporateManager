import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 جاري تهيئة قاعدة بيانات PostgreSQL (corporate_manager)...');

    // Read and run schema.sql
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await query(schemaSql);
      console.log('✅ تم تطبيق هيكل الجداول والفهارس بنجاح (Schema applied).');
    }

    // 1. Seed Default Users if empty
    const usersCountRes = await query('SELECT COUNT(*) as count FROM users;');
    const usersCount = parseInt(usersCountRes.rows[0].count, 10);

    if (usersCount === 0) {
      console.log('🌱 جاري إضافة مستخدمي النظام الافتراضيين مع كلمات المرور المشفرة (bcrypt)...');
      
      const adminHash = await bcrypt.hash('Admin@2026', 10);
      const ownerHash = await bcrypt.hash('Admin@1480', 10);
      const complianceHash = await bcrypt.hash('Comp@2026', 10);
      const financeHash = await bcrypt.hash('Fin@2026', 10);

      await query(
        `INSERT INTO users (name, email, password_hash, role, phone) VALUES 
         ($1, $2, $3, $4, $5),
         ($6, $7, $8, $9, $10),
         ($11, $12, $13, $14, $15),
         ($16, $17, $18, $19, $20);`,
        [
          'عبدالله محمد آل الشيخ', 'admin@corporate.sa', adminHash, 'admin', '0501234567',
          'حسن حكمي', 'hkudaish@gmail.com', ownerHash, 'admin', '0501234567',
          'سارة خالد الشمري', 'compliance@corporate.sa', complianceHash, 'compliance_officer', '0543219876',
          'محمود صالح الزهراني', 'finance@corporate.sa', financeHash, 'finance_manager', '0559876543'
        ]
      );
      console.log('✅ تم تسجيل المستخدمين المعتمدين (المدير العام، مسؤول امتثال، مدير مالي).');
    }

    // 2. Seed Default Institutions if empty
    const instCountRes = await query('SELECT COUNT(*) as count FROM institutions;');
    const instCount = parseInt(instCountRes.rows[0].count, 10);

    if (instCount === 0) {
      console.log('🌱 جاري استيراد الكيانات والمؤسسات التأسيسية...');

      const instInsert = await query(`
        INSERT INTO institutions (id, name, type, cr, tax_id, status, city, est_date, owner, color) VALUES
        (1, 'شركة الأفق التقنية للاتصالات وتقنية المعلومات', 'شركة ذات مسؤولية محدودة', '1010123456', '300123456700003', 'نشطة', 'الرياض', '2015-04-10', 'عبدالله محمد آل الشيخ', 'blue'),
        (2, 'مؤسسة الرمال المتقدمة للمقاولات العامة', 'مؤسسة فردية', '2050987654', '300987654300003', 'نشطة', 'الدمام', '2018-09-22', 'خالد عبدالعزيز العتيبي', 'emerald'),
        (3, 'مطعم وقهوة الذواقة الراقية', 'فرع شركة', '4030555666', '300555666700003', 'تحت التأسيس', 'جدة', '2023-11-05', 'سعد صالح الغامدي', 'amber'),
        (4, 'سلسلة متاجر التموين السريع', 'شركة مساهمة مبسطة', '1010998877', '300778899000003', 'نشطة', 'الرياض', '2021-02-14', 'فهد إبراهيم الدوسري', 'purple')
        ON CONFLICT DO NOTHING;
      `);

      // Reset sequence
      await query(`SELECT setval('institutions_id_seq', (SELECT MAX(id) FROM institutions));`);

      // Seed Documents
      await query(`
        INSERT INTO documents (id, inst_id, title, type, issuer, ref, issue_date, expiry_date, status, res_person, notes) VALUES
        (1, 1, 'السجل التجاري الرئيسي', 'سجل تجاري', 'وزارة التجارة', '1010123456', '2023-01-01', '2027-01-01', 'سارية', 'أحمد عبدالله', 'تجديد سنوي تلقائي عبر منصة الأعمال'),
        (2, 1, 'شهادة الزكاة والضريبة والجمارك (ZATCA)', 'ضريبة وزكاة', 'هيئة الزكاة والضريبة', 'Z-9988-2026', '2025-05-01', '2026-11-15', 'قريبة الانتهاء', 'محمود الصالح', 'تم رفع الإقرار الربع سنوي بانتظار السداد'),
        (3, 2, 'رخصة البلدية والأنشطة المهنية', 'رخصة بلدية', 'أمانة المنطقة الشرقية', 'MUN-1122-88', '2025-06-01', '2026-10-25', 'حرج جداً', 'خالد عبدالعزيز', 'تحتاج كشف فني من الدفاع المدني قبل التجديد'),
        (4, 3, 'عقد الإيجار الموحد الموثق', 'عقد إيجار', 'شبكة إيجار الوطنية', 'EJAR-5544321', '2025-08-01', '2027-08-01', 'سارية', 'سعد صالح', 'دفعة سنوية مستحقة في أغسطس'),
        (5, 1, 'شهادة المؤسسة العامة للتأمينات (GOSI)', 'تأمينات اجتماعية', 'المؤسسة العامة للتأمينات', 'GOSI-9842', '2025-01-01', '2026-09-30', 'منتهية', 'سارة خالد', 'تتطلب تسوية متأخرات فرع الرياض'),
        (6, 2, 'اشتراك الغرفة التجارية السنوي', 'غرفة تجارية', 'غرفة الشرقية', 'COC-22334', '2025-03-15', '2027-03-14', 'سارية', 'خالد عبدالعزيز', 'الدرجة الأولى الممتازة'),
        (7, 4, 'ترخيص السلامة والوقاية (الدفاع المدني)', 'دفاع مدني', 'المديرية العامة للدفاع المدني', 'CD-77441', '2025-04-10', '2026-12-10', 'قريبة الانتهاء', 'فهد إبراهيم', 'شهادة فحص أنظمة الإنذار والإطفاء سارية')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents));`);

      // Seed Employees
      await query(`
        INSERT INTO employees (id, inst_id, name, iqama, nationality, role, iqama_expiry, pass_expiry, status, phone) VALUES
        (1, 1, 'أحمد عبدالله حسنين', '2456789012', 'مصر', 'كبير مهندسي البرمجيات', '2026-11-10', '2028-06-15', 'على رأس العمل', '0551234567'),
        (2, 2, 'محمد خان جهانغير', '2345678901', 'باكستان', 'مشرف مشاريع إنشائية', '2026-10-28', '2027-05-10', 'على رأس العمل', '0509876543'),
        (3, 1, 'سارة خالد الشمري', '1098765432', 'السعودية', 'مديرة الموارد البشرية والامتثال', '-', '2030-01-01', 'على رأس العمل', '0543219876'),
        (4, 1, 'جون دو سانتوس', '2233445566', 'الفلبين', 'مهندس بنية تحتية سحابية', '2026-10-18', '2029-12-12', 'على رأس العمل', '0567891234'),
        (5, 3, 'كريم عادل درويش', '2112233445', 'الأردن', 'مدير العمليات والتشغيل', '2027-04-20', '2028-11-01', 'على رأس العمل', '0554433221')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));`);

      // Seed Expenses
      await query(`
        INSERT INTO expenses (id, inst_id, type, amount, due_date, status, payee, category) VALUES
        (1, 1, 'تجديد السجل التجاري ورسوم الغرفة', 1650, '2026-10-15', 'مستحق', 'وزارة التجارة والغرف التجارية', 'رسوم حكومية'),
        (2, 2, 'دفعة إيجار مجمع سكن العمال بالدمام', 28000, '2026-11-01', 'مستحق', 'شركة الأفق العقارية', 'إيجارات'),
        (3, 1, 'غرامة تأخير تقديم فحص المنشأة', 3000, '2026-09-20', 'متأخر', 'أمانة منطقة الرياض', 'غرامات وتراخيص'),
        (4, 3, 'دفعة تجهيز المعدات الصناعية والأثاث', 45000, '2026-08-01', 'مدفوع', 'مؤسسة المعدات الذكية', 'أصول رأسمالية'),
        (5, 4, 'فاتورة اشتراك التأمينات الشهرية (GOSI)', 14200, '2026-10-25', 'مستحق', 'المؤسسة العامة للتأمينات', 'تأمينات ورواتب')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('expenses_id_seq', (SELECT MAX(id) FROM expenses));`);

      // Seed Bank Accounts
      await query(`
        INSERT INTO bank_accounts (id, inst_id, bank, account_name, iban, currency, status) VALUES
        (1, 1, 'مصرف الراجحي', 'شركة الأفق التقنية للاتصالات', 'SA1280000000608012345678', 'SAR', 'نشط'),
        (2, 1, 'البنك الأهلي السعودي (SNB)', 'شركة الأفق التقنية - الحساب الجاري', 'SA9810000000101012345678', 'SAR', 'نشط'),
        (3, 2, 'مصرف الإنماء', 'مؤسسة الرمال المتقدمة للمقاولات', 'SA3405000000205098765432', 'SAR', 'نشط'),
        (4, 4, 'بنك الرياض', 'سلسلة متاجر التموين السريع', 'SA5520000000404099887766', 'SAR', 'نشط')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('bank_accounts_id_seq', (SELECT MAX(id) FROM bank_accounts));`);

      // Seed Vault
      await query(`
        INSERT INTO vault_accounts (id, inst_id, platform, username, password, url, updated) VALUES
        (1, 1, 'أبشر أعمال (Absher Business)', 'alofooq_tech', 'Absher_2026#SecureGov', 'business.absher.sa', '2026-08-10'),
        (2, 1, 'منصة قوى (Qiwa)', 'admin@alofooq-tech.sa', 'Qiwa!Saudi_Corp998', 'qiwa.sa', '2026-09-12'),
        (3, 2, 'هيئة الزكاة والضريبة والجمارك (ZATCA)', '300987654300003', 'Zatca_Fatoora$2026', 'zatca.gov.sa', '2026-07-01'),
        (4, 1, 'منصة مقيم (Muqeem)', 'muqeem_user_corp', 'Muqeem_Pass@8844', 'muqeem.sa', '2026-05-18'),
        (5, 4, 'منصة بلدي (Balady)', 'balady_tamween_77', 'Balady#KSA!2026', 'balady.gov.sa', '2026-09-30')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('vault_accounts_id_seq', (SELECT MAX(id) FROM vault_accounts));`);

      // Seed Transactions
      await query(`
        INSERT INTO transactions (id, inst_id, title, gov, status, ref, date, res, priority) VALUES
        (1, 1, 'تعديل وتوسيع الأنشطة في السجل التجاري', 'وزارة التجارة - منصة الأعمال', 'قيد الإجراء', 'REQ-1029384', '2026-10-08', 'أحمد عبدالله', 'عالية'),
        (2, 2, 'إصدار تصريح حفر وإشغال رصيف لمشروع الخبر', 'أمانة المنطقة الشرقية', 'بانتظار مستند', 'MUN-991204', '2026-10-10', 'خالد عبدالعزيز', 'عالية'),
        (3, 3, 'تسجيل وإيداع العلامة التجارية لدى الملكية الفكرية', 'الهيئة السعودية للملكية الفكرية', 'جديدة', 'SAIP-445511', '2026-10-12', 'سعد صالح', 'متوسطة'),
        (4, 4, 'تجديد شهادة التوطين وربط نطاقات عبر قوى', 'وزارة الموارد البشرية (قوى)', 'مكتملة', 'QIWA-883311', '2026-10-02', 'سارة خالد', 'عادية')
        ON CONFLICT DO NOTHING;
      `);
      await query(`SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));`);

      console.log('✅ تم ترحيل كافة السجلات التأسيسية إلى قاعدة بيانات PostgreSQL.');
    }
  } catch (error) {
    console.error('❌ خطأ أثناء تهيئة قاعدة البيانات:', error);
    throw error;
  }
};
