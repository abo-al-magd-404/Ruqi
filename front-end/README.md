# رُقِيّ — Front-End

> **"نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"**

الواجهة الأمامية لمنصة رُقِيّ التعليمية — تطبيق Next.js 16 بالكامل بالعربية وRTL.

---

## Tech Stack

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16.3.2 | App Router + Server Components |
| React | 19.2.8 | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | v4 | Styling via `@tailwindcss/postcss` |
| Framer Motion | 13.x | Animations |
| Lucide React | 1.x | Icons |

---

## Project Structure

```
front-end/
│
├── app/                                # صفحات التطبيق (App Router)
│   ├── layout.tsx                      # التخطيط الرئيسي — <html lang="ar" dir="rtl"> + Cairo Font
│   ├── globals.css                     # نظام التصميم الكامل (Design Tokens + Components)
│   ├── page.tsx                        # الصفحة الرئيسية (/)
│   ├── loading.tsx                     # شاشة تحميل branded
│   ├── not-found.tsx                   # صفحة 404
│   │
│   ├── educational-content/            # المحتوى التعليمي
│   │   ├── page.tsx                    # المراحل التعليمية (/educational-content)
│   │   ├── stage/[stageId]/page.tsx    # أ月末 مرحلة (/educational-content/stage/:id)
│   │   ├── month/[monthId]/page.tsx    # محتوى الشهر (# الدروس والاختبارات)
│   │   ├── content/[contentId]/
│   │   │   ├── page.tsx                # صفحة الدرس (فيديو + شرح +側 sidebar)
│   │   │   ├── assignment/page.tsx     # الواجب التطبيقي (MCQ)
│   │   │   ├── assignment/result/      # نتيجة الواجب
│   │   │   └── assignment/review/      # مراجعة إجابات الواجب
│   │   └── exam/[contentId]/
│   │       ├── page.tsx                # ملخص الاختبار
│   │       ├── take/page.tsx           # شاشة الاختبار (مؤقت 30 دقيقة)
│   │       ├── result/                 # نتيجة الاختبار
│   │       └── review/                 # مراجعة إجابات الاختبار
│   │
│   ├── account/                        # الحساب والمصادقة
│   │   ├── page.tsx                    # صفحة اختيار (دخول / إنشاء حساب)
│   │   ├── login/page.tsx              # تسجيل الدخول
│   │   ├── register/page.tsx           # إنشاء حساب طالب
│   │   ├── verify-email/page.tsx       # التحقق من البريد (OTP 6 أرقام)
│   │   ├── forgot-password/page.tsx    # نسيت كلمة المرور
│   │   ├── reset-password/page.tsx     # إعادة تعيين كلمة المرور
│   │   └── profile/
│   │       ├── page.tsx                # الملف الشخصي + التقدم
│   │       └── edit/                   # تعديل الملف الشخصي
│   │
│   ├── leaderboard/page.tsx            # لوحة الصدارة (/leaderboard)
│   └── support/page.tsx                # الدعم الفني (/support)
│
├── components/                         # مكونات الواجهة
│   ├── Navbar.tsx                      # شريط التنقل (Glass Header + Mobile Full-Screen Drawer)
│   ├── Footer.tsx                      # التذييل الداكن (Logo + روابط + © 2026)
│   ├── LayoutWrapper.tsx               # يخفي Navbar/Footer في صفحات الاختبار /take
│   ├── MonthDrawer.tsx                 # درج محتوى الشهر المنسدل + Floating Action Button
│   │
│   ├── account/                        # مكونات الحساب
│   │   ├── auth-landing.tsx            # "اختر كيف تريد المتابعة" (دخول / حساب جديد)
│   │   ├── auth-form/
│   │   │   ├── auth-form.tsx           # نموذج تسجيل الدخول / إنشاء الحساب
│   │   │   ├── password-field.tsx      # حقل كلمة المرور مع مؤشر القوة
│   │   │   └── reset-password-content.tsx  # محتوى إعادة التعيين
│   │   ├── auth/
│   │   │   └── GuestGuard.tsx          # يمنع المستخدم المصادق من صفحات الدخول
│   │   └── profile/
│   │       ├── profile.tsx             # الملف الشخصي + معلومات + تقدم
│   │       └── edit/
│   │           ├── edit-profile-modal.tsx    # تعديل الملف الشخصي
│   │           ├── change-password-modal.tsx # تغيير كلمة المرور
│   │           └── logout-confirm-modal.tsx  # تأكيد تسجيل الخروج
│   │
│   └── eductational-content/
│       └── teacher/
│           ├── teacher-dashboard.tsx       # لوحة تحكم المعلم (Stages → Months → Content)
│           └── modals/
│               ├── stage-modal.tsx         # إضافة/تعديل مرحلة
│               ├── month-modal.tsx         # إضافة/تعديل شهر
│               ├── content-modal.tsx       # إضافة/تعديل درس/اختبار + MCQ Builder
│               └── confirm-modal.tsx       # تأكيد الحذف
│
├── lib/                                # مكتبات مشتركة
│   ├── api.ts                          # عميل API المركزي (764 سطر)
│   ├── progress.ts                     # نظام التقدم (localStorage)
│   └── password.ts                     # قواعد قوة كلمة المرور
│
├── public/
│   └── images/
│       ├── teacher-image.png           # صورة المعلم
│       └── ...                         # شعار المنصة
│
├── next.config.ts                      # إعادة توجيه /api/backend → الخادم البعيد
├── tailwind.config.ts                  # إعدادات Tailwind
├── tsconfig.json                       # TypeScript (strict + @/* alias)
├── eslint.config.mjs                   # ESLint (next core-web-vitals + typescript)
├── postcss.config.mjs                  # PostCSS (tailwindcss plugin)
└── package.json
```

