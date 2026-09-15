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

Used with:

```http
POST /auth/get-new-access-token
```

The Refresh Token is sent in the request body.

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

Refresh Token required.

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

The stored Refresh Token is invalidated.

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

### Request Body

The request accepts the fields defined by `UpdateStudentProfileDto`.

The password, when provided, is hashed before being stored.

### Success

**200 OK**

Returns the updated student profile.

---

# 5. Educational Content

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

If `order` is not provided, an order is automatically assigned.

---

## 6.4 Update Educational Stage

### `PATCH /educational-content/stages/:id`

Updates an educational stage.

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

- Its months
- Lessons belonging to those months
- Exams belonging to those months

### Success

**200 OK**

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

### Behavior

Each month contains a `locked` field.

A month is accessible when:

- The user is a `TEACHER` or `ADMIN`, or
- The month exists in the student's `subscribedMonths`.

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

The response contains the `locked` field.

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

- Lessons belonging to the month
- Exams belonging to the month

### Success

**200 OK**

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

If the month is locked, only public lesson information is returned with:

```json
{
  "locked": true
}
```

### Success

**200 OK**

---

## 8.2 Get One Lesson

### `GET /educational-content/lessons/:id`

Returns one lesson.

### Authentication

Optional.

### Behavior

Locked lessons return only public lesson information and:

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

If `order` is not provided, the lesson is placed after the last lesson or exam in the same month.

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

---

# 9. Exams

## 9.1 Get All Exams of a Month

### `GET /educational-content/exams/month/:monthId`

Returns all exams belonging to a month.

### Authentication

Optional.

### Behavior

If the month is unlocked, the complete exam data is returned.

If the month is locked, only public exam information is returned with:

```json
{
  "locked": true
}
```

### Success

**200 OK**

---

## 9.2 Get One Exam

### `GET /educational-content/exams/:id`

Returns one exam.

### Authentication

Optional.

### Behavior

Locked exams return only public exam information and:

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

If `order` is not provided, the exam is placed after the last lesson or exam in the same month.

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

---

# 10. Combined Month Content

## 10.1 Get All Content of a Month

### `GET /educational-content/content/month/:monthId`

Returns all lessons and exams belonging to a month.

### Authentication

Optional.

Lessons and exams are combined and sorted by their shared `order` field.

### Unlocked Month

```json
{
  "locked": false,
  "items": []
}
```

### Locked Month

```json
{
  "locked": true,
  "items": []
}
```

Locked items contain only their public information.

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

### Success

**200 OK**

### Errors

- `400 Bad Request` — invalid ordering or content from different months
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

### Response

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

# 12. Progress APIs

All Progress APIs are restricted to authenticated students.

### Authentication

Required.

```http
Authorization: Bearer <accessToken>
```

### Role

`STUDENT` only.

---

# 13. Lesson Progress

## 13.1 Update Lesson Progress

### `PATCH /progress/lessons/:lessonId`

Updates the student's progress for a lesson.

### Authentication

Required.

### Role

`STUDENT`

### Path Parameter

```text
lessonId = Lesson ID
```

### Request Body

```json
{
  "type": "VIDEO"
}
```

The `type` determines which lesson component is completed.

Supported progress types include:

- `VIDEO`
- `EXPLANATION`
- `BOOK`

### Behavior

#### Video

When completed:

```text
videoCompleted = true
videoPoints = 10
```

#### Explanation

When completed:

```text
explanationCompleted = true
explanationPoints = 10
```

#### Book

The lesson must contain a required book note.

When completed:

```text
bookCompleted = true
```

### Success

**200 OK**

Returns the updated lesson progress.

---

## 13.2 Get Lesson Progress

### `GET /progress/lessons/:lessonId`

Returns the current student's progress for a lesson.

### Authentication

Required.

### Role

`STUDENT`

### Success

**200 OK**

If no progress record exists yet, the API returns default progress values.

Example:

