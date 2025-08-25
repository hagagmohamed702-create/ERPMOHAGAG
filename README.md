# نظام ERP العقاري المتكامل

نظام شامل لإدارة العقارات والمبيعات والأقساط مع نظام محاسبي متكامل.

## المميزات الرئيسية

- 📊 لوحة تحكم شاملة بإحصائيات فورية
- 🏢 إدارة المشاريع العقارية والوحدات
- 👥 إدارة العملاء والعقود
- 💰 نظام أقساط متقدم مع متابعة المدفوعات
- 🤝 إدارة الشركاء والمستثمرين
- 🔄 نظام الإرجاعات والاستردادات
- 💳 إدارة الصناديق والتحويلات المالية
- 📑 سندات القبض والصرف
- 📊 تقارير شاملة (PDF/Excel)
- 🔒 نظام تدقيق لتتبع جميع العمليات

## التقنيات المستخدمة

- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: CSS Modules
- **Reports**: PDFMake, ExcelJS
- **Deployment**: Netlify

## متطلبات التشغيل

- Node.js 18+
- PostgreSQL database
- npm أو yarn

## التثبيت والإعداد

### 1. استنساخ المشروع

```bash
git clone https://github.com/Mohagag609/OooooooooooooooooooO.git
cd real-estate-erp
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

أنشئ ملف `.env.local` في المجلد الرئيسي وأضف:

```env
DATABASE_URL="postgresql://your_user:your_password@your_host/your_database?sslmode=require"

# إعدادات أخرى اختيارية
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ENABLE_AUTH=false
AUTH_TRUST_HOST=true
BACKUP_PROVIDER=local
BACKUP_LOCAL_PATH=./backups
```

### 4. إنشاء الجداول في قاعدة البيانات

```bash
npx prisma db push
```

### 5. إضافة البيانات الأولية (اختياري)

```bash
npm run db:seed
```

### 6. تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## النشر على Netlify

### 1. إعداد Netlify

1. قم بإنشاء حساب على [Netlify](https://netlify.com)
2. اربط مستودع GitHub الخاص بك
3. الإعدادات ستكون محددة تلقائياً من `netlify.toml`

### 2. إعداد متغيرات البيئة في Netlify

اذهب إلى **Site settings → Environment variables** وأضف:

- `DATABASE_URL`: رابط قاعدة البيانات PostgreSQL
- أي متغيرات بيئة أخرى تحتاجها

### 3. إعداد قاعدة البيانات في Neon

1. أنشئ حساب على [Neon](https://neon.tech)
2. أنشئ قاعدة بيانات جديدة
3. احصل على رابط الاتصال من لوحة التحكم
4. استخدم الرابط في `DATABASE_URL`

### 4. تشغيل Migrations بعد النشر

بعد نشر الموقع، قم بتشغيل:

```bash
# من جهازك المحلي مع نفس DATABASE_URL
npx prisma db push
npm run db:seed  # اختياري
```

## البنية والهيكل

```
real-estate-erp/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # لوحة التحكم
│   └── real-estate/       # صفحات العقارات
├── lib/                    # المكتبات المساعدة
│   ├── prisma.ts          # Prisma client
│   ├── accounting.ts      # دوال المحاسبة
│   ├── backup.ts          # نظام النسخ الاحتياطي
│   └── reporting.ts       # توليد التقارير
├── prisma/
│   ├── schema.prisma      # مخطط قاعدة البيانات
│   └── seed.ts            # بيانات أولية
├── public/                 # الملفات الثابتة
└── types/                  # TypeScript types
```

## المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'إضافة ميزة رائعة'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح [Issue](https://github.com/Mohagag609/OooooooooooooooooooO/issues) على GitHub.