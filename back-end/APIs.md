# RUQI Platform — API Reference

## 1. Base Configuration

### Production Base URL

```text
https://app-6aa80d99.deploy.meerasolution.com
```

### Local Development

```text
http://localhost:8000
```

### Authentication Header

All protected endpoints require:

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

Used to access protected endpoints:

```http
Authorization: Bearer <accessToken>
```

### Refresh Token

Used to generate a new Access Token through:

```http
POST /auth/get-new-access-token
```

The Refresh Token is sent in the request body.

---

# 3. Authentication APIs

## 3.1 Signup

### `POST /auth/signup`

Creates a new student account.

**Authentication:** Public

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

### Behavior

- Creates a new account with the `STUDENT` role.
- Generates a student ID.
- Sends a verification OTP to the user's email.
- The account remains pending until verification.

### Success

```text
201 Created
```

---

## 3.2 Resend OTP

### `POST /auth/resend-otp`

Resends the account verification OTP.

**Authentication:** Public

### Request Body

```json
{
  "email": "ahmed@example.com"
}
```

### Success

```text
200 OK
```

---

## 3.3 Verify Account

### `POST /auth/verify-account`

Verifies the user's account using the OTP.

**Authentication:** Public

### Request Body

```json
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

### Behavior

After successful verification, the account status changes to active.

### Success

```text
200 OK
```

---

## 3.4 Login

### `POST /auth/login`

Authenticates a user.

**Authentication:** Public

### Request Body

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Success

```text
200 OK
```

Returns authentication information, including:

- Access Token
- Refresh Token
- User information

---

## 3.5 Forget Password

### `POST /auth/forget-password`

Requests a password-reset OTP.

**Authentication:** Public

### Request Body

```json
{
  "email": "ahmed@example.com"
}
```

### Success

```text
200 OK
```

---

## 3.6 Reset Password

### `POST /auth/reset-password`

Resets the user's password.

**Authentication:** Public

### Request Body

```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

### Behavior

- Changes the user's password.
- Invalidates the stored Refresh Token.
- Requires the user to log in again.

### Success

```text
200 OK
```

---

## 3.7 Get New Access Token

### `POST /auth/get-new-access-token`

Generates new authentication tokens using the Refresh Token.

**Authentication:** Refresh Token

### Request Body

```json
{
  "refreshToken": "<refreshToken>"
}
```

### Behavior

- Validates the Refresh Token.
- Generates a new Access Token.
- Rotates the Refresh Token.

### Success

```text
200 OK
```

---

## 3.8 Logout

### `POST /auth/logout`

Logs out the currently authenticated user.

**Authentication:** Required

### Success

```text
200 OK
```

### Behavior

Invalidates the stored Refresh Token.

---

# 4. User APIs

## 4.1 Get Current User

### `GET /users/me`

Returns the profile of the authenticated user.

**Authentication:** Required

**Roles:** All roles

- `STUDENT`
- `TEACHER`
- `ADMIN`

### Success

```text
200 OK
```

---

## 4.2 Update Student Profile

### `PATCH /users/student/profile`

Updates the authenticated student's profile.

**Authentication:** Required

**Role:** `STUDENT`

### Supported Fields

The accepted fields are defined by `UpdateStudentProfileDto`.

Possible fields include:

- Name
- Password
- Avatar
- Phone number
- Address
- Educational stage

### Success

```text
200 OK
```

---

# 5. Admin APIs

All endpoints under `/admin` require:

```http
Authorization: Bearer <accessToken>
```

**Required role:** `ADMIN`

The controller applies:

```text
JwtAuthGuard
RolesGuard
Roles(UserRole.ADMIN)
```

Therefore, only authenticated administrators can access these endpoints.

---

# 6. Admin — Student Management

## 6.1 Get All Students

### `GET /admin/students`

Returns all registered students.

**Authentication:** Required

**Role:** `ADMIN`

### Behavior

The response:

- Retrieves users with the `STUDENT` role only.
- Excludes sensitive authentication fields.
- Populates the student's educational stage.
- Populates the student's subscribed months.
- Sorts students by creation date in descending order.

### Excluded Fields

The following fields are excluded from the response:

```text
password
hashedRefreshToken
emailOtp
emailOtpExpiresAt
emailOtpLastSentAt
```

### Populated Stage Fields

```text
title
```

### Populated Subscription Fields