---

## شرح كل صفحة بالتفصيل

### الصفحة الرئيسية `/`

```
┌─────────────────────────────────────────┐
│  Hero Section                           │
│  ┌─────────────────────────────────┐    │
│  │  شعار رُقِيّ + الشعار الرئيسي    │    │
│  │  "نرتقي باللغة..."              │    │
│  │  [المحتوى التعليمي] [إنشاء حساب] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  تعريف المعلم (صورة + بايو + خبرة)       │
│  ─────────────────────────────────────   │
│  شبكة 6 مزايا (محتوى منظّم، اختبارات)   │
│  ─────────────────────────────────────   │
│  كيف تعمل رُقِيّ (6 خطوات)              │
│  ─────────────────────────────────────   │
│  إحصائيات المنصة (متحركة من الـ API)     │
└─────────────────────────────────────────┘
```

**ما يحدث هنا:** الصفحة تجلب عدد المراحل، الأشهر، والمحتوى من الباكند لعرض الإحصائيات. صورة المعلم وسنوات الخبرية (منذ 2018) تُحسب تلقائيًا.

---

### المحتوى التعليمي

#### المراحل `/educational-content`
شبكة بطاقات — كل بطاقة: صورة خلفية + شريط ذهبي بالعنوان. تنطيق على صفحة المرحلة.

#### الشهر `/educational-content/stage/:id`
بطاقات الأشهر — السعر ("X ج.م" أو "مجاني") + وصف + عدد الدروس والاختبارات. تنطيق على صفحة المحتوى.

#### محتوى الشهر `/educational-content/month/:id`
```
┌──────────────────────────────────────────┐
│  Breadcrumb: الرئيسية > المرحلة > الشهر  │
│  ┌────────────────────────────────────┐  │
│  │ بطاقة الشهر: السعر + شريط التقدم  │  │
│  │ "متبقي 5 دروس / 2 اختبار"         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  📋 الدروس والاختبارات (تسلسلي):        │
│  ├─ الدرس الأول  [فيديو+شرح+واجب] ✓    │
│  ├─ الدرس الثاني [فيديو+شرح+واجب] ○    │
│  ├─ الاختبار الأول [MCQ]       ○        │
│  ├─ الدرس الثالث [فيديو+شرح+واجب] 🔒   │
│  └─ ...                                  │
└──────────────────────────────────────────┘
```

