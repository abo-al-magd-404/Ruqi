# RUQI Platform API Reference

مرجع التكامل الرسمي للواجهة الأمامية. جميع الأمثلة والحقول أدناه مطابقة للمسارات الموجودة في الخادم.

## Quick Start

| Item           | Value                                   |
| -------------- | --------------------------------------- |
| Base URL       | `https://app-6a95f847.deploy.meerasolution.com`                 |
| Content-Type   | `application/json`                      |
| Authentication | `Authorization: Bearer <accessToken>`   |
| Language       | رسائل الاستجابة والأخطاء باللغة العربية |

### Authenticated Requests

أرسل access token في كل endpoint محمي:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

عند انتهاء access token، استخدم refresh token في `POST /auth/get-new-access-token` ثم استبدل التوكنين.

## Roles

| Role      | الاستخدام                                       |
| --------- | ----------------------------------------------- |
| `STUDENT` | الحساب الافتراضي عند التسجيل، وتحديث ملف الطالب |
| `TEACHER` | حساب مستخدم عادي حاليًا                         |
| `ADMIN`   | إدارة المراحل والشهور والدروس والاختبارات       |

## Response Rules

- `POST` للإنشاء يعيد `201 Created`.
- العمليات الناجحة الأخرى تعيد `200 OK`.
- الحقول غير المعرفة في DTO مرفوضة وتعيد `400 Bad Request`.
- جميع المعرفات يجب أن تكون MongoDB ObjectId من 24 حرفًا سداسيًا عشريًا.
- لا ترسل `role` في التسجيل؛ الحساب الجديد دائمًا `STUDENT`.
- اسم كل كيان تعليمي هو `title`، وليس `name`.

## 1. Authentication

### POST `/auth/signup`

إنشاء حساب طالب بحالة `PENDING` وإرسال OTP إلى البريد.

**Access:** Public  
**Status:** `201 Created`

```json
{
  "name": "محمد محمود",
  "email": "mohamed@example.com",
  "password": "Password123",
  "phoneNumber": "01012345678",
  "address": "دمنهور",
  "stage": "66ce1234a5b6c7d8e9f01111"
}
```

```json
{
  "message": "تم إنشاء الحساب بنجاح، يرجى التوجه للبريد الإلكتروني لتفعيل الحساب بواسطة رمز التحقق",
  "email": "mohamed@example.com"
}
```

`stage` مطلوب ويجب أن يشير إلى مرحلة موجودة.

### POST `/auth/resend-otp`

إعادة إرسال OTP لحساب غير مفعل. يوجد cooldown افتراضي مدته 60 ثانية.

**Access:** Public  
**Status:** `200 OK`

```json
{ "email": "mohamed@example.com" }
```

### POST `/auth/verify-account`

تفعيل الحساب باستخدام OTP من 6 أرقام. مدة صلاحية OTP الافتراضية 10 دقائق.

**Access:** Public  
**Status:** `200 OK`

```json
{
  "email": "mohamed@example.com",
  "otp": "123456"
}
```

### POST `/auth/login`

تسجيل الدخول وإصدار access وrefresh tokens.

**Access:** Public  
**Status:** `200 OK`

```json
{
  "email": "mohamed@example.com",
  "password": "Password123"
}
```

