import { Institution, DocumentItem, Employee, Expense, BankAccount, VaultAccount, Transaction } from '../types';

export const INITIAL_INSTITUTIONS: Institution[] = [
  { id: 1, name: 'شركة الأفق التقنية للاتصالات وتقنية المعلومات', type: 'شركة ذات مسؤولية محدودة', cr: '1010123456', taxId: '300123456700003', status: 'نشطة', city: 'الرياض', estDate: '2015-04-10', owner: 'عبدالله محمد آل الشيخ', color: 'blue' },
  { id: 2, name: 'مؤسسة الرمال المتقدمة للمقاولات العامة', type: 'مؤسسة فردية', cr: '2050987654', taxId: '300987654300003', status: 'نشطة', city: 'الدمام', estDate: '2018-09-22', owner: 'خالد عبدالعزيز العتيبي', color: 'emerald' },
  { id: 3, name: 'مطعم وقهوة الذواقة الراقية', type: 'فرع شركة', cr: '4030555666', taxId: '300555666700003', status: 'تحت التأسيس', city: 'جدة', estDate: '2023-11-05', owner: 'سعد صالح الغامدي', color: 'amber' },
  { id: 4, name: 'سلسلة متاجر التموين السريع', type: 'شركة مساهمة مبسطة', cr: '1010998877', taxId: '300778899000003', status: 'نشطة', city: 'الرياض', estDate: '2021-02-14', owner: 'فهد إبراهيم الدوسري', color: 'purple' },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 1, instId: 1, title: 'السجل التجاري الرئيسي', type: 'سجل تجاري', issuer: 'وزارة التجارة', ref: '1010123456', issueDate: '2023-01-01', expiryDate: '2027-01-01', status: 'سارية', resPerson: 'أحمد عبدالله', notes: 'تجديد سنوي تلقائي عبر منصة الأعمال' },
  { id: 2, instId: 1, title: 'شهادة الزكاة والضريبة والجمارك (ZATCA)', type: 'ضريبة وزكاة', issuer: 'هيئة الزكاة والضريبة', ref: 'Z-9988-2026', issueDate: '2025-05-01', expiryDate: '2026-11-15', status: 'قريبة الانتهاء', resPerson: 'محمود الصالح', notes: 'تم رفع الإقرار الربع سنوي بانتظار السداد' },
  { id: 3, instId: 2, title: 'رخصة البلدية والأنشطة المهنية', type: 'رخصة بلدية', issuer: 'أمانة المنطقة الشرقية', ref: 'MUN-1122-88', issueDate: '2025-06-01', expiryDate: '2026-10-25', status: 'حرج جداً', resPerson: 'خالد عبدالعزيز', notes: 'تحتاج كشف فني من الدفاع المدني قبل التجديد' },
  { id: 4, instId: 3, title: 'عقد الإيجار الموحد الموثق', type: 'عقد إيجار', issuer: 'شبكة إيجار الوطنية', ref: 'EJAR-5544321', issueDate: '2025-08-01', expiryDate: '2027-08-01', status: 'سارية', resPerson: 'سعد صالح', notes: 'دفعة سنوية مستحقة في أغسطس' },
  { id: 5, instId: 1, title: 'شهادة المؤسسة العامة للتأمينات (GOSI)', type: 'تأمينات اجتماعية', issuer: 'المؤسسة العامة للتأمينات', ref: 'GOSI-9842', issueDate: '2025-01-01', expiryDate: '2026-09-30', status: 'منتهية', resPerson: 'سارة خالد', notes: 'تتطلب تسوية متأخرات فرع الرياض' },
  { id: 6, instId: 2, title: 'اشتراك الغرفة التجارية السنوي', type: 'غرفة تجارية', issuer: 'غرفة الشرقية', ref: 'COC-22334', issueDate: '2025-03-15', expiryDate: '2027-03-14', status: 'سارية', resPerson: 'خالد عبدالعزيز', notes: 'الدرجة الأولى الممتازة' },
  { id: 7, instId: 4, title: 'ترخيص السلامة والوقاية (الدفاع المدني)', type: 'دفاع مدني', issuer: 'المديرية العامة للدفاع المدني', ref: 'CD-77441', issueDate: '2025-04-10', expiryDate: '2026-12-10', status: 'قريبة الانتهاء', resPerson: 'فهد إبراهيم', notes: 'شهادة فحص أنظمة الإنذار والإطفاء سارية' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, instId: 1, name: 'أحمد عبدالله حسنين', iqama: '2456789012', nationality: 'مصر', role: 'كبير مهندسي البرمجيات', iqamaExpiry: '2026-11-10', passExpiry: '2028-06-15', status: 'على رأس العمل', phone: '0551234567' },
  { id: 2, instId: 2, name: 'محمد خان جهانغير', iqama: '2345678901', nationality: 'باكستان', role: 'مشرف مشاريع إنشائية', iqamaExpiry: '2026-10-28', passExpiry: '2027-05-10', status: 'على رأس العمل', phone: '0509876543' },
  { id: 3, instId: 1, name: 'سارة خالد الشمري', iqama: '1098765432', nationality: 'السعودية', role: 'مديرة الموارد البشرية والامتثال', iqamaExpiry: '-', passExpiry: '2030-01-01', status: 'على رأس العمل', phone: '0543219876' },
  { id: 4, instId: 1, name: 'جون دو سانتوس', iqama: '2233445566', nationality: 'الفلبين', role: 'مهندس بنية تحتية سحابية', iqamaExpiry: '2026-10-18', passExpiry: '2029-12-12', status: 'على رأس العمل', phone: '0567891234' },
  { id: 5, instId: 3, name: 'كريم عادل درويش', iqama: '2112233445', nationality: 'الأردن', role: 'مدير العمليات والتشغيل', iqamaExpiry: '2027-04-20', passExpiry: '2028-11-01', status: 'على رأس العمل', phone: '0554433221' },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 1, instId: 1, type: 'تجديد السجل التجاري ورسوم الغرفة', amount: 1650, dueDate: '2026-10-15', status: 'مستحق', payee: 'وزارة التجارة والغرف التجارية', category: 'رسوم حكومية' },
  { id: 2, instId: 2, type: 'دفعة إيجار مجمع سكن العمال بالدمام', amount: 28000, dueDate: '2026-11-01', status: 'مستحق', payee: 'شركة الأفق العقارية', category: 'إيجارات' },
  { id: 3, instId: 1, type: 'غرامة تأخير تقديم فحص المنشأة', amount: 3000, dueDate: '2026-09-20', status: 'متأخر', payee: 'أمانة منطقة الرياض', category: 'غرامات وتراخيص' },
  { id: 4, instId: 3, type: 'دفعة تجهيز المعدات الصناعية والأثاث', amount: 45000, dueDate: '2026-08-01', status: 'مدفوع', payee: 'مؤسسة المعدات الذكية', category: 'أصول رأسمالية' },
  { id: 5, instId: 4, type: 'فاتورة اشتراك التأمينات الشهرية (GOSI)', amount: 14200, dueDate: '2026-10-25', status: 'مستحق', payee: 'المؤسسة العامة للتأمينات', category: 'تأمينات ورواتب' },
];