**ما يحدث هنا:** المحتوى يُجلب كـ `getMonthContent(monthId)` ويرتبط حسب `order`. الحالة (✓ مكتمل / ○ قيد التقدم / 🔒 مقفل) تُحسب من `lib/progress.ts` (localStorage).

---

#### الدرس `/educational-content/content/:id`
```
┌────────────────────────────┬──────────────┐
│                            │  درج جانبی   │
│  🎬 مشغل الفيديو (YouTube) │  الدرس 1 من 5│
│                            │  ├ الدرس 1 ✓ │
│  📝 الشرح المكتوب          │  ├ الدرس 2   │
│                            │  ├ الاختبار 1│
│  [تمت مشاهدة الدرس ✓]     │  ├ الدرس 3   │
│  [الانتقال إلى الواجب]     │  └ ...       │
│                            │              │
└────────────────────────────┴──────────────┘
```

**ما يحدث هنا:** عند فتح صفحة الدرس، يُعلّم `markLessonCompleted()` تلقائيًا في localStorage. الزر "تمت مشاهدة الدرس" يُنشئ إكمال الدرس.

---

#### الاختبار
**ملخص** → **سؤال بسؤال** → **نتيجة** → **مراجعة**

- **المدة:** 30 دقيقة، مؤقت مخزّن في localStorage (يتحمل إعادة التحميل)
- **صيغة:** سؤال واحد في كل مرة، شريط تقدم ("السؤال 1 من N")
- **حماية:** تتبع تبديل التبويب (Tab Switch) — 5 مرات → تسليم تلقائي
- **النتيجة:** تُحسب في المتصفح (localStorage فقط، لا يوجد حفظ في الخادم)
- **إعادة الاختبار:** مسموح — يحتفظ بأعلى نتيجة
- **إخفاء:** `LayoutWrapper` يخفي Navbar و Footer في صفحة `/take`

---

### الحساب `/account`

```
┌──────────────────────────────────────┐
│  "اختر كيف تريد المتابعة"            │
│                                      │
│  ┌──────────┐    ┌──────────┐       │
│  │ تسجيل    │    │ إنشاء    │       │
│  │ الدخول   │    │ حساب     │       │
│  └──────────┘    └──────────┘       │
└──────────────────────────────────────┘
```

#### إنشاء حساب
الاسم → البريد → كلمة المرور (مؤشر قوة) → تأكيد كلمة المرور → الهاتف (صيغة مصرية `01[0125]xxxxxxxx`) → المرحلة

**流程:** الحساب يُنشأ بحالة PENDING → يُرسل OTP على البريد → صفحة التحقق (6 أرقام) → الحساب يتحول إلى ACTIVE

#### تسجيل الدخول
البريد + كلمة المرور → JWT tokens مخزّنة في `localStorage` (`ruqi_access_token`, `ruqi_refresh_token`)

**`GuestGuard`** يمنع المستخدم المصادق من الوصول لصفحات الدخول (يُحوّل لـ `/account/profile`).

#### الملف الشخصي
معلومات الطالب + Student ID + التقدم في الشهر + أزرار تعديل الملف / تغيير كلمة المرور / تسجيل الخروج (كلها modals).

---

### لوحة الصدارة `/leaderboard`

```
┌──────────────────────────────────────────┐
│  🏆 المتفوقون في رُقِيّ                 │
│                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ 🥈 2nd │ │ 🥇 1st │ │ 🥉 3rd │       │
│  │  اسم   │ │  اسم   │ │  اسم   │       │
│  │  نقاط  │ │  نقاط  │ │  نقاط  │       │
│  └────────┘ └────────┘ └────────┘       │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ الرتبة │ الاسم  │ النقاط       │    │
│  │  4     │ ...    │ ...           │    │
│  │  5     │ ...    │ ...           │    │
│  │  ...   │ ...    │ ...           │    │
│  └──────────────────────────────────┘    │
│  (صف شخصي مُميّز في الأسفل)             │
└──────────────────────────────────────────┘
```

**ملاحظة:** هذا Endpoint غير موجود حاليًا في الباكند — الصفحة تعرض حالتها الفارغة.

---

