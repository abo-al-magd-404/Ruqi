# شرح تفصيلي لمشروع RUQI Platform - Front-End

## نظرة عامة على المشروع

هذا مشروع **منصة تعليمية عربية** اسمها **رقي (Ruqi)**، مبنية بـ **Next.js 16** مع **React 19** و **TypeScript** و **Tailwind CSS v4**. المشروع يستخدم App Router (مجلد `app/`) ويوجه كل طلب API لـ backend خارجي عبر rewrite rules.

---

## 1. هيكل المشروع

```
front-end/
├── app/                    # صفحات التطبيق (App Router)
├── components/             # مكونات قابلة لإعادة الاستخدام
├── lib/                    # خدمات API وأدوات مساعدة
├── public/                 # ملفات ثابتة (صور)
├── Ruqi/                   # [مستبعد - مجلد منفصل]
├── package.json            # التبعيات والإعدادات
├── next.config.ts          # إعدادات Next.js
├── tsconfig.json           # إعدادات TypeScript
├── postcss.config.mjs      # إعدادات PostCSS
└── eslint.config.mjs       # إعدادات ESLint
```

---

## 2. ملفات الإعداد (Config Files)

### `package.json`
- **Next.js 16.3.2** مع **React 19.2.8**
- تبعيات رئيسية: `framer-motion` (أنيميشن)، `lucide-react` (أيقونات)
- أدوات التطوير: `tailwindcss v4`، `typescript`، `eslint 9`
- سكربتات: `dev`، `build`، `start`، `lint`

### `next.config.ts`
```ts
// يحول كل طلب /api/backend/* إلى Backend الحقيقي
const API_BASE_URL = process.env.REMOTE_API_URL || "https://app-6a95f847.deploy.meerasolution.com"
// Rewrite rule: /api/backend/:path* → API_BASE_URL/:path*
```
هذا يعني إن الـ frontend بيحول الطلبات proxy-style عشان يتجنب مشاكل CORS.

### `tsconfig.json`
- TypeScript strict mode مفعّل
- Path alias: `@/*` → `./*` (يعني `@/lib/api` = `./lib/api`)

### `postcss.config.mjs`
- يستخدم `@tailwindcss/postcss` (Tailwind v4 الجديد)

### `.env` / `.env.local`
- `API_BASE_URL_ENV` = رابط الـ backend على Meera Cloud

---

## 3. ملفات الصفحات (App Router Pages)

### `app/layout.tsx` - التخطيط الجذري
- يحمّل خطوط **Cairo** (عربي) و **Aref Ruqaa** (عربي أنيق)
- يضبط الاتجاه `dir="rtl"` و اللغة `lang="ar"` للعربية
- يحتوي على **Navbar** و **Footer** ثابتين
- Metadata: عنوان "منصة رقي" + وصف + أيقونة

### `app/globals.css` - الأنماط العامة
- نظام تصميم كامل عبر `@theme` في Tailwind v4:
  - ألوان: ذهبي `#c49a45` كلون رئيسي، خلفيات داكنة/فاتحة
  - أزرار: `btn-primary` (ذهبي)، `btn-secondary` (متوسط)
  - شارات: `badge-default`، `badge-success`، `badge-warning`، `badge-danger`
  - تقدم: `progress-bar` و `progress-fill`

### `app/page.tsx` - الصفحة الرئيسية
- **Section 1 - Hero**: عنوان "ابدأ رحلتك التعليمية" + نص ترحيبي + أزرار CTA (سجل مجاناً / تصفح المحتوى)
- **Section 2 - Teacher Spotlight**: كرت صورة معلم مع معلومات + إحصائيات (مدة، تقييم، طلاب)
- **Section 3 - الميزات**: 4 بطاقات (محتوى تفاعلي، تعلم بالسرعة، تتبع التقدم، مجتمع تعليمي)
- **Section 4 - كيف يعمل**: 3 خطوات (سجل → تعلم → تابع تقدمك)
- **Section 5 - الإحصائيات**: أرقام (10K+ طالب، 500+ فيديو، 100+ معلم، 95% رضا)
- كل الأقسام تستخدم `framer-motion` لأنيميشن الظهور عند التمرير

