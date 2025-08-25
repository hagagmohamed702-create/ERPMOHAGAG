# حل مشاكل Neon PostgreSQL

## المشكلة: القراءة تعمل لكن الكتابة لا تعمل

إذا كنت تستطيع عرض البيانات لكن لا تستطيع إضافة بيانات جديدة، فهذه مشكلة شائعة مع Neon في الخطة المجانية.

### الحلول:

### 1. التحقق من رابط قاعدة البيانات

تأكد من استخدام **Pooled connection string** وليس Direct connection:

```
# صحيح - استخدم هذا:
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/database?sslmode=require

# خطأ - لا تستخدم هذا:
postgresql://user:pass@ep-xxx.region.aws.neon.tech/database?sslmode=require
```

لاحظ كلمة **-pooler** في الرابط الصحيح.

### 2. في Neon Dashboard

1. اذهب إلى **Connection Details**
2. اختر **Pooled connection**
3. انسخ الرابط واستخدمه في Netlify

### 3. إعدادات Prisma

في ملف `prisma/schema.prisma`، تأكد من:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. في Netlify

تأكد من إضافة المتغيرات التالية:

```
DATABASE_URL = "postgresql://...-pooler..."
DIRECT_URL = "postgresql://..." (اختياري)
```

### 5. حل مشكلة "Too many connections"

إذا ظهرت رسالة خطأ "too many connections":

1. استخدم Pooled connection
2. في الخطة المجانية، Neon يسمح بـ 100 اتصال نشط فقط
3. تأكد من إغلاق الاتصالات في الكود

### 6. التحقق من الصلاحيات

تأكد من أن المستخدم لديه صلاحيات الكتابة:

```sql
-- في Neon SQL Editor
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;
```

### 7. معالجة الأخطاء

في حالة فشل العملية، تحقق من:

1. **Netlify Function logs** - للأخطاء من جانب الخادم
2. **Browser Console** - للأخطاء من جانب العميل
3. **Network tab** - لرؤية رسائل الخطأ من API

### 8. اختبار الاتصال

استخدم endpoint `/api/health` للتحقق من حالة قاعدة البيانات:

```json
{
  "status": "ok",
  "database": "connected",
  "databaseUrl": "configured"
}
```

إذا كان `database: "disconnected"`، المشكلة في الاتصال.

### 9. البدائل

إذا استمرت المشكلة:

1. **Supabase** - بديل مجاني آخر لـ PostgreSQL
2. **PlanetScale** - لـ MySQL
3. **Railway** - يوفر PostgreSQL مع حدود أعلى

### 10. نصائح للأداء

- استخدم `prisma.$disconnect()` بعد كل عملية
- لا تنشئ عدة instances من PrismaClient
- استخدم connection pooling دائماً في Production