```json
{
  "data": {
    "lesson": "LESSON_ID",
    "videoCompleted": false,
    "explanationCompleted": false,
    "homeworkCompleted": false,
    "bookCompleted": false,
    "videoPoints": 0,
    "explanationPoints": 0,
    "homeworkPoints": 0,
    "totalPoints": 0,
    "completed": false
  }
}
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

# 14. Homework

## 14.1 Submit Homework

### `POST /progress/lessons/:lessonId/homework`

Submits answers for the homework belonging to a lesson.

### Authentication

Required.

### Role

`STUDENT`

### Path Parameter

```text
lessonId = Lesson ID
```

### Request Body

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

Each item represents the selected answers for the corresponding question.

Multiple answers can be submitted for a question.

### Validation

The number of submitted answers must exactly match the number of homework questions.

### Scoring

A question receives one point only when the submitted answer set exactly matches the correct answer set.

For example:

```text
Correct:   [1, 2]
Submitted: [1, 2]
Result:    1 point
```

```text
Correct:   [1, 2]
Submitted: [1]
Result:    0 points
```

The student's best homework score is retained.

### Success

**200 OK**

Example response structure:

```json
{
  "message": "تم تسليم الواجب بنجاح",
  "data": {
    "correctAnswers": 5,
    "totalQuestions": 10,
    "points": 5,
    "bestPoints": 5,
    "totalPoints": 25,
    "completed": true
  }
}
```

---

# 15. Exam Progress

## 15.1 Get Exam Progress

### `GET /progress/exams/:examId`

Returns the current student's progress for an exam.

### Authentication

Required.

### Role

`STUDENT`

### Success

**200 OK**

If the student has not submitted the exam yet, default progress is returned.

Example:

```json
{
  "data": {
    "exam": "EXAM_ID",
    "correctAnswers": 0,
    "totalQuestions": 10,
    "points": 0,
    "bonusPoints": 0,
    "totalPoints": 0,
    "passed": false
  }
}
```

---

## 15.2 Submit Exam

### `POST /progress/exams/:examId/submit`

Submits answers for an exam.

### Authentication

Required.

### Role

`STUDENT`

### Request Body

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

Each item represents the selected answers for the corresponding question.

Multiple answers can be submitted for a question.

### Validation

The number of submitted answers must exactly match the number of exam questions.

### Scoring

Each completely correct question receives one point.

The API also calculates:

- `points`
- `bonusPoints`
- `totalPoints`
- `percentage`
- `passed`

A perfect exam receives the configured bonus points.

The student's best total exam score is retained.

### Passing

The exam is considered passed when:

```text
percentage >= exam.passPercentage
```

### Success

**200 OK**

Example response structure:

```json
{
  "message": "تم تسليم الاختبار بنجاح",
  "data": {
    "correctAnswers": 8,
    "totalQuestions": 10,
    "points": 8,
    "bonusPoints": 0,
    "totalPoints": 8,
    "percentage": 80,
    "passed": true,
    "bestPoints": 8
  }
}
```

---

# 16. Month Progress

## `GET /progress/months/:monthId`

Returns the complete progress of the current student for a month.

### Authentication

Required.

### Role

`STUDENT`

### Response Structure

The response contains:

- Month ID
- Lessons progress
- Exams progress
- Overall summary

### Lesson Progress

Each lesson contains:

```json
{
  "lesson": "LESSON_ID",
  "title": "Lesson title",
  "order": 1,
  "videoCompleted": true,
  "explanationCompleted": true,
  "homeworkCompleted": true,
  "bookCompleted": true,
  "videoPoints": 10,
  "explanationPoints": 10,
  "homeworkPoints": 5,
  "totalPoints": 25,
  "completed": true
}
```

### Exam Progress

Each exam contains:

```json
{
  "exam": "EXAM_ID",
  "title": "Exam title",
  "order": 2,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "points": 8,
  "bonusPoints": 0,
  "totalPoints": 8,
  "passed": true
}
```

### Summary

```json
{
  "summary": {
    "totalPoints": 33,
    "lessonPoints": 25,
    "examPoints": 8,
    "totalLessons": 5,
    "completedLessons": 4,
    "totalExams": 2,
    "completedExams": 1
  }
}
```

---

# 17. Progress Scoring

## Lesson Points

The current lesson scoring system is:

| Activity    |                 Points |
| ----------- | ---------------------: |
| Video       |                     10 |
| Explanation |                     10 |
| Homework    | 1 per correct question |
| Book        | Completion requirement |

The lesson's `totalPoints` is calculated as:

```text
videoPoints
+ explanationPoints
+ homeworkPoints
```

Book completion is a completion requirement and does not directly add points to `totalPoints`.

---

## Lesson Completion

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

Therefore:

### Lesson without homework

Homework is automatically considered completed.

### Lesson without a required book

Book completion is automatically considered completed.

---

## Exam Points

Exam scoring is based on the number of completely correct questions.

The API calculates:

```text
points
bonusPoints
totalPoints
percentage
passed
```

The exact bonus behavior is determined by the backend exam-progress logic.

---

# 18. Progress Data Flow

The frontend can use the Progress APIs as follows:

```text
Student opens Lesson
        ↓