### `app/loading.tsx`
- شاشة تحميل بسيطة بعنصر `animate-spin`

### `app/not-found.tsx`
- صفحة 404 مع روابط للعودة للرئيسية أو الاتصال بالدعم

---

## 4. صفحات الحساب (Account Pages)

### `app/account/page.tsx` - صفحة الدخول/التسجيل
- تستخدم **GuestGuard** (تحمي الصفحة من المستخدمين المسجلين)
- تعرض مكون **PlateFormBeforeLogin** (بطاقات تسجيل + دخول)

### `app/account/login/page.tsx`
- **GuestGuard** → **AuthForm** بوضع `login`

### `app/account/register/page.tsx`
- **GuestGuard** → **AuthForm** بوضع `register`

### `app/account/forgot-password/page.tsx`
- نموذج إدخال البريد الإلكتروني
- بعد الإرسال → ينتقل لصفحة `reset-password` مع الإيميل كـ search param

### `app/account/reset-password/page.tsx`
- يقرأ الإيميل من URL params
- يعرض **ResetPasswordContent** (رمز OTP + كلمة مرور جديدة)

### `app/account/verify-email/page.tsx`
- صفحة تأكيد البريد الإلكتروني بـ OTP
- 6 خانات إدخال الرمز
- عداد تنازلي (120 ثانية) + زر إعادة الإرسال
- يدعم اللصق (paste) للرمز كاملاً من الرسالة
- بعد التأكيد ينتقل لصفحة الدخول

### `app/account/profile/page.tsx`
- صفحة البروفايل (تحتاج مصادقة)

---

## 5. صفحات أخرى

### `app/educational-content/page.tsx`
- صفحة "المراحل الدراسية"
- جلب بيانات من API (الـ URL فاضي حالياً)
- حالة فارغة: "لا يوجد محتوى متاح حالياً"

### `app/leaderboard/page.tsx`
- لوحة صدارة (Top Students)
- Top 3 على منصة (podium) + جدول بقية الطلاب
- جلب من API خارجي (الرابط placeholder حالياً)

### `app/support/page.tsx`
- صفحة دعم فني (placeholder - "قريباً")

---

## 6. المكونات (Components)

### `components/Navbar.tsx` - شريط التنقل
- **Fixed position** في أعلى الصفحة
- **Logo**: أيقونة + "رقي" بخط Aref Ruqaa
- **Links للعامة**: الرئيسية، المحتوى التعليمي، لوحة الصدارة، الدعم
- **Desktop**: أزرار تسجيل دخول + حسابي (Hidden/Visible حسب الحالة)
- **Mobile**: قائمة hamburger بـ slide animation (framer-motion)
- **Sticky shadow**: ظل يظهر عند التمرير

### `components/Footer.tsx` - تذييل الصفحة
- 3 أعمدة: روابط سريعة، تواصل معنا، تابعنا
- © 2024 منصة رقي

### `components/account/landingLogin&Register.tsx`
- صفحتي بطاقات (Register + Login) بالعربي
- روابط سريعة لصفحات الحساب

### `components/account/auth/GuestGuard.tsx`
- **حامية (Guard)**: إذا المستخدم مسجّل (فيه token في localStorage) → يُعاد توجيهه لـ `/account/profile`
- يمنع المستخدمين المسجلين من الدخول لصفحات التسجيل

### `components/account/AuthForm/AuthForm.tsx`
- نموذج موحد للتسجيل والدخول
- الحقول: اسم المستخدم + البريد + كلمة المرور (للتسجيل)، البريد + كلمة المرور (للدخول)
- يعرض أخطاء الـ API

### `components/account/AuthForm/PasswordFiled.tsx`
- حقل كلمة مرور مع:
  - إظهار/إخفاء كلمة المرور (زر عين)
  - **مؤشر قوة كلمة المرور**: ضعيف (أحمر) / متوسط (برتقالي) / قوي (أخضر)
  - تقييم بناءً على: طول + أحرف كبيرة + أرقام + رموز خاصة