### لوحة تحكم المعلم

```
┌──────────────────────────────────────────────┐
│  📚 إدارة المراحل التعليمية                  │
│  [+ إضافة مرحلة]                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ مرحلة 1 │ │ مرحلة 2 │ │ مرحلة 3 │       │
│  │ تعديل 📝│ │ تعديل 📝│ │ تعديل 📝│       │
│  │ حذف  🗑 │ │ حذف  🗑 │ │ حذف  🗑 │       │
│  └────↓────┘ └─────────┘ └─────────┘       │
│        ↓                                     │
│  📅 أشهر هذه المرحلة                         │
│  [+ إضافة شهر]                               │
│  ┌─────────┐ ┌─────────┐                   │
│  │ شهر 1   │ │ شهر 2   │                   │
│  └────↓────┘ └─────────┘                   │
│        ↓                                     │
│  📄 محتوى الشهر (# الدروس والاختبارات)      │
│  [+ إضافة درس] [+ إضافة اختبار]            │
│  ├─ الدرس الأول  ↑↓ تعديل حذف              │
│  ├─ الدرس الثاني ↑↓ تعديل حذف              │
│  └─ الاختبار الأول ↑↓ تعديل حذف            │
└──────────────────────────────────────────────┘
```

**ما يحدث هنا:** `teacher-dashboard.tsx` يعرض 3 أقسام (Stages → Months → Content). كل إضافة/تعديل/حذف يحدث عبر modals مع `content-modal.tsx` يحتوي على MCQ Question Builder كامل مع `validateQuestion()`.

---

## المكتبات (lib/)

### `lib/api.ts` — عميل API المركزي (764 سطر)

**النقطة المركزية** — كل طلب للباكند يمر من هنا:

```typescript
// المصادقة
signup(data)                         // POST /auth/signup
verifyAccount(email, otp)            // POST /auth/verify-account
resendOtp(email)                     // POST /auth/resend-otp
loginUser(email, password)           // POST /auth/login
forgetPassword(email)                // POST /auth/forget-password
resetPassword(email, otp, password)  // POST /auth/reset-password
refreshAccessToken(refreshToken)     // POST /auth/get-new-access-token
logoutUser()                         // POST /auth/logout

// المستخدمين
getProfile()                         // GET /users/me
updateStudentProfile(data)           // PATCH /users/student/profile

// المحتوى التعليمي
getEducationalStages()               // GET /educational-content/stages
getEducationalStageById(id)          // GET /educational-content/stages/:id
createStage(data)                    // POST /educational-content/stages
updateStage(id, data)                // PATCH /educational-content/stages/:id
deleteStage(id)                      // DELETE /educational-content/stages/:id
reorderStages(items)                 // PATCH /educational-content/stages/reorder

getMonthsByStage(stageId)            // GET /educational-content/months/stage/:stageId
getEducationalMonthById(id)          // GET /educational-content/months/:id
createMonth(data)                    // POST /educational-content/months
updateMonth(id, data)                // PATCH /educational-content/months/:id
deleteMonth(id)                      // DELETE /educational-content/months/:id
reorderMonths(items)                 // PATCH /educational-content/months/reorder

getMonthContent(monthId)             // GET /educational-content/content/month/:monthId
getContentById(id)                   // GET /educational-content/content/:id
createLesson(data)                   // POST /educational-content/lessons
createExam(data)                     // POST /educational-content/exams
updateContent(id, data)              // PATCH /educational-content/content/:id
deleteContent(id)                    // DELETE /educational-content/content/:id
reorderContent(items)                // PATCH /educational-content/content/reorder
```

**`authedFetch()`** — Interceptor يُضيف Bearer token تلقائيًا. عند 401 يُجديد Access Token مرة واحدة ثم يُعيد الطلب. يُمسح التوقيعات ويُحوّل للصفحة الرئيسية عند الفشل.

**localStorage Keys:**
- `ruqi_access_token` — JWT Access Token
- `ruqi_refresh_token` — JWT Refresh Token
- `ruqi_pending_email` — البريد أثناء التحقق من OTP

---

### `lib/progress.ts` — نظام التقدم (localStorage)