```text
title
description
price
order
```

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم جلب بيانات الطلاب بنجاح",
  "students": []
}
```

---

## 6.2 Get Student by Student ID

### `GET /admin/students/:studentId`

Retrieves a specific student using the generated `studentId`.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Behavior

- Searches only users with the `STUDENT` role.
- Excludes sensitive authentication fields.
- Populates the student's stage.
- Populates the student's subscribed months.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم جلب بيانات الطالب بنجاح",
  "student": {}
}
```

### Errors

```text
404 Not Found
الطالب غير موجود
```

---

## 6.3 Update Student Data

### `PATCH /admin/students/:studentId`

Updates a student's account information.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Request Body

The accepted fields are defined by `UpdateStudentDto`.

Example:

```json
{
  "name": "Ahmed Mohamed",
  "phoneNumber": "01000000000",
  "address": "Damanhur",
  "stage": "STAGE_ID",
  "password": "newPassword123"
}
```

### Behavior

#### Educational Stage

If a stage is provided:

1. Validates the MongoDB ObjectId.
2. Checks that the educational stage exists.
3. Converts the stage ID into a MongoDB ObjectId.
4. Updates the student's stage.

#### Password

If a password is provided, it is hashed using bcrypt before being stored.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم تحديث بيانات الطالب بنجاح",
  "student": {}
}
```

### Errors

```text
400 Bad Request
معرف المرحلة الدراسية غير صالح
```

```text
404 Not Found
الطالب غير موجود
```

```text
404 Not Found
المرحلة الدراسية غير موجودة
```

---

## 6.4 Update Student Status

### `PATCH /admin/students/:studentId/status`

Updates the status of a student's account.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Request Body

The accepted status is defined by `UpdateStudentStatusDto`.

Example:

```json
{
  "status": "SUSPENDED"
}
```

### Behavior

Updates the student's account status.

The available values depend on the `UserStatus` enum used by the backend.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم تحديث حالة حساب الطالب بنجاح",
  "student": {}
}
```

### Errors

```text
404 Not Found
الطالب غير موجود
```

---

# 7. Admin — Student Subscriptions

## 7.1 Get Student's Subscribed Months

### `GET /admin/students/:studentId/subscribed-months`

Returns the months subscribed to by a specific student.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Returned Student Fields

```text
studentId
name
subscribedMonths
```

### Populated Month Fields

```text
title
description
price
stage
order
```

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم جلب الأشهر المشترك بها الطالب بنجاح",
  "student": {
    "studentId": "STUDENT_ID",
    "name": "Ahmed Ali",
    "subscribedMonths": []
  }
}
```

### Errors

```text
404 Not Found
الطالب غير موجود
```

---

## 7.2 Add a Month to Student Subscriptions

### `POST /admin/students/:studentId/subscribed-months`

Adds a month to the student's subscriptions.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Request Body

```json
{
  "monthId": "MONTH_OBJECT_ID"
}
```

### Validation and Behavior

The backend checks the following:

1. The month ID is a valid MongoDB ObjectId.
2. The student exists and has the `STUDENT` role.
3. The student is associated with an educational stage.
4. The month exists.
5. The month belongs to the same educational stage as the student.
6. The student is not already subscribed to the month.

The month is added using `$addToSet`.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم إضافة الشهر إلى اشتراكات الطالب بنجاح",
  "student": {}
}
```

### Errors

```text
400 Bad Request
معرف الشهر غير صالح
```

```text
400 Bad Request
الطالب غير مرتبط بمرحلة دراسية
```

```text
400 Bad Request
لا يمكن إضافة شهر من مرحلة دراسية مختلفة عن مرحلة الطالب
```

```text
404 Not Found
الطالب غير موجود
```

```text
404 Not Found
الشهر غير موجود
```

```text
409 Conflict
الطالب مشترك بالفعل في هذا الشهر
```

---

## 7.3 Remove a Month from Student Subscriptions

### `DELETE /admin/students/:studentId/subscribed-months`

Removes a month from the student's subscriptions.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Request Body

```json
{
  "monthId": "MONTH_OBJECT_ID"
}
```

### Validation and Behavior

The backend checks the following:

1. The month ID is a valid MongoDB ObjectId.
2. The student exists and has the `STUDENT` role.
3. The month is included in the student's subscriptions.