export const INITIAL_BANKS: BankAccount[] = [
  { id: 1, instId: 1, bank: 'مصرف الراجحي', accountName: 'شركة الأفق التقنية للاتصالات', iban: 'SA1280000000608012345678', currency: 'SAR', status: 'نشط' },
  { id: 2, instId: 1, bank: 'البنك الأهلي السعودي (SNB)', accountName: 'شركة الأفق التقنية - الحساب الجاري', iban: 'SA9810000000101012345678', currency: 'SAR', status: 'نشط' },
  { id: 3, instId: 2, bank: 'مصرف الإنماء', accountName: 'مؤسسة الرمال المتقدمة للمقاولات', iban: 'SA3405000000205098765432', currency: 'SAR', status: 'نشط' },
  { id: 4, instId: 4, bank: 'بنك الرياض', accountName: 'سلسلة متاجر التموين السريع', iban: 'SA5520000000404099887766', currency: 'SAR', status: 'نشط' },
];

export const INITIAL_VAULT: VaultAccount[] = [
  { id: 1, instId: 1, platform: 'أبشر أعمال (Absher Business)', username: 'alofooq_tech', password: 'Absher_2026#SecureGov', url: 'business.absher.sa', updated: '2026-08-10' },
  { id: 2, instId: 1, platform: 'منصة قوى (Qiwa)', username: 'admin@alofooq-tech.sa', password: 'Qiwa!Saudi_Corp998', url: 'qiwa.sa', updated: '2026-09-12' },
  { id: 3, instId: 2, platform: 'هيئة الزكاة والضريبة والجمارك (ZATCA)', username: '300987654300003', password: 'Zatca_Fatoora$2026', url: 'zatca.gov.sa', updated: '2026-07-01' },
  { id: 4, instId: 1, platform: 'منصة مقيم (Muqeem)', username: 'muqeem_user_corp', password: 'Muqeem_Pass@8844', url: 'muqeem.sa', updated: '2026-05-18' },
  { id: 5, instId: 4, platform: 'منصة بلدي (Balady)', username: 'balady_tamween_77', password: 'Balady#KSA!2026', url: 'balady.gov.sa', updated: '2026-09-30' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, instId: 1, title: 'تعديل وتوسيع الأنشطة في السجل التجاري', gov: 'وزارة التجارة - منصة الأعمال', status: 'قيد الإجراء', ref: 'REQ-1029384', date: '2026-10-08', res: 'أحمد عبدالله', priority: 'عالية' },
  { id: 2, instId: 2, title: 'إصدار تصريح حفر وإشغال رصيف لمشروع الخبر', gov: 'أمانة المنطقة الشرقية', status: 'بانتظار مستند', ref: 'MUN-991204', date: '2026-10-10', res: 'خالد عبدالعزيز', priority: 'عالية' },
  { id: 3, instId: 3, title: 'تسجيل وإيداع العلامة التجارية لدى الملكية الفكرية', gov: 'الهيئة السعودية للملكية الفكرية', status: 'جديدة', ref: 'SAIP-445511', date: '2026-10-12', res: 'سعد صالح', priority: 'متوسطة' },
  { id: 4, instId: 4, title: 'تجديد شهادة التوطين وربط نطاقات عبر قوى', gov: 'وزارة الموارد البشرية (قوى)', status: 'مكتملة', ref: 'QIWA-883311', date: '2026-10-02', res: 'سارة خالد', priority: 'عادية' },
];
