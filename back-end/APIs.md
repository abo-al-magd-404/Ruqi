# RUQI PLATFORM — API Documentation

> **API Version:** `v1`
> **Environment:** Development
> **Base URL:** `https://app-6a95f847.deploy.meerasolution.com`
> **Documentation Language:** English
> **Response & Error Messages:** Arabic

---

## Table of Contents

1. [Registration & Authentication](#1-registration--authentication)

   - [API 01 — Signup](#api-01--signup)
   - [API 02 — Resend Email OTP](#api-02--resend-email-otp)
   - [API 03 — Verify Account](#api-03--verify-account)
   - [API 04 — Login](#api-04--login)
   - [API 05 — Forget Password](#api-05--forget-password)
   - [API 06 — Reset Password](#api-06--reset-password)
   - [API 07 — Get New Access Token](#api-07--get-new-access-token)
   - [API 08 — Logout](#api-08--logout)

2. [Users & Profile](#2-users--profile)

   - [API 09 — Get Current User Profile](#api-09--get-current-user-profile)
   - [API 10 — Update Student Profile](#api-10--update-student-profile)

3. [Authentication Flow](#authentication-flow)
4. [HTTP Status Codes](#http-status-codes)
5. [General Notes](#general-notes)

---

# 1. Registration & Authentication

This section contains all endpoints related to:

- Student registration
- Email verification
- Authentication
- Password recovery
- Access token management
- Session termination

---

## API 01 — Signup

### Create a New Student Account

Creates a new student account with an initial status of `PENDING`.

After successful registration, a **6-digit OTP** is generated and sent to the student's email address. The account must be verified before the student can log in.

### Endpoint

```http
POST /auth/signup
```

### Access

`Public`

> No Bearer Token is required.

### Request Body

```json
{
  "name": "محمد محمود",
  "email": "mohamed@example.com",
  "password": "Password123",
  "phoneNumber": "01012345678",
  "address": "دمنهور"
}
```

### Request Fields

| Field         | Type     | Required | Description                             |
| ------------- | -------- | :------: | --------------------------------------- |
| `name`        | `string` |   Yes    | Student's full name                     |
| `email`       | `string` |   Yes    | Valid and unique email address          |
| `password`    | `string` |   Yes    | Password with a minimum of 8 characters |
| `phoneNumber` | `string` |   Yes    | Student's phone number                  |
| `address`     | `string` |   Yes    | Student's address                       |

### Success Response

**201 Created**

```json
{
  "message": "تم إنشاء الحساب بنجاح، يرجى التوجه للبريد الإلكتروني لتفعيل الحساب بواسطة رمز التحقق",
  "email": "mohamed@example.com"
}
```

### Error Responses

#### 400 Bad Request — Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "البريد الإلكتروني غير صالح",
    "كلمة المرور يجب ألا تقل عن 8 أحرف"
  ],
  "error": "Bad Request"
}
```

#### 409 Conflict — Email Already Registered

```json
{
  "statusCode": 409,
  "message": "البريد الإلكتروني مُسجل بالفعل",
  "error": "Conflict"
}
```

---

## API 02 — Resend Email OTP

### Resend Verification Code

Resends a new OTP to the user's email address if the previous code was not received or has expired.

A **60-second cooldown** is applied between OTP requests.

### Endpoint

```http
POST /auth/resend-otp
```

### Access

`Public`

### Request Body

```json
{
  "email": "mohamed@example.com"
}
```

### Request Fields

| Field   | Type     | Required | Description          |
| ------- | -------- | :------: | -------------------- |
| `email` | `string` |   Yes    | User's email address |

### Success Response

**200 OK**

```json
{
  "message": "تم إعادة إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني"
}
```

### Error Responses

#### 400 Bad Request — Cooldown / Account State

```json
{
  "statusCode": 400,
  "message": "يرجى الانتظار 45 ثانية قبل إعادة طلب رمز التحقق",
  "error": "Bad Request"
}
```

#### 404 Not Found — Account Not Found

```json
{
  "statusCode": 404,
  "message": "الحساب غير موجود",
  "error": "Not Found"
}
```

---

## API 03 — Verify Account

### Activate Account Using Verification Code

Activates the student's account using the **6-digit OTP** sent to the registered email address.

After successful verification, the account status changes from `PENDING` to `ACTIVE`.

### Endpoint

```http
POST /auth/verify-account
```

### Access

`Public`

### Request Body

```json
{
  "email": "mohamed@example.com",
  "otp": "123456"
}
```

### Request Fields

| Field   | Type     | Required | Description               |
| ------- | -------- | :------: | ------------------------- |
| `email` | `string` |   Yes    | User's email address      |
| `otp`   | `string` |   Yes    | 6-digit verification code |

### Success Response

**200 OK**

```json
{
  "message": "تم تفعيل الحساب بنجاح، يمكنك الآن تسجيل الدخول"
}
```

### Error Responses

#### 400 Bad Request — Invalid / Expired OTP

```json
{
  "statusCode": 400,
  "message": "رمز التحقق غير صحيح",
  "error": "Bad Request"
}
```

#### 404 Not Found — Account Not Found

```json
{
  "statusCode": 404,
  "message": "الحساب غير موجود",
  "error": "Not Found"
}
```

---

## API 04 — Login

### User Authentication

Authenticates a user (`STUDENT`, `TEACHER`, or `ADMIN`) by verifying the provided credentials and account status.

Upon successful authentication, the API returns an **Access Token** and a **Refresh Token**.

### Endpoint

```http
POST /auth/login
```

### Access

`Public`

### Request Body

```json
{
  "email": "mohamed@example.com",
  "password": "Password123"
}
```

### Request Fields

| Field      | Type     | Required | Description          |
| ---------- | -------- | :------: | -------------------- |
| `email`    | `string` |   Yes    | User's email address |
| `password` | `string` |   Yes    | User's password      |

### Success Response

**200 OK**

```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "محمد محمود",
    "email": "mohamed@example.com",
    "role": "STUDENT",
    "studentId": "20260001"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### Response Fields

| Field                 | Type             | Description                       |
| --------------------- | ---------------- | --------------------------------- |
| `user.id`             | `string`         | Unique user identifier            |
| `user.name`           | `string`         | User's name                       |
| `user.email`          | `string`         | User's email address              |
| `user.role`           | `string`         | User role                         |
| `user.studentId`      | `string \| null` | Student identifier, if applicable |
| `tokens.accessToken`  | `string`         | JWT access token                  |
| `tokens.refreshToken` | `string`         | JWT refresh token                 |

### Error Responses

#### 401 Unauthorized — Invalid Credentials

```json
{
  "statusCode": 401,
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "error": "Unauthorized"
}
```

#### 403 Forbidden — Account Not Activated / Disabled

```json
{
  "statusCode": 403,
  "message": "الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق",
  "error": "Forbidden"
}
```

---

## API 05 — Forget Password

### Request Password Reset Code

Sends a password-reset OTP to the user's registered email address.

The OTP is used to verify ownership of the account before allowing the password to be changed.

### Endpoint

```http
POST /auth/forget-password
```

### Access

`Public`

### Request Body

```json
{
  "email": "mohamed@example.com"
}
```

### Request Fields

| Field   | Type     | Required | Description                     |
| ------- | -------- | :------: | ------------------------------- |
| `email` | `string` |   Yes    | User's registered email address |

### Success Response

**200 OK**

```json
{
  "message": "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
}
```

### Error Responses

#### 400 Bad Request — Cooldown Period

```json
{
  "statusCode": 400,
  "message": "يرجى الانتظار 30 ثانية قبل إعادة طلب رمز التحقق",
  "error": "Bad Request"
}
```

#### 404 Not Found — Account Not Found

```json
{
  "statusCode": 404,
  "message": "الحساب غير موجود",
  "error": "Not Found"
}
```

---

## API 06 — Reset Password

### Set a New Password

Verifies the provided OTP and updates the user's password.

When the OTP is valid:

1. The password is securely hashed.
2. The OTP is cleared.
3. All previous sessions are invalidated.
4. The user can log in using the new password.

### Endpoint

```http
POST /auth/reset-password
```

### Access

`Public`

### Request Body

```json
{
  "email": "mohamed@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### Request Fields

| Field         | Type     | Required | Description                        |
| ------------- | -------- | :------: | ---------------------------------- |
| `email`       | `string` |   Yes    | User's registered email            |
| `otp`         | `string` |   Yes    | Password reset OTP                 |
| `newPassword` | `string` |   Yes    | New password, minimum 8 characters |

### Success Response

**200 OK**

```json
{
  "message": "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول"
}
```

### Error Responses

#### 400 Bad Request — Invalid / Expired OTP

```json
{
  "statusCode": 400,
  "message": "رمز التحقق غير صحيح",
  "error": "Bad Request"
}
```

#### 404 Not Found — Account Not Found

```json
{
  "statusCode": 404,
  "message": "الحساب غير موجود",
  "error": "Not Found"
}
```

---

## API 07 — Get New Access Token

### Refresh Access Token

Generates a new Access Token and Refresh Token using a valid Refresh Token.

This endpoint does not require the current Access Token because the Access Token may already be expired.

### Endpoint

```http
POST /auth/get-new-access-token
```

### Access

`Public`

> A Bearer Access Token is not required. A valid Refresh Token must be provided.

### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Request Fields

| Field          | Type     | Required | Description         |
| -------------- | -------- | :------: | ------------------- |
| `refreshToken` | `string` |   Yes    | Valid Refresh Token |

### Success Response

**200 OK**

```json
{
  "message": "تم تجديد الـ Access Token بنجاح",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### Error Responses

#### 401 Unauthorized — Invalid Refresh Token

```json
{
  "statusCode": 401,
  "message": "الـ Refresh Token غير صالح أو انتهت صلاحيته",
  "error": "Unauthorized"
}
```

---

## API 08 — Logout

### Sign Out

Terminates the current user session by clearing the Refresh Token stored for the authenticated user.

### Endpoint

```http
POST /auth/logout
```

### Access

`Protected`

### Authorization Header

```http
Authorization: Bearer <AccessToken>
```

### Request Body

None.

### Success Response

**200 OK**

```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

### Error Responses

#### 401 Unauthorized — Missing / Expired Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

# 2. Users & Profile

This section contains endpoints related to fetching user profiles and updating specific role credentials, such as Student profiles.

---

## API 09 — Get Current User Profile

### Fetch Authenticated User Details

Retrieves the complete profile details of the currently authenticated user (`STUDENT`, `TEACHER`, or `ADMIN`) derived from their JWT Access Token.

Sensitive security fields, such as `password`, `hashedRefreshToken`, and `emailOtp`, are omitted from the response.

### Endpoint

```http
GET /users/me
```

### Access

`Protected`

### Authorization Header

```http
Authorization: Bearer <AccessToken>
```

---

## API 10 — Update Student Profile

### Update Student Profile Information

Updates profile details exclusively for authenticated users with the `STUDENT` role.

All fields in the request body are optional.

If `password` is provided, it is securely re-hashed before being updated.

### Endpoint

```http
PATCH /users/student/profile
```

### Access

`Protected` — Requires `STUDENT` Role

### Authorization Header

```http
Authorization: Bearer <AccessToken>
```

### Request Body

```json
{
  "name": "محمد محمود المعدل",
  "password": "NewSecretPassword123",
  "phoneNumber": "01099998888",
  "address": "القاهرة",
  "educationalStage": "الصف الثالث الثانوي"
}
```

### Request Fields

| Field              | Type     | Required | Description                             |
| ------------------ | -------- | :------: | --------------------------------------- |
| `name`             | `string` |    No    | Updated full name (3–100 characters)    |
| `password`         | `string` |    No    | Updated password (minimum 6 characters) |
| `phoneNumber`      | `string` |    No    | Valid Egyptian mobile number            |
| `address`          | `string` |    No    | Updated student address                 |
| `educationalStage` | `string` |    No    | Student's educational level / grade     |

### Success Response

**200 OK**

```json
{
  "message": "تم تحديث بيانات حساب الطالب بنجاح",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "studentId": "20260001",
    "name": "محمد محمود المعدل",
    "email": "mohamed@example.com",
    "phoneNumber": "01099998888",
    "address": "القاهرة",
    "role": "STUDENT",
    "status": "ACTIVE",
    "educationalStage": "الصف الثالث الثانوي",
    "createdAt": "2026-08-31T12:00:00.000Z",
    "updatedAt": "2026-08-31T12:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request — Validation Error

```json
{
  "statusCode": 400,
  "message": ["رقم الهاتف يجب أن يكون رقم مصري صالح"],
  "error": "Bad Request"
}
```

#### 401 Unauthorized — Invalid / Expired Token

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden — Insufficient Role Permissions

```json
{
  "statusCode": 403,
  "message": "غير مصرح لك بالوصول لهذا المورد، هذه الميزة مخصصة للصلاحية: [STUDENT] فقط",
  "error": "Forbidden"
}
```

---

# 3. Authentication Flow

The standard authentication flow is:

```text
┌──────────────┐
│    Signup    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Email OTP Sent   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify Account   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│      Login       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Access Token    │
│  Refresh Token   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Protected APIs   │
└────────┬─────────┘
         │
         │ Access Token Expired
         ▼
┌──────────────────┐
│  Refresh Token   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  New Token Pair  │
└──────────────────┘
```

---

# 4. HTTP Status Codes

| Status Code | Meaning      | Usage                                                          |
| ----------: | ------------ | -------------------------------------------------------------- |
|       `200` | OK           | Request completed successfully                                 |
|       `201` | Created      | New account/resource created                                   |
|       `400` | Bad Request  | Invalid input or validation error                              |
|       `401` | Unauthorized | Authentication required or credentials/token invalid           |
|       `403` | Forbidden    | User is authenticated but not allowed to perform the operation |
|       `404` | Not Found    | Requested account/resource does not exist                      |
|       `409` | Conflict     | Resource already exists or conflicts with current state        |

---

# 5. General Notes

- All endpoints use **JSON** for request and response bodies unless otherwise specified.
- All response messages are returned in **Arabic**.
- All error messages are returned in **Arabic**, except for the standard `error` field when it represents the HTTP exception name.
- Protected endpoints require a valid JWT Access Token.
- Public authentication endpoints do not require a Bearer Access Token.
- Access Tokens are used to access protected resources.
- Refresh Tokens are used to obtain a new Access Token after expiration.
- OTP codes are used for account verification and password recovery.
- Passwords must never be stored in plain text and must be securely hashed before persistence.

---

# API Summary

|   # | Method  | Endpoint                     | Access                | Purpose                       |
| --: | :-----: | ---------------------------- | --------------------- | ----------------------------- |
|  01 | `POST`  | `/auth/signup`               | Public                | Create a new student account  |
|  02 | `POST`  | `/auth/resend-otp`           | Public                | Resend email verification OTP |
|  03 | `POST`  | `/auth/verify-account`       | Public                | Verify student account        |
|  04 | `POST`  | `/auth/login`                | Public                | Authenticate user             |
|  05 | `POST`  | `/auth/forget-password`      | Public                | Request password reset OTP    |
|  06 | `POST`  | `/auth/reset-password`       | Public                | Reset password                |
|  07 | `POST`  | `/auth/get-new-access-token` | Public                | Refresh access token          |
|  08 | `POST`  | `/auth/logout`               | Protected             | Logout current user           |
|  09 |  `GET`  | `/users/me`                  | Protected             | Get current user profile      |
|  10 | `PATCH` | `/users/student/profile`     | Protected — `STUDENT` | Update student profile        |

---

## RUQI PLATFORM

**API Documentation — v1**

**Environment:** Development
**Base URL:** `https://app-6a95f847.deploy.meerasolution.com`

---
