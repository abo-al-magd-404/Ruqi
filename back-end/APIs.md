# RUQI Platform — API Reference

## 1. Base Configuration

### Base URL

```text
https://app-6a995274.deploy.meerasolution.com
```

### Local Development

```text
http://localhost:8000
```

### Headers

For authenticated requests:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Response Language

- Success messages: Arabic
- Error messages: Arabic

---

# 2. Authentication

## Token Types

### Access Token

Used to authenticate protected endpoints:

```http
Authorization: Bearer <accessToken>
```

### Refresh Token

Used only with:

```http
POST /auth/get-new-access-token
```

The refresh token is sent in the request body.

---

# 3. Authentication APIs

## 3.1 Signup

### `POST /auth/signup`

Creates a new student account.

### Authentication

Public.

### Request Body

```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "password123",
  "phoneNumber": "01000000000",
  "address": "Damanhur",
  "stage": "STAGE_ID"
}
```

### Success

**201 Created**

A verification OTP is sent to the user's email.

New accounts are created with the `STUDENT` role.

---

## 3.2 Resend OTP

### `POST /auth/resend-otp`

Resends the account verification OTP.

### Authentication

Public.

### Request Body

```json
{
  "email": "ahmed@example.com"
}
```

### Success

**200 OK**

The endpoint applies an OTP resend cooldown.

---

## 3.3 Verify Account

### `POST /auth/verify-account`

Verifies the user's account using the received OTP.

### Authentication

Public.

### Request Body

```json
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

### Success

**200 OK**

The account becomes active after successful verification.

---

## 3.4 Login

### `POST /auth/login`

Authenticates the user and returns authentication tokens.

### Authentication

Public.

### Request Body

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Success

**200 OK**

Returns the authenticated user information and:

- Access Token
- Refresh Token

---

## 3.5 Forget Password

### `POST /auth/forget-password`

Requests a password-reset OTP.

### Authentication

Public.

### Request Body

```json
{
  "email": "ahmed@example.com"
}
```

### Success

**200 OK**

A password-reset OTP is sent to the user's email.

---

## 3.6 Reset Password

### `POST /auth/reset-password`

Resets the user's password using the OTP.

### Authentication

Public.

### Request Body

```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

### Success

**200 OK**

The password is changed and the existing refresh-token session is invalidated.

The user must log in again.

---

## 3.7 Get New Access Token

### `POST /auth/get-new-access-token`

Generates a new Access Token using the Refresh Token.

### Authentication

Public.

The Refresh Token itself is the credential for this endpoint.

### Request Body

```json
{
  "refreshToken": "<refreshToken>"
}
```

### Success

**200 OK**

Returns a new:

- Access Token
- Refresh Token

The Refresh Token is rotated after successful validation.

---

## 3.8 Logout

### `POST /auth/logout`

Logs out the currently authenticated user.

### Authentication

Required.

```http
Authorization: Bearer <accessToken>
```

### Success

**200 OK**

The stored refresh token is invalidated.

---

# 4. User APIs

## 4.1 Get My Profile

### `GET /users/me`

Returns the profile of the currently authenticated user.

### Authentication

Required.

Works for:

- STUDENT
- TEACHER
- ADMIN

### Headers

```http
Authorization: Bearer <accessToken>
```

### Success

**200 OK**

Returns the authenticated user's account information.

Sensitive authentication fields are excluded from the response.

---

## 4.2 Update Student Profile

### `PATCH /users/student/profile`

Updates the currently authenticated student's profile.

### Authentication

Required.

### Role

`STUDENT` only.

### Headers

```http
Authorization: Bearer <accessToken>
```

### Supported Fields

The request accepts the fields defined by `UpdateStudentProfileDto`.

The password, when provided, is hashed before being stored.

### Success

**200 OK**

Returns the updated student profile.

Sensitive authentication fields are excluded from the response.

---

# 5. Educational Content APIs

Educational content is organized as:

```text
Educational Stage
    └── Month
        ├── Lesson
        └── Exam
```

---

# 6. Educational Stages

## 6.1 Get All Educational Stages

### `GET /educational-content/stages`

Returns all educational stages ordered by their `order` field.

### Authentication

Public.

### Success

**200 OK**

---

## 6.2 Get One Educational Stage

### `GET /educational-content/stages/:id`

Returns a single educational stage.

### Authentication

Public.

### Path Parameter

```text
id = Educational Stage ID
```

### Success

**200 OK**

### Errors

- `404 Not Found` — المرحلة الدراسية غير موجودة

---

## 6.3 Create Educational Stage

### `POST /educational-content/stages`

Creates a new educational stage.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**201 Created**

If `order` is not provided, the stage is assigned an order based on the current number of stages.

---

## 6.4 Update Educational Stage

