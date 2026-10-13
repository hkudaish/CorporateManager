# نظام إدارة الامتثال والشركات المتكامل | Corporate Compliance Manager

نظام مؤسسي شامل ومتطور باللغة العربية لإدارة الشركات والكيانات التجارية، وتتبع التراخيص والسجلات والمستندات الحكومية مع التنبيه الفوري لتواريخ الانتهاء، وإدارة الموظفين والرواتب، والمصروفات، والخزينة الرقمية، وربط متكامل بقاعدة بيانات **PostgreSQL 18** ونظام مصادقة وتشفير متقدم (JWT & bcrypt).

---

## 🚀 المميزات الرئيسية (Core Features)

- **نظام تسجيل دخول ومصادقة قوي (Robust Authentication)**:
  - تشفير كلمات المرور باستخدام خوارزمية `bcrypt`.
  - إدارة الجلسات عبر `JWT (JSON Web Tokens)` مع حماية المسارات (Protected Routes).
  - نظام أدوار وصلاحيات (مدير عام، مسؤول امتثال، مدير مالي، مستعرض).
  - نافذة دخول متطورة مع حسابات تجريبية سريعة.

- **قاعدة بيانات متكاملة (PostgreSQL 18 Database)**:
  - مجمع اتصالات ذكي `pg.Pool` مع رصد صحة الاتصال وسرعة الاستجابة بالمللي ثانية في الوقت الفعلي.
  - جداول مهيكلة ومفهرسة للمستخدمين، الكيانات، الوثائق، الموظفين، الرسوم، الحسابات البنكية، الخزينة، وسجل التدقيق.

- **نظام حفظ وتخزين المستندات والملفات (Physical File & Attachment Storage)**:
  - رفع وتخزين ملفات الوثائق والتراخيص (PDF، صور، مستندات) في التخزين المادي.
  - فحص أمان الامتدادات والحد الأقصى لحجم الملفات.
  - معاينة وتنزيل الملفات المرفقة بنقرة زر واحدة.

- **إدارة الكيانات والشركات التابعة (Multi-Entity Management)**:
  - السجلات التجارية، نسب الامتثال، أرقام الرخص، وإحصائيات كل كيان.

- **تتبع الوثائق والتراخيص (Document Lifecycle & Urgency Radar)**:
  - حساب تلقائي لدرجة الإلحاح (سارية، قريبة الانتهاء، منتهية).
  - عداد تنازلي دقيق بالأيام وفلترة بحسب الكيان ونوع الوثيقة.

- **إدارة الكوادر والموظفين (HR & Workforce)**:
  - متابعة الإقامات والجوازات، عقود العمل، الرواتب، وتاريخ انتهاء الوثائق الشخصية.

- **المالية والرسوم الحكومية (Finance & Government Expenses)**:
  - تتبع رسوم تجديد السجلات، الغرف التجارية، رخص الدفاع المدني، والبلديات.

- **الخزينة الرقمية المشفرة (Digital Vault)**:
  - حفظ بيانات الدخول للمنصات الحكومية (قوى، مدد، مقيم، التأمينات، الزكاة والضريبة).
  - حماية بالرقم السري (PIN) مع كشف وإخفاء كلمات المرور ونسخها بنقرة زر.

- **التقارير التنفيذية (Executive PDF/Print Reports)**:
  - توليد تقرير تنفيذي شامل بضغطة زر جاهز للطباعة والتصدير.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **الواجهة الأمامية (Frontend)**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **الواجهة الخلفية (Backend)**: Node.js, Express, TypeScript, Multer, tsx.
- **قاعدة البيانات (Database)**: PostgreSQL 18.
- **الأمان والمصادقة**: bcryptjs, jsonwebtoken, CORS, Dotenv.

---

## 📋 المتطلبات المسبقة (Prerequisites)

- **Node.js** (v18 أو أحدث)
- **PostgreSQL** (v14 أو أحدث - يدعم الإصدار 18)

---

## ⚙️ التثبيت والتشغيل (Getting Started)

### 1. استنساخ المشروع (Clone Repository)
```bash
git clone https://github.com/hkudaish/CorporateManager.git
cd CorporateManager
```

### 2. تثبيت الحزم البرمجية (Install Dependencies)
```bash
npm install
```

### 3. إعداد متغيرات البيئة (Environment Configuration)
قم بإنشاء ملف `.env` بناءً على ملف `.env.example`:
```bash
cp .env.example .env
```
محتويات ملف `.env`:
```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=corporate_manager

# Security & JWT Authentication
JWT_SECRET=super_secure_corporate_compliance_jwt_secret_key_2026_ksa
JWT_EXPIRES_IN=7d

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=25
```

### 4. تشغيل خادم الواجهة الخلفية وقاعدة البيانات (Backend & Database)
```bash
npm run server
```
*سيقوم الخادم تلقائياً بإنشاء قاعدة البيانات `corporate_manager` والجداول وإدخال البيانات التجريبية والمستخدمين في أول تشغيل.*

### 5. تشغيل واجهة المستخدم (Frontend Dev Server)
في نافذة طرفية أخرى:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🔑 الحسابات التجريبية الافتراضية (Demo Accounts)

| الدور الوظيفي | البريد الإلكتروني | كلمة المرور | الصلاحية |
| :--- | :--- | :--- | :--- |
| **المدير العام (Admin)** | `admin@corporate.sa` | `Admin@2026` | كامل الصلاحيات الإدارية وتعديل المستخدمين |
| **مسؤول الامتثال (Compliance)** | `compliance@corporate.sa` | `Comp@2026` | متابعة وتحديث التراخيص والوثائق |
| **المدير المالي (Finance)** | `finance@corporate.sa` | `Fin@2026` | إدارة الحسابات والرسوم الحكومية |

---

## 📂 بنية المشروع (Project Structure)

```
CorporateManager/
├── server/                 # خادم الواجهة الخلفية Express
│   ├── db.ts               # مجمع اتصالات PostgreSQL
│   ├── initDb.ts           # مهيئ الجداول والبيانات التجريبية
│   ├── schema.sql          # مخطط قاعدة البيانات
│   ├── middleware/         # وسائط التحقق من JWT ورفع الملفات
│   └── routes/             # مسارات الـ API (Auth, Docs, Entities, Stats...)
├── src/                    # كود الواجهة الأمامية React
│   ├── components/         # المكونات والنوافذ المنبثقة
│   ├── services/           # خدمات الاتصال بالـ API و التخزين
│   ├── types.ts            # تعريفات TypeScript
│   └── App.tsx             # التطبيق الرئيسي
├── uploads/                # مجلد التخزين المادي للمستندات المرفقة
├── dist/                   # حزم الإنتاج المجمعة (Build)
├── package.json
└── vite.config.ts
```

---

## 📄 الترخيص (License)
هذا المشروع مخصص للاستخدام الإداري والمؤسسي (Private & Proprietary).
