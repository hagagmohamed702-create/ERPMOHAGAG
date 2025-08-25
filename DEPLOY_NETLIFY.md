# دليل النشر على Netlify خطوة بخطوة

## الإعداد الأولي

### 1. إعداد قاعدة البيانات على Neon

1. اذهب إلى [https://neon.tech](https://neon.tech)
2. أنشئ حساب جديد أو سجل دخول
3. اضغط على "Create a database"
4. اختر:
   - Database name: `real-estate-erp`
   - Region: اختر الأقرب لك (مثل US East)
5. انسخ رابط الاتصال الذي يبدأ بـ `postgresql://`

### 2. إعداد المشروع على GitHub

تأكد من أن مشروعك محدث على GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## النشر على Netlify

### 1. إنشاء موقع جديد

1. اذهب إلى [https://app.netlify.com](https://app.netlify.com)
2. اضغط على "Add new site" → "Import an existing project"
3. اختر "Deploy with GitHub"
4. اختر مستودع `OooooooooooooooooooO`

### 2. إعدادات البناء

Netlify سيكتشف الإعدادات تلقائياً من `netlify.toml`، لكن تأكد من:

- **Base directory**: `real-estate-erp`
- **Build command**: `npm run build`
- **Publish directory**: `real-estate-erp/.next`

### 3. متغيرات البيئة

اذهب إلى "Site settings" → "Environment variables" وأضف:

```
DATABASE_URL = postgresql://neondb_owner:password@host/database?sslmode=require
NEXTAUTH_URL = https://your-site-name.netlify.app
NEXTAUTH_SECRET = generate-random-secret-here
ENABLE_AUTH = false
AUTH_TRUST_HOST = true
BACKUP_PROVIDER = local
BACKUP_LOCAL_PATH = ./backups
```

**ملاحظة**: استبدل `DATABASE_URL` برابط قاعدة بيانات Neon الخاص بك.

### 4. النشر

اضغط على "Deploy site" وانتظر حتى ينتهي البناء.

## ما بعد النشر

### 1. إعداد قاعدة البيانات

من جهازك المحلي، مع نفس `DATABASE_URL`:

```bash
# تصدير متغير البيئة
export DATABASE_URL="your-neon-database-url"

# إنشاء الجداول
npx prisma db push

# إضافة البيانات الأولية (اختياري)
npm run db:seed
```

### 2. إعداد النطاق المخصص (اختياري)

1. اذهب إلى "Domain settings"
2. اضغط على "Add custom domain"
3. اتبع التعليمات لربط نطاقك

### 3. تفعيل HTTPS

Netlify يوفر HTTPS مجاناً وتلقائياً لجميع المواقع.

## استكشاف الأخطاء

### خطأ في البناء

إذا فشل البناء، تحقق من:

1. **سجلات البناء**: اقرأ رسائل الخطأ بعناية
2. **متغيرات البيئة**: تأكد من إضافة `DATABASE_URL`
3. **إصدار Node.js**: تأكد من استخدام Node.js 18+

### الموقع يعمل لكن لا توجد بيانات

1. تأكد من تشغيل `npx prisma db push`
2. تشغيل `npm run db:seed` لإضافة بيانات تجريبية
3. تحقق من اتصال قاعدة البيانات في Neon dashboard

### أخطاء 500

1. تحقق من "Function logs" في Netlify
2. تأكد من صحة `DATABASE_URL`
3. تحقق من أن قاعدة البيانات تعمل في Neon

## التحديثات المستقبلية

لنشر التحديثات:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Netlify سينشر التحديثات تلقائياً.

## نصائح مهمة

1. **الأمان**: لا تضع معلومات حساسة في `netlify.toml`
2. **النسخ الاحتياطي**: قم بعمل نسخ احتياطية دورية من قاعدة البيانات
3. **المراقبة**: استخدم Netlify Analytics لمراقبة الأداء
4. **السجلات**: راجع Function logs بانتظام

## الدعم

- [Netlify Documentation](https://docs.netlify.com)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)

للمساعدة الخاصة بالمشروع، افتح issue على GitHub.