### `PATCH /educational-content/stages/:id`

Updates an existing educational stage.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — المرحلة الدراسية غير موجودة

---

## 6.5 Delete Educational Stage

### `DELETE /educational-content/stages/:id`

Deletes an educational stage.

### Authentication

Required.

### Role

`TEACHER` only.

### Behavior

Deleting a stage also deletes:

- All months belonging to the stage
- All lessons belonging to those months
- All exams belonging to those months

### Success

**200 OK**

### Errors

- `404 Not Found` — المرحلة الدراسية غير موجودة

---

## 6.6 Reorder Educational Stages

### `PATCH /educational-content/stages/reorder`

Updates the order of educational stages.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

---

# 7. Educational Months

## 7.1 Get All Months of a Stage

### `GET /educational-content/months/stage/:stageId`

Returns all months belonging to an educational stage.

### Authentication

Optional.

The endpoint works for:

- Guests
- Authenticated users

### Behavior

The response includes a `locked` field for each month.

A month is unlocked when:

- The user is a teacher or admin, or
- The month exists in the student's `subscribedMonths`

Guests receive locked months.

### Success

**200 OK**

---

## 7.2 Get One Month

### `GET /educational-content/months/:id`

Returns one month.

### Authentication

Optional.

### Behavior

The response includes:

```json
{
  "locked": true
}
```

when the current user does not have access to the month.

### Success

**200 OK**

### Errors

- `404 Not Found` — الشهر غير موجود

---

## 7.3 Create Month

### `POST /educational-content/months`

Creates a new month.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**201 Created**

If `order` is not provided, the month is placed after the existing months of the selected stage.

---

## 7.4 Update Month

### `PATCH /educational-content/months/:id`

Updates an existing month.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — الشهر غير موجود

---

## 7.5 Delete Month

### `DELETE /educational-content/months/:id`

Deletes a month.

### Authentication

Required.

### Role

`TEACHER` only.

### Behavior

Deleting a month also deletes:

- All lessons belonging to the month
- All exams belonging to the month

### Success

**200 OK**

### Errors

- `404 Not Found` — الشهر غير موجود

---

## 7.6 Reorder Months

### `PATCH /educational-content/months/reorder`

Updates the order of months.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

---

# 8. Lessons

## 8.1 Get All Lessons of a Month

### `GET /educational-content/lessons/month/:monthId`

Returns all lessons belonging to a month.

### Authentication

Optional.

### Behavior

If the month is unlocked, the complete lesson data is returned.

If the month is locked, only public lesson information is returned, including:

- `_id`
- `type`
- `title`
- `description`
- `image`
- `month`
- `order`
- `locked`

Sensitive lesson content is not returned for locked lessons.

### Success

**200 OK**

---

## 8.2 Get One Lesson

### `GET /educational-content/lessons/:id`

Returns one lesson.

### Authentication

Optional.

### Behavior

Locked lessons return only the public lesson information with:

```json
{
  "locked": true
}
```

### Success

**200 OK**

### Errors

- `404 Not Found` — الدرس غير موجود

---

## 8.3 Create Lesson

### `POST /educational-content/lessons`

Creates a new lesson.

### Authentication

Required.

### Role

`TEACHER` only.

### Ordering

If `order` is not provided, the lesson is placed after the last existing lesson or exam in the same month.

Lessons and exams share the same ordering sequence.

### Success

**201 Created**

---

## 8.4 Update Lesson

### `PATCH /educational-content/lessons/:id`

Updates an existing lesson.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — الدرس غير موجود

---

## 8.5 Delete Lesson

### `DELETE /educational-content/lessons/:id`

Deletes a lesson.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — الدرس غير موجود

---

# 9. Exams

## 9.1 Get All Exams of a Month

### `GET /educational-content/exams/month/:monthId`

Returns all exams belonging to a month.

### Authentication

Optional.

### Behavior

If the month is unlocked, the complete exam data is returned.

If the month is locked, only the public exam information is returned:

- `_id`
- `type`
- `title`
- `description`
- `image`
- `month`
- `order`
- `locked`

### Success

**200 OK**

---

## 9.2 Get One Exam

### `GET /educational-content/exams/:id`

Returns one exam.

### Authentication

Optional.

### Behavior

Locked exams return only public exam information with:

```json
{
  "locked": true
}
```

### Success

**200 OK**

### Errors

- `404 Not Found` — الاختبار غير موجود

---

## 9.3 Create Exam

### `POST /educational-content/exams`

Creates a new exam.

### Authentication

Required.

### Role

`TEACHER` only.

### Ordering

If `order` is not provided, the exam is placed after the last existing lesson or exam in the same month.

Lessons and exams share the same ordering sequence.

### Success

**201 Created**

---