GET /progress/lessons/:lessonId
        ↓
Display current progress
        ↓
Student completes video
        ↓
PATCH /progress/lessons/:lessonId
        ↓
Student reads explanation
        ↓
PATCH /progress/lessons/:lessonId
        ↓
Student completes book if required
        ↓
PATCH /progress/lessons/:lessonId
        ↓
Student submits homework
        ↓
POST /progress/lessons/:lessonId/homework
        ↓
Lesson becomes completed when all required items are completed
```

For exams:

```text
Student opens Exam
        ↓
GET /progress/exams/:examId
        ↓
Display previous/best progress
        ↓
Student submits answers
        ↓
POST /progress/exams/:examId/submit
        ↓
Calculate score
        ↓
Determine passed status
```

---

# 19. Roles & Access Summary

| Resource                       | Guest | Student | Teacher | Admin |
| ------------------------------ | ----: | ------: | ------: | ----: |
| Public stages                  |     ✓ |       ✓ |       ✓ |     ✓ |
| Public educational structure   |     ✓ |       ✓ |       ✓ |     ✓ |
| Subscribed months              |     — |       ✓ |       ✓ |     ✓ |
| All educational months         |     — |       — |       ✓ |     ✓ |
| Educational content management |     — |       — |       ✓ |     — |
| Educational statistics         |     — |       — |       ✓ |     — |
| Student profile                |     — |       ✓ |       — |     — |
| Student progress               |     — |       ✓ |       — |     — |
| Lesson progress submission     |     — |       ✓ |       — |     — |
| Homework submission            |     — |       ✓ |       — |     — |
| Exam submission                |     — |       ✓ |       — |     — |

---

# 20. Authentication & Authorization Summary

| Endpoint                                          | Authentication | Role    |
| ------------------------------------------------- | -------------- | ------- |
| `POST /auth/signup`                               | Public         | —       |
| `POST /auth/resend-otp`                           | Public         | —       |
| `POST /auth/verify-account`                       | Public         | —       |
| `POST /auth/login`                                | Public         | —       |
| `POST /auth/forget-password`                      | Public         | —       |
| `POST /auth/reset-password`                       | Public         | —       |
| `POST /auth/get-new-access-token`                 | Refresh Token  | —       |
| `POST /auth/logout`                               | Required       | Any     |
| `GET /users/me`                                   | Required       | Any     |
| `PATCH /users/student/profile`                    | Required       | STUDENT |
| `GET /educational-content/stages`                 | Public         | —       |
| `GET /educational-content/stages/:id`             | Public         | —       |
| `POST /educational-content/stages`                | Required       | TEACHER |
| `PATCH /educational-content/stages/:id`           | Required       | TEACHER |
| `DELETE /educational-content/stages/:id`          | Required       | TEACHER |
| `PATCH /educational-content/stages/reorder`       | Required       | TEACHER |
| `GET /educational-content/months/stage/:stageId`  | Optional       | —       |
| `GET /educational-content/months/:id`             | Optional       | —       |
| `POST /educational-content/months`                | Required       | TEACHER |
| `PATCH /educational-content/months/:id`           | Required       | TEACHER |
| `DELETE /educational-content/months/:id`          | Required       | TEACHER |
| `PATCH /educational-content/months/reorder`       | Required       | TEACHER |
| `GET /educational-content/lessons/month/:monthId` | Optional       | —       |
| `GET /educational-content/lessons/:id`            | Optional       | —       |
| `POST /educational-content/lessons`               | Required       | TEACHER |
| `PATCH /educational-content/lessons/:id`          | Required       | TEACHER |
| `DELETE /educational-content/lessons/:id`         | Required       | TEACHER |
| `GET /educational-content/exams/month/:monthId`   | Optional       | —       |
| `GET /educational-content/exams/:id`              | Optional       | —       |
| `POST /educational-content/exams`                 | Required       | TEACHER |
| `PATCH /educational-content/exams/:id`            | Required       | TEACHER |
| `DELETE /educational-content/exams/:id`           | Required       | TEACHER |
| `GET /educational-content/content/month/:monthId` | Optional       | —       |
| `PATCH /educational-content/content/reorder`      | Required       | TEACHER |
| `GET /educational-content/stats`                  | Required       | TEACHER |
| `PATCH /progress/lessons/:lessonId`               | Required       | STUDENT |
| `GET /progress/lessons/:lessonId`                 | Required       | STUDENT |
| `POST /progress/lessons/:lessonId/homework`       | Required       | STUDENT |
| `GET /progress/exams/:examId`                     | Required       | STUDENT |
| `POST /progress/exams/:examId/submit`             | Required       | STUDENT |
| `GET /progress/months/:monthId`                   | Required       | STUDENT |

---

# 21. HTTP Status Codes

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

# 22. Frontend Integration Rules

### Authentication

Send the Access Token using:

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

When the user is logged in, send the Access Token so the backend can determine the user's educational-content access.

### Locked Content

The frontend should rely on the backend `locked` property.

Do not attempt to reconstruct or expose locked lesson/exam content on the client side.

### Progress

Progress APIs are student-specific.

The frontend does not send a student ID.

The backend determines the student from the authenticated user's JWT.

---

# 23. Endpoint Summary

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

# 24. Important Contract Rules

- All IDs are MongoDB ObjectIds.
- New accounts are created as `STUDENT`.
- Access Tokens are sent using the Bearer authentication scheme.
- Refresh Tokens are sent in the refresh endpoint request body.
- Refresh Tokens are rotated when a new Access Token is generated.
- Logout invalidates the stored Refresh Token.
- Student profile updates are restricted to `STUDENT`.
- Educational content management is restricted to `TEACHER`.
- Teachers and admins have access to all educational months.
- Students can access subscribed months.
- Educational GET endpoints can use optional authentication.
- Guests can access public educational structure but receive locked content.
- Locked lessons and exams expose only their public metadata.
- Lessons and exams share the same `order` sequence inside a month.
- Combined month content is sorted using the shared `order` field.
- Deleting a stage also deletes its months, lessons, and exams.
- Deleting a month also deletes its lessons and exams.
- Progress APIs determine the student from the authenticated JWT.
- Students cannot submit or retrieve another student's progress through these APIs.
- Homework answers must contain the same number of answer groups as homework questions.
- Exam answers must contain the same number of answer groups as exam questions.
- A homework question receives one point only when its complete answer set is correct.
- Lesson completion depends on completing all required lesson components.
- Exam passing depends on the configured `passPercentage`.
- The backend retains the student's best homework and exam scores.