```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "محمد محمود",
    "email": "mohamed@example.com",
    "role": "STUDENT",
    "studentId": "STU-2026-123456"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST `/auth/forget-password`

إرسال OTP لإعادة تعيين كلمة المرور.

**Access:** Public  
**Status:** `200 OK`

```json
{ "email": "mohamed@example.com" }
```

### POST `/auth/reset-password`

تعيين كلمة مرور جديدة وإلغاء refresh token الحالي.

**Access:** Public  
**Status:** `200 OK`

```json
{
  "email": "mohamed@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### POST `/auth/get-new-access-token`

إصدار زوج جديد من access وrefresh tokens. refresh token السابق يصبح غير صالح بعد نجاح العملية.

**Access:** Public  
**Status:** `200 OK`

```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### POST `/auth/logout`

إلغاء جلسة المستخدم الحالية.

**Access:** Authenticated  
**Status:** `200 OK`

```json
{ "message": "تم تسجيل الخروج بنجاح" }
```

## 2. User Profile

### GET `/users/me`

جلب الملف الشخصي للمستخدم الحالي. الحقول الحساسة مثل password وOTP وrefresh token لا تظهر في الاستجابة.

**Access:** Authenticated  
**Status:** `200 OK`

```json
{
  "message": "تم جلب بيانات الحساب بنجاح",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "محمد محمود",
    "email": "mohamed@example.com",
    "phoneNumber": "01012345678",
    "address": "دمنهور",
    "role": "STUDENT",
    "status": "ACTIVE",
    "stage": "66ce1234a5b6c7d8e9f01111",
    "subscribedMonths": []
  }
}
```

### PATCH `/users/student/profile`

تحديث بيانات الطالب. كل الحقول اختيارية، ولا يمكن تغيير email أو role أو status.

**Access:** `STUDENT` فقط  
**Status:** `200 OK`

```json
{
  "name": "محمد محمود المعدل",
  "password": "NewSecretPassword123",
  "phoneNumber": "01099998888",
  "address": "القاهرة",
  "avatar": "https://example.com/avatar.jpg",
  "stage": "66ce1234a5b6c7d8e9f01111",
  "subscribedMonths": ["66ce1234a5b6c7d8e9f02222"]
}
```

## 3. Educational Content

جميع endpoints الإدارة التالية تتطلب `ADMIN`.

### Educational Stages

#### POST `/educational-content/stages`

```json
{
  "title": "الصف الثالث الثانوي",
  "image": "https://example.com/stage.jpg",
  "order": 0
}
```

#### GET `/educational-content/stages`

يعيد قائمة المراحل مرتبة تصاعديًا حسب `order`.

#### GET `/educational-content/stages/:id`

يعيد مرحلة واحدة. المعرف غير الصالح يعيد `400`.

#### PATCH `/educational-content/stages/:id`

```json
{
  "title": "الصف الثالث الثانوي - علمي",
  "order": 1
}
```

#### DELETE `/educational-content/stages/:id`

يحذف المرحلة وكل الشهور والدروس والاختبارات التابعة لها.

```json
{ "message": "تم حذف المرحلة الدراسية بنجاح" }
```

### Educational Months

#### POST `/educational-content/months`

```json
{
  "title": "سبتمبر - الفيزياء الحديثة",
  "description": "محتوى شهر سبتمبر",
  "image": "https://example.com/month.jpg",
  "price": 250,
  "stage": "66ce1234a5b6c7d8e9f01111",
  "order": 0
}
```

#### GET `/educational-content/months/stage/:stageId`

يعيد شهور المرحلة مرتبة حسب `order`.

#### GET `/educational-content/months/:id`

يعيد شهرًا واحدًا.

#### PATCH `/educational-content/months/:id`

```json
{
  "title": "سبتمبر - الفيزياء الحديثة",
  "description": "الوصف المحدث",
  "price": 300,
  "stage": "66ce1234a5b6c7d8e9f01111",
  "order": 1
}
```

#### DELETE `/educational-content/months/:id`

يحذف الشهر وكل الدروس والاختبارات التابعة له.

```json
{ "message": "تم حذف الشهر بنجاح" }
```

### Lessons and Exams

#### POST `/educational-content/lessons`

```json
{
  "title": "الدرس الأول: التيار الكهربي",
  "description": "شرح الدرس الأول",
  "month": "66ce1234a5b6c7d8e9f02222",
  "type": "LESSON",
  "videoUrl": "https://vimeo.com/123456",
  "writtenExplanation": "شرح مكتوب للدرس",
  "homework": [
    {
      "questionText": "ما وحدة قياس التيار؟",
      "options": ["الأمبير", "الفولت"],
      "correctAnswers": [0]
    }
  ],
  "order": 0
}
```

#### POST `/educational-content/exams`

```json
{
  "title": "امتحان الفصل الأول",
  "description": "اختبار شامل",
  "month": "66ce1234a5b6c7d8e9f02222",
  "type": "EXAM",
  "examQuestions": [
    {
      "questionText": "ما وحدة قياس التيار؟",
      "options": ["الأمبير", "الفولت"],
      "correctAnswers": [0]
    }
  ],
  "passPercentage": 50,
  "order": 1
}
```

`passPercentage` اختياري، وقيمته الافتراضية `50`، ويجب أن تكون بين `0` و`100`. لا يوجد حقل `durationMinutes` في العقد الحالي.

#### GET `/educational-content/content/month/:monthId`

يعيد كل الدروس والاختبارات التابعة للشهر، مرتبة حسب `order`. هذا endpoint عام.

#### GET `/educational-content/content/:id`

يعيد درسًا أو اختبارًا واحدًا. هذا endpoint عام.

#### PATCH `/educational-content/content/:id`

كل الحقول اختيارية:

```json
{
  "title": "العنوان المحدث",
  "description": "الوصف المحدث",
  "videoUrl": "https://vimeo.com/654321",
  "writtenExplanation": "شرح محدث",
  "homework": [],
  "examQuestions": [],
  "passPercentage": 60,
  "order": 2
}
```

#### PATCH `/educational-content/content/reorder`

```json
{
  "items": [
    { "id": "66ce1234a5b6c7d8e9f01111", "order": 0 },
    { "id": "66ce1234a5b6c7d8e9f02222", "order": 1 }
  ]
}
```

#### PATCH `/educational-content/stages/reorder`

نفس صيغة `items` السابقة، مع استخدام معرفات المراحل.

#### PATCH `/educational-content/months/reorder`

نفس صيغة `items` السابقة، مع استخدام معرفات الشهور.

#### DELETE `/educational-content/content/:id`

```json
{ "message": "تم حذف المحتوى بنجاح" }
```

## 4. Validation and Errors

### Common Status Codes

| Status | المعنى                                                           |
| ------ | ---------------------------------------------------------------- |
| `200`  | نجاح القراءة أو التعديل أو العملية                               |
| `201`  | إنشاء سجل بنجاح                                                  |
| `400`  | بيانات غير صالحة، OTP خاطئ/منتهي، cooldown، أو ObjectId غير صالح |
| `401`  | access token مفقود أو غير صالح أو منتهي                          |
| `403`  | المستخدم لا يملك الدور المطلوب                                   |
| `404`  | السجل المطلوب غير موجود                                          |
| `409`  | البريد الإلكتروني مستخدم من قبل                                  |
| `500`  | خطأ داخلي، مثل تعذر إرسال البريد                                 |

### Error Shape

استجابة Nest المعتادة تكون على الصورة التالية:

```json
{
  "statusCode": 400,
  "message": ["رسالة الخطأ"],
  "error": "Bad Request"
}
```

قد تكون `message` نصًا واحدًا بدل مصفوفة حسب نوع الاستثناء.

## 5. Frontend Integration Flow

1. التسجيل عبر `/auth/signup` باستخدام `stage`.
2. إدخال OTP عبر `/auth/verify-account`.
3. تسجيل الدخول وحفظ access وrefresh tokens بشكل آمن.
4. إرسال access token في `Authorization` عند استدعاء endpoints المحمية.
5. عند `401`، استدعاء `/auth/get-new-access-token` مرة واحدة ثم إعادة الطلب الأصلي.
6. عند فشل refresh token، مسح الجلسة وإعادة المستخدم إلى شاشة تسجيل الدخول.
7. عند تسجيل الخروج، استدعاء `/auth/logout` ثم حذف التوكنات من جهة الفرونت.