The month is removed using `$pull`.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم حذف الشهر من اشتراكات الطالب بنجاح",
  "student": {}
}
```

### Errors

```text
400 Bad Request
معرف الشهر غير صالح
```

```text
404 Not Found
الطالب غير موجود
```

```text
404 Not Found
هذا الشهر غير موجود ضمن اشتراكات الطالب
```

---

## 7.4 Subscription Data Structure

The student's `subscribedMonths` field contains references to the `Month` documents.

Example:

```json
{
  "subscribedMonths": ["MONTH_OBJECT_ID_1", "MONTH_OBJECT_ID_2"]
}
```

When returned through the Admin APIs, the month references are populated with selected month information.

---

# 8. Admin — Delete Student

## 8.1 Delete Student Account

### `DELETE /admin/students/:studentId`

Deletes a student account.

**Authentication:** Required

**Role:** `ADMIN`

### Path Parameter

```text
studentId = Student's generated ID
```

### Behavior

- Searches for the student using `studentId`.
- Ensures the account belongs to the `STUDENT` role.
- Deletes the student's user document.

### Success

```text
200 OK
```

### Response Structure

```json
{
  "message": "تم حذف حساب الطالب بنجاح"
}
```

### Errors

```text
404 Not Found
الطالب غير موجود
```

---

# 9. Educational Content

Educational content is organized as follows:

```text
Educational Stage
    └── Month
        ├── Lesson
        └── Exam