### `components/account/AuthForm/ResetPasswordContent.tsx`
- نموذج 3 خطوات: إدخال البريد → رمز OTP → كلمة مرور جديدة
- عداد تنازلي لإعادة الإرسال

### `components/account/profile/Profile.tsx`
- صفحة البروفايل الكاملة للطالب
- يعرض: الاسم، البريد، تاريخ التسجيل، إحصائيات
- 3 أزرار تعديل:
  1. **EditProfileModal** - تعديل الاسم والبريد
  2. **ChangePasswordModal** - تغيير كلمة المرور
  3. **LogoutConfirmModal** - تأكيد تسجيل الخروج

---

## 7. خدمات API (lib/)

### `lib/api.ts` - عميل API كامل

الدوال الرئيسية:

| الدالة | Method | Endpoint |
|--------|--------|----------|
| `signup(data)` | POST | `/auth/signup` |
| `verifyOtp(data)` | POST | `/auth/verify-otp` |
| `resendOtp(email)` | POST | `/auth/resend-otp` |
| `login(data)` | POST | `/auth/login` |
| `getAccessToken()` | - | قراءة token من localStorage |
| `refreshToken()` | POST | `/auth/refresh` |
| `getProfile()` | GET | `/users/me` |
| `updateProfile(data)` | PATCH | `/users/me` |
| `logout()` | - | حذف token + توجيه للرئيسية |
| `forgetPassword(email)` | POST | `/auth/forget-password` |
| `resetPassword(data)` | POST | `/auth/reset-password` |

**آلية عمل الـ API:**
- كل طلب يتضمن `Authorization: Bearer ${token}` header
- عند الخطأ 401 (token منتهي) → يحاول `refreshToken()` مرة واحدة
- إذا الـ refresh فشل → يحذف التوكن ووجّه للرئيسية
- التوكن يُخزّن في `localStorage` بـ `access_token`

### `lib/password.ts` - تقييم قوة كلمة المرور
- `evaluateStrength(password)`: يرجع score من 0-4
  - يتحقق من: طول 8+، حروف كبيرة، حروف صغيرة، أرقام، رموز خاصة
- `getStrengthLabel(score)` و `getStrengthColor(score)`: يرجعا التسمية واللون

---

## 8. تدفق المستخدم الرئيسي

```
1. المستخدم يفتح الصفحة الرئيسية (/)
   ↓
2. يضغط "سجل مجاناً" أو "حسابي"
   ↓
3. GuestGuard يتحقق: هل مسجّل؟
   ├── نعم → يُعاد لـ /account/profile
   └── لا → يعرض نموذج التسجيل/الدخول
   ↓
4. التسجيل: اسم + إيميل + كلمة مرور
   ↓
5. تأكيد البريد (+ OTP من الإيميل)
   ↓
6. تسجيل الدخول
   ↓
7. API يرجع JWT token → يُخزّن في localStorage
   ↓
8. الصفحة الرئيسية تتغير: يظهر "حسابي" بدل "تسجيل دخول"
   ↓
9. صفحة البروفايل: تعديل معلومات / تغيير كلمة المرور / تسجيل خروج
```

---

## 9. التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16.3.2 | Framework رئيسي |
| React | 19.2.8 | UI Library |
| TypeScript | - | Type Safety |
| Tailwind CSS | v4 | Styling |
| Framer Motion | - | Animations |
| Lucide React | - | Icons |
| ESLint | 9 | Code Quality |

---

## 10. ملاحظات تقنية مهمة

1. **RTL Support**: المشروع بالكامل يدعم الاتجاه من اليمين لليسار (Arabic)
2. **Font Loading**: يستخدم `next/font` لتحميل Cairo و Aref Ruqaa من Google Fonts
3. **API Proxy**: كل الطلبات تمر عبر Next.js rewrite عشان يتجنب CORS
4. **Auth State**: يعتمد على localStorage (لا يوجد Context أو State Management)
5. **Mobile First**: الـ Navbar عنده تصميم responsive مع قائمة جوال
6. **Smart Redirects**: GuestGuard + automatic login redirect بعد التسجيل
7. **Token Refresh**: تجديد تلقائي للـ JWT عند انتهاء الصلاحية