## 9.4 Update Exam

### `PATCH /educational-content/exams/:id`

Updates an existing exam.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — الاختبار غير موجود

---

## 9.5 Delete Exam

### `DELETE /educational-content/exams/:id`

Deletes an exam.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Errors

- `404 Not Found` — الاختبار غير موجود

---

# 10. Combined Month Content

## 10.1 Get All Content of a Month

### `GET /educational-content/content/month/:monthId`

Returns both lessons and exams belonging to a month in a single response.

### Authentication

Optional.

### Behavior

Lessons and exams are combined and sorted using their shared `order` field.

### Unlocked Month

Returns:

```json
{
  "locked": false,
  "items": []
}
```

with the complete content.

### Locked Month

Returns:

```json
{
  "locked": true,
  "items": []
}
```

with locked versions of the lessons and exams.

---

## 10.2 Reorder Month Content

### `PATCH /educational-content/content/reorder`

Reorders lessons and exams together.

### Authentication

Required.

### Role

`TEACHER` only.

### Rules

- Content IDs cannot be duplicated.
- Order values cannot be duplicated.
- All submitted content must exist.
- All submitted content must belong to the same month.
- Lessons and exams use the same shared ordering sequence.

### Success

**200 OK**

### Errors

- `400 Bad Request` — duplicated content/order or content from different months
- `404 Not Found` — one or more content items do not exist

---

# 11. Educational Content Statistics

## `GET /educational-content/stats`

Returns educational content statistics.

### Authentication

Required.

### Role

`TEACHER` only.

### Success

**200 OK**

### Response Structure

```json
{
  "stages": 12,
  "months": 36,
  "lessons": 100,
  "exams": 20
}
```

The values are calculated dynamically from the database.

---

# 12. Roles

| Role      | Access                                                   |
| --------- | -------------------------------------------------------- |
| `STUDENT` | Student-specific APIs and subscribed educational content |
| `TEACHER` | Educational content management and statistics            |
| `ADMIN`   | Full educational content access                          |
| Guest     | Public educational content only                          |

---

# 13. Educational Content Access Control

Educational content uses optional authentication.

This means the same GET endpoint can be called with or without an Access Token.

### Guest

A guest has no subscribed months.

```text
allMonths = false
monthIds = []
```

Therefore, months and their content are returned as locked.

### Student

A student can access the months included in:

```text
subscribedMonths
```

Only subscribed months return their complete content.

### Teacher / Admin

Teachers and admins have access to all months.

```text
allMonths = true
```

---

# 14. Locked Content

When a month is locked, the backend does not return the complete lesson/exam data.

### Locked Lesson

```json
{
  "_id": "...",
  "type": "LESSON",
  "title": "...",
  "description": "...",
  "image": "...",
  "month": "...",
  "order": 1,
  "locked": true
}
```

### Locked Exam

```json
{
  "_id": "...",
  "type": "EXAM",
  "title": "...",
  "description": "...",
  "image": "...",
  "month": "...",
  "order": 2,
  "locked": true
}
```

The frontend should use the `locked` property to determine whether the content can be opened/displayed in full.

---

# 15. Authentication & Authorization Summary

| Endpoint                                          | Auth          | Role    |
| ------------------------------------------------- | ------------- | ------- |
| `POST /auth/signup`                               | Public        | —       |
| `POST /auth/resend-otp`                           | Public        | —       |
| `POST /auth/verify-account`                       | Public        | —       |
| `POST /auth/login`                                | Public        | —       |
| `POST /auth/forget-password`                      | Public        | —       |
| `POST /auth/reset-password`                       | Public        | —       |
| `POST /auth/get-new-access-token`                 | Refresh Token | —       |
| `POST /auth/logout`                               | Required      | Any     |
| `GET /users/me`                                   | Required      | Any     |
| `PATCH /users/student/profile`                    | Required      | STUDENT |
| `GET /educational-content/stages`                 | Public        | —       |
| `GET /educational-content/stages/:id`             | Public        | —       |
| `POST /educational-content/stages`                | Required      | TEACHER |
| `PATCH /educational-content/stages/:id`           | Required      | TEACHER |
| `DELETE /educational-content/stages/:id`          | Required      | TEACHER |
| `PATCH /educational-content/stages/reorder`       | Required      | TEACHER |
| `GET /educational-content/months/stage/:stageId`  | Optional      | —       |
| `GET /educational-content/months/:id`             | Optional      | —       |
| `POST /educational-content/months`                | Required      | TEACHER |
| `PATCH /educational-content/months/:id`           | Required      | TEACHER |
| `DELETE /educational-content/months/:id`          | Required      | TEACHER |
| `PATCH /educational-content/months/reorder`       | Required      | TEACHER |
| `GET /educational-content/lessons/month/:monthId` | Optional      | —       |
| `GET /educational-content/lessons/:id`            | Optional      | —       |
| `POST /educational-content/lessons`               | Required      | TEACHER |
| `PATCH /educational-content/lessons/:id`          | Required      | TEACHER |
| `DELETE /educational-content/lessons/:id`         | Required      | TEACHER |
| `GET /educational-content/exams/month/:monthId`   | Optional      | —       |
| `GET /educational-content/exams/:id`              | Optional      | —       |
| `POST /educational-content/exams`                 | Required      | TEACHER |
| `PATCH /educational-content/exams/:id`            | Required      | TEACHER |
| `DELETE /educational-content/exams/:id`           | Required      | TEACHER |
| `GET /educational-content/content/month/:monthId` | Optional      | —       |
| `PATCH /educational-content/content/reorder`      | Required      | TEACHER |
| `GET /educational-content/stats`                  | Required      | TEACHER |

