# RUQI Platform — API Reference

> **Purpose:** Frontend integration reference for the RUQI Platform APIs.
> **API Version:** `v1`
> **Base URL:** `https://app-6a995274.deploy.meerasolution.com`
> **Content-Type:** `application/json`
> **Response/Error Language:** Arabic

---

# 1. Quick Start

## Authentication

Protected endpoints require the Access Token:

```http
Authorization: Bearer <accessToken>
```

### Token Types

| Token          | Purpose                         | Usage                                        |
| -------------- | ------------------------------- | -------------------------------------------- |
| `accessToken`  | Authenticate protected requests | `Authorization: Bearer <accessToken>`        |
| `refreshToken` | Generate a new token pair       | Request body of `/auth/get-new-access-token` |

The Refresh Token must **not** be used as the normal Bearer token.

---

# 2. Authentication

## POST `/auth/signup`

Creates a new student account.

**Access:** Public
**Status:** `201 Created`

### Request

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

### Response

```json
{
  "message": "تم إنشاء الحساب بنجاح، يرجى التوجه للبريد الإلكتروني لتفعيل الحساب بواسطة رمز التحقق",
  "email": "mohamed@example.com"
}
```

### Notes

- New accounts are created as `STUDENT`.
- Do not send `role`.
- The account starts as `PENDING`.
- An OTP is sent to the user's email.
- `stage` must reference an existing educational stage.

---

## POST `/auth/resend-otp`

Resends the account verification OTP.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "email": "mohamed@example.com"
}
```

The current OTP resend cooldown is `60 seconds`.

---

## POST `/auth/verify-account`

Verifies the account using the email OTP.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "email": "mohamed@example.com",
  "otp": "123456"
}
```

The OTP is a 6-digit code with a default expiration of `10 minutes`.

---

## POST `/auth/login`

Authenticates the user and returns Access and Refresh Tokens.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "email": "mohamed@example.com",
  "password": "Password123"
}
```

### Response

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

---

## POST `/auth/forget-password`

Starts the password recovery process.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "email": "mohamed@example.com"
}
```

An OTP is sent to the user's email.

---

## POST `/auth/reset-password`

Changes the user's password using the OTP.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "email": "mohamed@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### Response

```json
{
  "message": "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول"
}
```

After a successful reset, the stored Refresh Token is invalidated.

---

## POST `/auth/get-new-access-token`

Generates a new Access Token and Refresh Token.

**Access:** Public
**Status:** `200 OK`

### Request

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response

```json
{
  "message": "تم تجديد الـ Access Token بنجاح",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Important

This endpoint does **not** use `JwtAuthGuard`.

The Refresh Token itself is validated by the backend.

After a successful refresh, the frontend must replace **both** tokens.

---

## POST `/auth/logout`

Logs out the authenticated user.

**Access:** Authenticated
**Status:** `200 OK`

### Headers

```http
Authorization: Bearer <accessToken>
```

### Request Body

No body required.

### Response

```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

The backend invalidates the user's stored Refresh Token.

The frontend should also remove the locally stored tokens.

---

# 3. User Profile

## GET `/users/me`

Retrieves the profile of the currently authenticated user.

This endpoint is available for **all authenticated user types**.

**Access:** Authenticated
**Guard:** `JwtAuthGuard`
**Status:** `200 OK`

### Headers

```http
Authorization: Bearer <accessToken>
```

### Request Body

No body required.

### Response

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
    "studentId": "STU-2026-123456"
  }
}
```

### Security

Sensitive authentication fields are excluded from the response, including:

- `password`
- `hashedRefreshToken`
- `emailOtp`
- `emailOtpExpiresAt`
- `emailOtpLastSentAt`

---

## PATCH `/users/student/profile`

Updates the authenticated student's profile.

**Access:** `STUDENT` only
**Guards:** `JwtAuthGuard` + `RolesGuard`
**Status:** `200 OK`

### Headers

```http
Authorization: Bearer <accessToken>
```

### Request Body

The request body depends on `UpdateStudentProfileDto`.

Example:

```json
{
  "name": "محمد محمود المعدل",
  "password": "NewPassword123",
  "phoneNumber": "01099998888",
  "address": "القاهرة",
  "avatar": "https://example.com/avatar.jpg",
  "stage": "66ce1234a5b6c7d8e9f01111"
}
```

### Response

```json
{
  "message": "تم تحديث بيانات حساب الطالب بنجاح",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "محمد محمود المعدل",
    "email": "mohamed@example.com",
    "phoneNumber": "01099998888",
    "address": "القاهرة",
    "avatar": "https://example.com/avatar.jpg",
    "role": "STUDENT",
    "status": "ACTIVE",
    "stage": "66ce1234a5b6c7d8e9f01111",
    "studentId": "STU-2026-123456"
  }
}
```

### Important

- Only authenticated students can use this endpoint.
- The user's identity is taken from the Access Token.
- The frontend does **not** send `userId`.
- If `password` is included, the backend hashes it before storing it.
- Sensitive authentication fields are not returned.

---

# 4. User Roles

| Role      | Description           |
| --------- | --------------------- |
| `STUDENT` | Student account       |
| `TEACHER` | Teacher account       |
| `ADMIN`   | Administrator account |

### Profile Access

| Endpoint                       | STUDENT | TEACHER | ADMIN |
| ------------------------------ | ------: | ------: | ----: |
| `GET /users/me`                |      ✅ |      ✅ |    ✅ |
| `PATCH /users/student/profile` |      ✅ |      ❌ |    ❌ |

---

# 5. Token Refresh Flow

The frontend should implement the following flow:

```text
Login
  ↓