```

The platform contains 12 educational stages:

- 3 General Middle School stages
- 3 Azhar Middle School stages
- 3 General Secondary School stages
- 3 Azhar Secondary School stages

---

# 10. Educational Stages APIs

## 10.1 Get All Stages

### `GET /educational-content/stages`

**Authentication:** Public

Returns all educational stages ordered by the `order` field.

---

## 10.2 Get Stage by ID

### `GET /educational-content/stages/:id`

**Authentication:** Public

Returns one educational stage.

### Errors

```text
404 Not Found
المرحلة الدراسية غير موجودة
```

---

## 10.3 Create Stage

### `POST /educational-content/stages`

**Authentication:** Required

**Role:** `TEACHER`

Creates a new educational stage.

---

## 10.4 Update Stage

### `PATCH /educational-content/stages/:id`

**Authentication:** Required

**Role:** `TEACHER`

Updates an educational stage.

---

## 10.5 Delete Stage

### `DELETE /educational-content/stages/:id`

**Authentication:** Required

**Role:** `TEACHER`

Deletes a stage and its related months, lessons, and exams.

---

## 10.6 Reorder Stages

### `PATCH /educational-content/stages/reorder`

**Authentication:** Required

**Role:** `TEACHER`

Updates the order of educational stages.

---

# 11. Educational Months APIs

## 11.1 Get Months by Stage

### `GET /educational-content/months/stage/:stageId`

**Authentication:** Optional

Returns the months belonging to a specific stage.

The response can contain the `locked` property based on the authenticated user's access.

---

## 11.2 Get Month by ID

### `GET /educational-content/months/:id`

**Authentication:** Optional

Returns one month.

---

## 11.3 Create Month

### `POST /educational-content/months`

**Authentication:** Required

**Role:** `TEACHER`

Creates a month.

---

## 11.4 Update Month

### `PATCH /educational-content/months/:id`

**Authentication:** Required

**Role:** `TEACHER`

Updates a month.

---

## 11.5 Delete Month

### `DELETE /educational-content/months/:id`

**Authentication:** Required

**Role:** `TEACHER`

Deletes the month and its related lessons and exams.

---

## 11.6 Reorder Months

### `PATCH /educational-content/months/reorder`

**Authentication:** Required

**Role:** `TEACHER`

Updates the order of months.

---

# 12. Lessons APIs

## 12.1 Get Lessons by Month

### `GET /educational-content/lessons/month/:monthId`

**Authentication:** Optional

Returns lessons belonging to a month.

Locked content returns public information with:

```json
{
  "locked": true
}
```

---

## 12.2 Get Lesson by ID

### `GET /educational-content/lessons/:id`

**Authentication:** Optional

Returns one lesson.

---

## 12.3 Create Lesson

### `POST /educational-content/lessons`

**Authentication:** Required

**Role:** `TEACHER`

Creates a lesson.

Lessons and exams share the same `order` sequence within a month.

---

## 12.4 Update Lesson

### `PATCH /educational-content/lessons/:id`

**Authentication:** Required

**Role:** `TEACHER`

Updates a lesson.

---

## 12.5 Delete Lesson

### `DELETE /educational-content/lessons/:id`

**Authentication:** Required

**Role:** `TEACHER`

Deletes a lesson.

---

# 13. Exams APIs

## 13.1 Get Exams by Month

### `GET /educational-content/exams/month/:monthId`

**Authentication:** Optional

Returns exams belonging to a month.

---

## 13.2 Get Exam by ID

### `GET /educational-content/exams/:id`

**Authentication:** Optional

Returns one exam.

---

## 13.3 Create Exam

### `POST /educational-content/exams`

**Authentication:** Required

**Role:** `TEACHER`

Creates an exam.

---

## 13.4 Update Exam

### `PATCH /educational-content/exams/:id`

**Authentication:** Required

**Role:** `TEACHER`

Updates an exam.

---

## 13.5 Delete Exam

### `DELETE /educational-content/exams/:id`

**Authentication:** Required

**Role:** `TEACHER`

Deletes an exam.

---

# 14. Combined Month Content

## 14.1 Get Month Content

### `GET /educational-content/content/month/:monthId`

**Authentication:** Optional

Returns the lessons and exams of a month in a combined list.

The items are sorted by the shared `order` field.

---

## 14.2 Reorder Month Content

### `PATCH /educational-content/content/reorder`

**Authentication:** Required

**Role:** `TEACHER`

Reorders lessons and exams together.

The submitted content must belong to the same month.

---

# 15. Educational Statistics

## `GET /educational-content/stats`

**Authentication:** Required

**Role:** `TEACHER`

Returns statistics about the educational content, such as:

- Number of stages
- Number of months
- Number of lessons
- Number of exams

---

# 16. Progress APIs

All Progress APIs require:

**Authentication:** Required

**Role:** `STUDENT`

---

## 16.1 Update Lesson Progress

### `PATCH /progress/lessons/:lessonId`

Updates the student's progress for a lesson.

### Request Body

```json
{
  "type": "VIDEO"
}
```

Supported types:

```text
VIDEO
EXPLANATION
BOOK
```

### Progress Types

| Type          | Behavior                         | Points |
| ------------- | -------------------------------- | -----: |
| `VIDEO`       | Marks video as completed         |     10 |
| `EXPLANATION` | Marks explanation as completed   |     10 |
| `BOOK`        | Marks required book as completed |      0 |

### Success

```text
200 OK
```

---

## 16.2 Get Lesson Progress

### `GET /progress/lessons/:lessonId`

Returns the student's progress for a lesson.

If no progress record exists, default progress data is returned.

---

## 16.3 Submit Homework

### `POST /progress/lessons/:lessonId/homework`

Submits homework answers.

### Request Body

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

Each array represents the selected options for one question.

### Scoring

- Each completely correct question receives one point.
- The submitted answer set must exactly match the correct answer set.
- The best homework score is retained.
- Homework is marked as submitted even if the score is zero.

---

## 16.4 Get Exam Progress

### `GET /progress/exams/:examId`

Returns the student's progress for an exam.

---

## 16.5 Submit Exam

### `POST /progress/exams/:examId/submit`

Submits exam answers.

### Request Body

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

### Response Data

The response contains:

- Number of correct answers
- Total questions
- Points
- Bonus points
- Total points
- Percentage
- Passed status
- Best points

### Passing Rule

The exam is passed when:

```text
percentage >= exam.passPercentage
```

A perfect exam receives the configured bonus points.

---

## 16.6 Get Month Progress

### `GET /progress/months/:monthId`

Returns the student's complete progress for a month.

The response contains:

- Lessons progress
- Exams progress
- Total points
- Lesson points
- Exam points
- Total lessons
- Completed lessons
- Total exams
- Completed exams

---

# 17. Lesson Completion Rules

A lesson is marked as completed when all required components are completed:

```text
Video
AND
Explanation
AND
Homework (if available)
AND
Book (if required)
```

For lessons without homework:

```text
homeworkCompleted = true
```

For lessons without a required book:

```text
bookCompleted = true
```

---

# 18. Roles and Permissions

| Feature                           | Guest | Student | Teacher | Admin |
| --------------------------------- | ----: | ------: | ------: | ----: |
| View public stages                |     ✓ |       ✓ |       ✓ |     ✓ |
| View public educational structure |     ✓ |       ✓ |       ✓ |     ✓ |
| View subscribed months            |     — |       ✓ |       ✓ |     ✓ |
| Access all educational months     |     — |       — |       ✓ |     ✓ |
| Manage educational content        |     — |       — |       ✓ |     — |
| View educational statistics       |     — |       — |       ✓ |     — |
| View own profile                  |     — |       ✓ |       ✓ |     ✓ |
| Update student profile            |     — |       ✓ |       — |     — |
| Manage students                   |     — |       — |       — |     ✓ |
| Update student status             |     — |       — |       — |     ✓ |
| Manage student subscriptions      |     — |       — |       — |     ✓ |
| Delete student account            |     — |       — |       — |     ✓ |
| View own progress                 |     — |       ✓ |       — |     — |
| Submit homework                   |     — |       ✓ |       — |     — |
| Submit exams                      |     — |       ✓ |       — |     — |

---

# 19. Authentication and Authorization Summary

| Endpoint Group                 | Authentication      | Required Role |
| ------------------------------ | ------------------- | ------------- |
| `/auth/*`                      | Depends on endpoint | —             |
| `GET /users/me`                | Required            | Any           |
| `PATCH /users/student/profile` | Required            | STUDENT       |
| `/admin/*`                     | Required            | ADMIN         |
| Educational GET endpoints      | Optional/Public     | —             |
| Educational content management | Required            | TEACHER       |
| `/progress/*`                  | Required            | STUDENT       |

---

# 20. HTTP Status Codes

| Status Code        | Meaning                               |
| ------------------ | ------------------------------------- |
| `200 OK`           | Request completed successfully        |
| `201 Created`      | Resource created successfully         |
| `400 Bad Request`  | Invalid request data                  |
| `401 Unauthorized` | Missing or invalid authentication     |
| `403 Forbidden`    | User does not have the required role  |
| `404 Not Found`    | Requested resource does not exist     |
| `409 Conflict`     | Resource conflicts with existing data |

---

# 21. Frontend Integration Rules

## Authentication

Use the Access Token in the Authorization header:

```http
Authorization: Bearer <accessToken>
```

## Refresh Token Flow

When the Access Token expires:

1. Send the Refresh Token to:

   ```http
   POST /auth/get-new-access-token
   ```

2. Receive the new tokens.

3. Replace the old Access Token and Refresh Token.

4. Retry the original request.

## Admin Student Identification

Admin student-management endpoints use the generated `studentId`, not the student's MongoDB `_id`.

Example:

```text
/admin/students/STUDENT_ID
```

## Subscription Management

When adding or removing a month, send the MongoDB ID of the month:

```json
{
  "monthId": "MONTH_OBJECT_ID"
}
```

## Locked Educational Content

The frontend must use the `locked` property returned by the backend.

Do not expose restricted lesson or exam data on the client side.

## Progress APIs

Progress endpoints determine the student from the authenticated JWT.

The frontend does not send a student ID when retrieving or updating progress.

---

# 22. Complete Endpoint Summary

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

## Admin — Students

```text
GET    /admin/students
GET    /admin/students/:studentId
PATCH  /admin/students/:studentId
PATCH  /admin/students/:studentId/status
DELETE /admin/students/:studentId
```

## Admin — Subscriptions

```text
GET    /admin/students/:studentId/subscribed-months
POST   /admin/students/:studentId/subscribed-months
DELETE /admin/students/:studentId/subscribed-months
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

## Educational Months

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

## Progress

```text
PATCH  /progress/lessons/:lessonId
GET    /progress/lessons/:lessonId
POST   /progress/lessons/:lessonId/homework

GET    /progress/exams/:examId
POST   /progress/exams/:examId/submit

GET    /progress/months/:monthId
```

---

# 23. Important Contract Rules

- All MongoDB IDs must be valid ObjectIds when required.
- New accounts are created with the `STUDENT` role.
- Access Tokens use the Bearer authentication scheme.
- Refresh Tokens are sent in the request body of the refresh endpoint.
- Refresh Tokens are rotated after successful token renewal.
- Logout invalidates the stored Refresh Token.
- Admin endpoints require the `ADMIN` role.
- Teacher content-management endpoints require the `TEACHER` role.
- Progress endpoints require the `STUDENT` role.
- Student-management endpoints use the generated `studentId`.
- Student subscriptions reference `Month` document IDs.
- A student can only be subscribed to months belonging to their educational stage.
- Duplicate subscriptions are rejected.
- Deleting a stage also deletes its related months, lessons, and exams.
- Deleting a month also deletes its related lessons and exams.
- Lessons and exams share the same order sequence within a month.
- Homework and exam answer arrays must match the number of questions.
- Homework questions are scored only when the complete answer set is correct.
- The best homework score is retained.
- The best exam total score is retained.
- Lesson completion depends on all required lesson components.
- Exam passing depends on the configured `passPercentage`.
- The frontend must not expose locked educational content.