---

# 16. HTTP Status Codes

| Status             | Meaning                                            |
| ------------------ | -------------------------------------------------- |
| `200 OK`           | Successful request                                 |
| `201 Created`      | Resource successfully created                      |
| `400 Bad Request`  | Invalid request data                               |
| `401 Unauthorized` | Missing or invalid authentication                  |
| `403 Forbidden`    | Authenticated user does not have the required role |
| `404 Not Found`    | Requested resource does not exist                  |
| `409 Conflict`     | Resource conflicts with existing data              |

---

# 17. Frontend Integration Rules

### Authentication

Store and send the Access Token as:

```http
Authorization: Bearer <accessToken>
```

### Refresh Flow

When the Access Token expires:

1. Send the Refresh Token to:

```http
POST /auth/get-new-access-token
```

2. Receive the new Access Token and Refresh Token.
3. Replace the old tokens.
4. Retry the original authenticated request.

### Optional Authentication

Educational GET endpoints marked as `Optional` can be requested without authentication.

If the user is logged in, send the Access Token so the backend can determine:

- Whether the user is subscribed.
- Whether the requested month is locked.
- Whether the user has access to the complete educational content.

### Locked Content

The frontend must respect the backend `locked` field.

Do not attempt to reconstruct or expose hidden lesson/exam data on the client side.

---

# 18. Endpoint Summary

## Authentication

```text
POST   /auth/signup
POST   /auth/resend-otp
POST   /auth/verify-account
POST   /auth/login
POST   /auth/forget-password
POST   /auth/reset-password
POST   /auth/get-new-access-token
POST   /auth/logout
```

## Users

```text
GET    /users/me
PATCH  /users/student/profile
```

## Educational Stages

```text
GET    /educational-content/stages
GET    /educational-content/stages/:id
POST   /educational-content/stages
PATCH  /educational-content/stages/:id
DELETE /educational-content/stages/:id
PATCH  /educational-content/stages/reorder
```

## Months

```text
GET    /educational-content/months/stage/:stageId
GET    /educational-content/months/:id
POST   /educational-content/months
PATCH  /educational-content/months/:id
DELETE /educational-content/months/:id
PATCH  /educational-content/months/reorder
```

## Lessons

```text
GET    /educational-content/lessons/month/:monthId
GET    /educational-content/lessons/:id
POST   /educational-content/lessons
PATCH  /educational-content/lessons/:id
DELETE /educational-content/lessons/:id
```

## Exams

```text
GET    /educational-content/exams/month/:monthId
GET    /educational-content/exams/:id
POST   /educational-content/exams
PATCH  /educational-content/exams/:id
DELETE /educational-content/exams/:id
```

## Combined Content

```text
GET    /educational-content/content/month/:monthId
PATCH  /educational-content/content/reorder
```

## Statistics

```text
GET    /educational-content/stats
```

---

# 19. Important Contract Rules

- All IDs are MongoDB ObjectIds.
- New accounts are created as `STUDENT`.
- Authentication uses Bearer Access Tokens.
- Refresh Tokens are sent in the refresh endpoint request body.
- Refresh Tokens are rotated when a new Access Token is generated.
- Logout invalidates the stored Refresh Token.
- Student profile updates are restricted to `STUDENT`.
- Educational content management is restricted to `TEACHER`.
- `ADMIN` has full educational-content access.
- Educational GET endpoints can use optional authentication.
- Guests can view educational structure but receive locked content.
- Students can access only their subscribed months.
- Teachers and admins can access all months.
- Locked lessons and exams expose only their public metadata.
- Lessons and exams share the same `order` sequence inside a month.
- Combined content is returned in order using the shared `order` field.
- Deleting a stage deletes its months, lessons, and exams.
- Deleting a month deletes its lessons and exams.
- The frontend should rely on the backend `locked` field for access state.