Access Token + Refresh Token
  ↓
Use Access Token
  ↓
Access Token expires
  ↓
Protected request returns 401
  ↓
POST /auth/get-new-access-token
  ↓
Send Refresh Token in body
  ↓
Receive new Access Token + Refresh Token
  ↓
Replace both tokens
  ↓
Retry original request once
```

### Example Refresh Request

```http
POST /auth/get-new-access-token
Content-Type: application/json
```

```json
{
  "refreshToken": "<currentRefreshToken>"
}
```

### Example Refresh Response

```json
{
  "message": "تم تجديد الـ Access Token بنجاح",
  "tokens": {
    "accessToken": "<newAccessToken>",
    "refreshToken": "<newRefreshToken>"
  }
}
```

---

# 6. HTTP Status Codes

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| `200`  | Successful operation                             |
| `201`  | Resource/account created                         |
| `400`  | Invalid request or validation error              |
| `401`  | Authentication failed / invalid or expired token |
| `403`  | User does not have the required role             |
| `404`  | Requested resource does not exist                |
| `409`  | Resource conflict                                |
| `500`  | Internal server error                            |

---

# 7. Error Response

A typical NestJS error response:

```json
{
  "statusCode": 400,
  "message": ["رسالة الخطأ"],
  "error": "Bad Request"
}
```

Some exceptions may return `message` as a string:

```json
{
  "statusCode": 401,
  "message": "الـ Refresh Token غير صالح",
  "error": "Unauthorized"
}
```

The frontend should therefore support both:

```ts
message: string;
```

and:

```ts
message: string[]
```

---

# 8. Frontend Integration Rules

## Authentication

- Use the Access Token for protected requests.
- Send it using `Authorization: Bearer <accessToken>`.
- Do not send the Refresh Token as the normal Bearer token.
- Send the Refresh Token in the body of `/auth/get-new-access-token`.

## Refresh

- Refresh only when necessary.
- Replace both Access and Refresh Tokens after successful refresh.
- Retry the original failed request only once.
- Do not create an infinite refresh loop.
- If refresh fails, clear the authentication state and redirect to login.

## User Profile

- Use `/users/me` to retrieve the current authenticated user's profile.
- Do not send a user ID when calling `/users/me`.
- Use `/users/student/profile` only for users with the `STUDENT` role.
- The backend determines the current user from the Access Token.

## Logout

- Call `/auth/logout` with the Access Token.
- Remove both tokens from the frontend after logout.
- Clear the current user/session state.

---

# 9. Complete API Summary

| Method  | Endpoint                     | Access        | Status |
| ------- | ---------------------------- | ------------- | ------ |
| `POST`  | `/auth/signup`               | Public        | `201`  |
| `POST`  | `/auth/resend-otp`           | Public        | `200`  |
| `POST`  | `/auth/verify-account`       | Public        | `200`  |
| `POST`  | `/auth/login`                | Public        | `200`  |
| `POST`  | `/auth/forget-password`      | Public        | `200`  |
| `POST`  | `/auth/reset-password`       | Public        | `200`  |
| `POST`  | `/auth/get-new-access-token` | Public        | `200`  |
| `POST`  | `/auth/logout`               | Authenticated | `200`  |
| `GET`   | `/users/me`                  | Authenticated | `200`  |
| `PATCH` | `/users/student/profile`     | `STUDENT`     | `200`  |

---

> **Source of Truth:** This document describes the current backend API contract. If an older API document differs from the current backend implementation, the current backend implementation takes precedence.