التقدم مخزّن **كليًا في المتصفح** — لا يوجد حفظ في الخادم:

```typescript
// المفتاح: ruqi_student_progress
{
  "contentId1": { type: "LESSON", completedAt: "2026-..." },
  "contentId2": { type: "EXAM",   completedAt: "2026-...", scorePercentage: 85 }
}

// الدوال
markLessonCompleted(contentId)           // يُعلّم الدرس كمكتمل
markExamCompleted(contentId, score)      // يُعلّم الاختبار مع النتيجة
isContentCompleted(contentId)            // يتحقق هل المحتوى مكتمل
getContentScore(contentId)               // يُعيد نتيجة الاختبار (%)
getMonthSummary(monthId)                 // يحسب: مكتمل/إجمالي/متبقي/نسبة
```

---

### `lib/password.ts` — قواعد كلمة المرور

- الحد الأدنى: 8 أحرف
- مؤشر القوة: ضعيف / متوسط / قوي (يُستخدم في `password-field.tsx`)

---

## نظام التصميم

### الألوان (`globals.css`)

```
المظهر العام:
  Background:     #f8f7f4  (أبيض دافئ)
  Surface:        #ffffff  (أبيض النماذج)
  Surface-2nd:    #efece6  (خلفية الثانوي)

الذهبي (Primary):
  Primary:        #c49a45  (ذهبي رئيسي)
  Hover:          #a88133  (ذهبي داكن)
  Light:          #faf5ea  (خلفية ذهبية فاتحة)
  Border:         #e8d8b5  (حدود ذهبية)

النصوص:
  Text:           #2d2926  (أساسي)
  Muted:          #736c65  (ثانوي)

الحالة:
  Success:        #2e7d32  (أخضر)
  Warning:        #d97706  (برتقالي)
  Danger:         #ba1a1a  (أحمر)
  Locked:         #a39c90  (رمادي)

التذييل:
  Dark:           #1c1712  (أساسي)
  Dark-2nd:       #e8e2d8  (نص)
```

### الخطوط
- **الرئيسي:** Cairo (400/600/700) — النصوص، العناوين، النماذج، الجداول
- **الزخرفي:** Aref Ruqaa (700) — شعار المنصة فقط

### الكلاسات الجاهزة (globals.css)
```css
.ruqi-card           /* بطاقة بحدود وظل */
.btn-primary          /* زر ذهبي ممتلئ */
.btn-secondary        /* زر ذهبي فارغ */
.btn-outline          /* زر حدود */
.btn-danger           /* زر أحمر */
.badge                /* شارة ذهبية */
.badge-success        /* شارة خضراء */
.progress-track       /* مسار شريط التقدم */
.progress-fill        /* ملء شريط التقدم */
```

---

## الإعدادات التقنية

### `next.config.ts`
```typescript
// إعادة توجيه API → الخادم البعيد
rewrites: [
  { source: '/api/backend/:path*', destination: 'https://app-6a995274.deploy.meerasolution.com/:path*' }
]
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] },
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

### `layout.tsx`
```html
<html lang="ar" dir="rtl">
  <body className="${cairo.className} ${arefRuqaa.className}">
    <LayoutWrapper>{children}</LayoutWrapper>
  </body>
</html>
```

---

## التشغيل المحلي

```bash
# التثبيت
npm install

# التشغيل
npm run dev          # → http://localhost:3000

# البناء
npm run build

# فحص الأكواد
npm run lint
```

---

## ملاحظات

- **التقدم** مخزّن في localStorage فقط — لا يوجد حفظ في الخادم
- **صفحة الصدارة** تتطلب endpoint غير موجود في الباكند (404)
- **صفحة الدعم** مبدئية (stub)
- **الباكند** يعمل على `localhost:8000` أو عبر الـ rewrite في `next.config.ts`
- **`GuestGuard`** يمنع المستخدم المصادق من صفحات الدخول
- **`LayoutWrapper`** يخفي Navbar/Footer في صفحة الاختبار `/take`
- **`MonthDrawer`** مكون للموبايل فقط (درج محتوى الشهر)
