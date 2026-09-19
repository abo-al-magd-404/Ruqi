# RUQI Platform - Backend

Backend API for **RUQI (رُقي)**, an Arabic educational platform designed for students in General and Al-Azhar education systems.

The platform provides educational content management, student progress tracking, homework and exam submissions, student management, and public leaderboards.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [API Base URL](#api-base-url)
- [API Modules](#api-modules)
  - [1. Authentication](#1-authentication)
  - [2. Users](#2-users)
  - [3. Educational Content](#3-educational-content)
  - [4. Progress](#4-progress)
  - [5. Admin](#5-admin)
  - [6. Leaderboard](#6-leaderboard)
- [Authorization and Roles](#authorization-and-roles)
- [Progress and Scoring System](#progress-and-scoring-system)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Development Notes](#development-notes)

---

## Overview

RUQI is an educational platform for Arabic language students.

The platform supports:

- General Preparatory Education.
- Al-Azhar Preparatory Education.
- General Secondary Education.
- Al-Azhar Secondary Education.

Educational content is organized into:

```text
Educational Stage
    └── Months
          └── Lessons and Exams
```

Students can watch lesson videos, read explanations, complete homework, study required book content, and submit exams.

---

## Features

- User registration and authentication.
- Email OTP verification.
- Password reset through OTP.
- Access and refresh token authentication.
- Student profile management.
- Educational stage management.
- Month management.
- Lesson management.
- Exam management.
- Content ordering and reordering.
- Student subscription management by administrators.
- Lesson progress tracking.
- Homework submission and scoring.
- Exam submission and scoring.
- Monthly progress summaries.
- Public overall leaderboard.
- Public leaderboard by educational stage.
- Role-based access control.
- Arabic response and error messages.

---

## Technology Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **MongoDB**
- **Mongoose**
- **JWT Authentication**
- **Passport**
- **bcrypt**
- **Nodemailer**
- **Docker**

---

## Project Structure

The backend is organized into feature-based modules.

```text
src/
├── auth/
│   ├── signup/
│   ├── resend-otp/
│   ├── verify-account/
│   ├── login/
│   ├── forget-password/
│   ├── reset-password/
│   ├── get-new-access-token/
│   └── logout/
│
├── users/
│
├── educational-content/
│
├── progress/
│
├── admin/
│
├── leaderboard/
│
├── common/
│   ├── decorators/
│   ├── enums/
│   ├── guards/
│   ├── interfaces/
│   ├── pipes/
│   └── services/
│
└── schemas/
```

---

## Authentication

The API uses JWT-based authentication.

The access token is sent using the following HTTP header:

```http
Authorization: Bearer <access_token>
```

The refresh token is used to generate a new access token when the current access token expires.

Refresh tokens are hashed before being stored in the database.

---

## API Base URL

### Local Development

```text
http://localhost:8000
```

### Production

```text
https://app-6a995274.deploy.meerasolution.com
```

> Use the configured deployment URL for frontend API requests in production.

---

# API Modules

## 1. Authentication

**Base Route:**

```text
/auth
```

Authentication endpoints are available to users according to their account status.

### 1.1 Sign Up

Creates a new student account and sends an OTP to the provided email address.

```http
POST /auth/signup
```

**Authentication:** Public

**Request Body:**

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "password123",
  "stage": "STAGE_OBJECT_ID"
}
```

**Behavior:**

- Converts the email address to lowercase.
- Checks whether the email already exists.
- Validates the educational stage when provided.
- Hashes the password.
- Generates a unique student ID.
- Creates the account with `PENDING` status.
- Sends an email verification OTP.
- Removes the created user if sending the OTP email fails.

**Possible Account Statuses:**

- `PENDING`
- `ACTIVE`
- `SUSPENDED`

---

### 1.2 Resend OTP

Sends a new verification or password-reset OTP.

```http
POST /auth/resend-otp
```

**Authentication:** Public

**Request Body:**

```json
{
  "email": "student@example.com"
}
```

**Behavior:**

- Converts the email address to lowercase.
- Checks the user account.
- Rejects requests for already active accounts where applicable.
- Applies the configured OTP cooldown.
- Generates and sends a new OTP.

---

### 1.3 Verify Account

Verifies the email address using the received OTP.

```http
POST /auth/verify-account
```

**Authentication:** Public

**Request Body:**

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

**Behavior:**

- Validates the account.
- Checks OTP existence and expiration.
- Compares the submitted OTP.
- Changes the account status to `ACTIVE`.
- Clears the OTP-related fields.

---

### 1.4 Login

Authenticates an active user.

```http
POST /auth/login
```

**Authentication:** Public

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Behavior:**

- Validates email and password.
- Rejects pending accounts.
- Rejects suspended accounts.
- Generates access and refresh tokens.
- Hashes and stores the refresh token.

**Response Data Includes:**

- Basic user information.
- Access token.
- Refresh token.

---

### 1.5 Forget Password

Starts the password-reset process.

```http
POST /auth/forget-password
```

**Authentication:** Public

**Request Body:**

```json
{
  "email": "student@example.com"
}
```

**Behavior:**

- Validates the email.
- Applies OTP cooldown rules.
- Generates a password-reset OTP.
- Sends the OTP by email.

---

### 1.6 Reset Password

Resets the user's password using an OTP.

```http
POST /auth/reset-password
```

**Authentication:** Public

**Request Body:**

```json
{
  "email": "student@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**Behavior:**

- Validates the OTP.
- Hashes the new password.
- Clears OTP-related fields.
- Invalidates the stored refresh token.

---

### 1.7 Get New Access Token

Generates a new access token using a valid refresh token.

```http
POST /auth/get-new-access-token
```

**Authentication:** Public with a valid refresh token

**Request Body:**

```json
{
  "refreshToken": "REFRESH_TOKEN"
}
```

**Behavior:**

- Verifies the refresh token.
- Finds the associated user.
- Rejects suspended accounts.
- Compares the refresh token with the stored hash.
- Rotates the access and refresh tokens.
- Stores the new hashed refresh token.

---

### 1.8 Logout

Logs out the authenticated user.

```http
POST /auth/logout
```

**Authentication:** Required

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Behavior:**

- Clears the stored hashed refresh token.
- Invalidates the user's refresh-token session.

---

## 2. Users

**Base Route:**

```text
/users
```

---

### 2.1 Get Current User Profile

Returns the profile of the authenticated user.

```http
GET /users/me
```

**Authentication:** Required

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

Returns the user's profile without sensitive authentication fields such as:

- Password.
- Hashed refresh token.
- Email OTP.
- OTP expiration data.
- OTP cooldown data.

---

### 2.2 Update Student Profile

Updates the authenticated student's profile.

```http
PATCH /users/student/profile
```

**Authentication:** Required

**Role:** `STUDENT`

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request Body:**

The supported fields are defined by `UpdateStudentProfileDto`.

Possible profile fields include:

- Name.
- Password.
- Avatar.
- Phone number.
- Address.
- Educational stage, according to the DTO configuration.

**Behavior:**

- Validates the authenticated user.
- Hashes the password if it is included.
- Updates the student's profile.
- Excludes sensitive authentication fields from the response.

---

## 3. Educational Content

**Base Route:**

```text
/educational-content
```

Educational content endpoints are divided into:

- Public endpoints.
- Teacher-only endpoints.
- Public endpoints with optional authentication.

---

### 3.1 Educational Stages

#### Get All Educational Stages

```http
GET /educational-content/stages
```

**Authentication:** Public

Returns all educational stages sorted by their `order`.

---

#### Get Educational Stage by ID

```http
GET /educational-content/stages/:id
```

**Authentication:** Public

Returns a specific educational stage.

---

#### Create Educational Stage

```http
POST /educational-content/stages
```

**Authentication:** Required

**Role:** `TEACHER`

Creates a new educational stage.

The stage order defaults to the current number of stages when no order is provided.

---

#### Update Educational Stage

```http
PATCH /educational-content/stages/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Updates an educational stage.

---

#### Delete Educational Stage

```http
DELETE /educational-content/stages/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Deletes an educational stage and its related content.

**Cascade Deletion:**

- Related months.
- Related lessons.
- Related exams.

---

#### Reorder Educational Stages

```http
PATCH /educational-content/stages/reorder
```

**Authentication:** Required

**Role:** `TEACHER`

Updates the order of educational stages.

The reorder operation uses a bulk database update.

---

### 3.2 Months

#### Get Months by Stage

```http
GET /educational-content/months/stage/:stageId
```

**Authentication:** Public

Returns the months belonging to an educational stage.

Access information can affect whether a month is marked as locked.

---

#### Get Month by ID

```http
GET /educational-content/months/:id
```

**Authentication:** Public

Returns a specific month.

---

#### Create Month

```http
POST /educational-content/months
```

**Authentication:** Required

**Role:** `TEACHER`

Creates a month under an educational stage.

The month order defaults to the number of existing months in the selected stage when no order is provided.

---

#### Update Month

```http
PATCH /educational-content/months/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Updates a month.

---

#### Delete Month

```http
DELETE /educational-content/months/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Deletes a month and its related lessons and exams.

---

#### Reorder Months

```http
PATCH /educational-content/months/reorder
```

**Authentication:** Required

**Role:** `TEACHER`

Updates the order of months.

---

### 3.3 Lessons

#### Get Lessons by Month

```http
GET /educational-content/lessons/month/:monthId
```

**Authentication:** Public

Returns the lessons belonging to a month.

---

#### Get Lesson by ID

```http
GET /educational-content/lessons/:id
```

**Authentication:** Public

Returns a specific lesson.

The response can include locked-content behavior based on the authenticated user's access.

---

#### Create Lesson

```http
POST /educational-content/lessons
```

**Authentication:** Required

**Role:** `TEACHER`

Creates a lesson under a month.

The lesson receives a shared content order within the month.

---

#### Update Lesson

```http
PATCH /educational-content/lessons/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Updates a lesson.

---

#### Delete Lesson

```http
DELETE /educational-content/lessons/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Deletes a lesson.

---

### 3.4 Exams

#### Get Exams by Month

```http
GET /educational-content/exams/month/:monthId
```

**Authentication:** Public

Returns the exams belonging to a month.

---

#### Get Exam by ID

```http
GET /educational-content/exams/:id
```

**Authentication:** Public

Returns a specific exam.

---

#### Create Exam

```http
POST /educational-content/exams
```

**Authentication:** Required

**Role:** `TEACHER`

Creates an exam under a month.

The exam receives a shared content order within the month.

---

#### Update Exam

```http
PATCH /educational-content/exams/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Updates an exam.

---

#### Delete Exam

```http
DELETE /educational-content/exams/:id
```

**Authentication:** Required

**Role:** `TEACHER`

Deletes an exam.

---

### 3.5 Combined Monthly Content

#### Get All Content by Month

```http
GET /educational-content/content/month/:monthId
```

**Authentication:** Public

Returns the lessons and exams belonging to a month in a shared order.

The returned content is sorted using the `order` field.

Locked content is transformed to expose limited information.

---

#### Reorder Monthly Content

```http
PATCH /educational-content/content/reorder
```

**Authentication:** Required

**Role:** `TEACHER`

Reorders lessons and exams within a month.

**Validation Rules:**

- Content IDs must not be duplicated.
- Orders must not be duplicated.
- All content must exist.
- All content must belong to the same month.
- Lesson and exam orders are updated using a bulk operation.

---

### 3.6 Educational Content Statistics

```http
GET /educational-content/stats
```

**Authentication:** Required

**Role:** `TEACHER`

Returns content statistics, including:

- Total educational stages.
- Total months.
- Total lessons.
- Total exams.

---

### Access Control for Educational Content

The service determines month access according to the authenticated user.

| User Type | Access                      |
| --------- | --------------------------- |
| Guest     | No subscription access      |
| Student   | Access to subscribed months |
| Teacher   | Access to all months        |
| Admin     | Access to all months        |

When a user does not have access to a month, the API can return locked content with limited fields.

---

## 4. Progress

**Base Route:**

```text
/progress
```

All progress endpoints require authentication and the `STUDENT` role.

**Required Headers:**

```http
Authorization: Bearer <access_token>
```

---

### 4.1 Update Lesson Progress

```http
PATCH /progress/lessons/:lessonId
```

**Authentication:** Required

**Role:** `STUDENT`

Updates the student's progress for a lesson.

Supported progress types include:

- `VIDEO`
- `EXPLANATION`
- `BOOK`

**Scoring:**

| Activity    |                       Points |
| ----------- | ---------------------------: |
| Video       |                           10 |
| Explanation |                           10 |
| Homework    | 1 point per correct question |
| Book        |           No separate points |

A progress record is created if the student does not already have one.

Repeated video and explanation completion does not increase the points again.

---

### 4.2 Get Lesson Progress

```http
GET /progress/lessons/:lessonId
```

**Authentication:** Required

**Role:** `STUDENT`

Returns the student's progress for a lesson.

If no progress record exists, default progress values are returned.

Lessons without homework are treated as having completed homework.

Lessons without required book content are treated as having completed book requirements.

---

### 4.3 Submit Homework

```http
POST /progress/lessons/:lessonId/homework
```

**Authentication:** Required

**Role:** `STUDENT`

Submits answers for a lesson's homework.

**Request Body:**

The request body must follow `SubmitAnswersDto`.

Example:

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

**Behavior:**

- Validates that the lesson exists.
- Rejects lessons without homework.
- Validates the number of submitted answers.
- Compares submitted answers with the correct answers.
- Supports questions with multiple correct answers.
- Stores the student's best homework score.
- Updates the lesson's total points.
- Updates the lesson completion status.

**Scoring:**

Each fully correct question gives one point.

A question is considered correct only when the submitted answer set matches the correct answer set.

---

### 4.4 Get Exam Progress

```http
GET /progress/exams/:examId
```

**Authentication:** Required

**Role:** `STUDENT`

Returns the student's progress for an exam.

If no progress record exists, default progress values are returned.

---

### 4.5 Submit Exam

```http
POST /progress/exams/:examId/submit
```

**Authentication:** Required

**Role:** `STUDENT`

Submits answers for an exam.

**Request Body:**

The request body must follow `SubmitAnswersDto`.

Example:

```json
{
  "answers": [[0], [1, 2], [3]]
}
```

**Scoring:**

| Component          |   Points |
| ------------------ | -------: |
| Correct answer     |  1 point |
| Perfect exam bonus | 5 points |

The perfect-exam bonus is granted when all questions are answered correctly.

```text
points = correctAnswers
bonusPoints = 5 when all answers are correct, otherwise 0
totalPoints = points + bonusPoints
```

**Passing Rule:**

The student's percentage is compared with the exam's configured `passPercentage`.

```text
percentage = (correctAnswers / totalQuestions) × 100
```

The exam is considered passed when:

```text
percentage >= passPercentage
```

The service stores the student's best result based on total points.

---

### 4.6 Get Month Progress

```http
GET /progress/months/:monthId
```

**Authentication:** Required

**Role:** `STUDENT`

Returns the student's progress for all lessons and exams in a month.

**Response Includes:**

- Lessons and their completion status.
- Lesson points.
- Exams and their results.
- Total points.
- Lesson points.
- Exam points.
- Total lessons.
- Completed lessons.
- Total exams.
- Completed exams.

**Summary Fields:**

```json
{
  "summary": {
    "totalPoints": 0,
    "lessonPoints": 0,
    "examPoints": 0,
    "totalLessons": 0,
    "completedLessons": 0,
    "totalExams": 0,
    "completedExams": 0
  }
}
```

---

### Lesson Completion Rules

A lesson is considered completed when all required activities are completed:

```text
Video completed
AND
Explanation completed
AND
Homework completed or no homework exists
AND
Book completed or no required book exists
```

The lesson's `completed` value is calculated by the backend.

---

## 5. Admin

**Base Route:**

```text
/admin
```

All admin endpoints require:

- A valid JWT access token.
- The `ADMIN` role.

**Required Headers:**

```http
Authorization: Bearer <access_token>
```

---

### 5.1 Get All Students

```http
GET /admin/students
```

**Authentication:** Required

**Role:** `ADMIN`

Returns all student accounts.

**Behavior:**

- Filters users by the `STUDENT` role.
- Excludes sensitive authentication fields.
- Populates the student's educational stage.
- Populates subscribed months.
- Sorts students by creation date in descending order.

---

### 5.2 Get Student by Student ID

```http
GET /admin/students/:studentId
```

**Authentication:** Required

**Role:** `ADMIN`

Returns a student using the generated student ID.

---

### 5.3 Update Student

```http
PATCH /admin/students/:studentId
```

**Authentication:** Required

**Role:** `ADMIN`

Updates student information.

The request body must follow `UpdateStudentDto`.

The service supports password hashing and educational stage validation.

---

### 5.4 Update Student Status

```http
PATCH /admin/students/:studentId/status
```

**Authentication:** Required

**Role:** `ADMIN`

Updates the student's account status.

Supported statuses are defined by the application's `UserStatus` enum.

---

### 5.5 Get Student Subscribed Months

```http
GET /admin/students/:studentId/subscribed-months
```

**Authentication:** Required

**Role:** `ADMIN`

Returns the months subscribed to by a student.

---

### 5.6 Add Subscribed Month

```http
POST /admin/students/:studentId/subscribed-months
```

**Authentication:** Required

**Role:** `ADMIN`

Adds a month to the student's subscribed months.

**Validation Rules:**

- The student must exist.
- The month must exist.
- The month must belong to the student's educational stage.
- Duplicate subscriptions are rejected.

The subscription is added using `$addToSet`.

---

### 5.7 Remove Subscribed Month

```http
DELETE /admin/students/:studentId/subscribed-months
```

**Authentication:** Required

**Role:** `ADMIN`

Removes a month from the student's subscribed months.

The request body must follow `UpdateSubscribedMonthsDto`.

The month is removed using `$pull`.

---

### 5.8 Delete Student

```http
DELETE /admin/students/:studentId
```

**Authentication:** Required

**Role:** `ADMIN`

Deletes a student account using the generated student ID.

---

## 6. Leaderboard

**Base Route:**

```text
/leaderboard
```

All leaderboard endpoints are public.

Authentication is not required.

The leaderboard contains active students only.

---

### 6.1 Get Educational Stages

```http
GET /leaderboard/stages
```

**Authentication:** Public

Returns all educational stages with their titles.

Stages are sorted by their `order`.

**Response Structure:**

```json
{
  "data": [
    {
      "_id": "STAGE_OBJECT_ID",
      "title": "الصف الأول الإعدادي"
    }
  ]
}
```

---

### 6.2 Get Overall Top Students

```http
GET /leaderboard/top-students
```

**Authentication:** Public

Returns the top 10 active students across all educational stages.

**Included Student Information:**

- Student ID.
- Name.
- Avatar.
- Educational stage.
- Total points.
- Rank.

**Point Calculation:**

```text
Total Points = Lesson Progress Points + Exam Progress Points
```

The result is sorted by total points in descending order and limited to 10 students.

**Response Structure:**

```json
{
  "data": [
    {
      "rank": 1,
      "studentId": "STUDENT_ID",
      "name": "Student Name",
      "avatar": "AVATAR_URL",
      "stage": "Educational Stage",
      "totalPoints": 100
    }
  ]
}
```

---

### 6.3 Get Top Students by Educational Stage

```http
GET /leaderboard/stages/:stageId/top-students
```

**Authentication:** Public

Returns the top 10 active students within a specific educational stage.

**Validation:**

- The stage ID must be a valid MongoDB ObjectId.
- The educational stage must exist.

**Response Structure:**

```json
{
  "data": {
    "stage": "Educational Stage",
    "students": [
      {
        "rank": 1,
        "studentId": "STUDENT_ID",
        "name": "Student Name",
        "avatar": "AVATAR_URL",
        "totalPoints": 100
      }
    ]
  }
}
```

---

# Authorization and Roles

The application uses role-based access control.

## Available Roles

| Role      | Description                                                |
| --------- | ---------------------------------------------------------- |
| `STUDENT` | Accesses educational content and manages personal progress |
| `TEACHER` | Manages educational stages, months, lessons, and exams     |
| `ADMIN`   | Manages student accounts and subscriptions                 |

---

## Guards

### JwtAuthGuard

Validates the JWT access token and authenticates the user.

### RolesGuard

Checks whether the authenticated user has the required role.

### Roles Decorator

Defines the roles allowed to access a route or controller.

Example:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```

---

## Public and Protected Routes

| Module                         | Access                |
| ------------------------------ | --------------------- |
| Authentication                 | Public, except logout |
| Users profile                  | Authenticated users   |
| Student profile update         | Students only         |
| Educational content reading    | Public                |
| Educational content management | Teachers only         |
| Progress                       | Students only         |
| Admin                          | Admins only           |
| Leaderboard                    | Public                |

---

# Progress and Scoring System

## Lesson Points

| Activity               |                       Points |
| ---------------------- | ---------------------------: |
| Video completion       |                           10 |
| Explanation completion |                           10 |
| Homework               | 1 point per correct question |
| Required book          |                    No points |

Video and explanation points are granted only once per progress record.

The homework score is updated only when the new score is greater than the previously stored score.

---

## Exam Points

| Activity           |   Points |
| ------------------ | -------: |
| Correct answer     |  1 point |
| Perfect exam bonus | 5 points |

The perfect exam bonus is granted when all exam questions are answered correctly.

```text
points = correctAnswers
bonusPoints = 5 if correctAnswers == totalQuestions
totalPoints = points + bonusPoints
```

The best exam result is retained according to the highest total points.

---

## Leaderboard Points

The leaderboard calculates each student's total points using:

```text
Total Student Points
    =
Total Lesson Progress Points
    +
Total Exam Progress Points
```

Only users matching the following criteria are included:

```text
role = STUDENT
status = ACTIVE
```

---

# Response Format

The API returns JSON responses.

A successful response may include a message and data.

## Example

```json
{
  "message": "تم تحديث تقدم الدرس بنجاح",
  "data": {
    "lesson": "LESSON_OBJECT_ID",
    "totalPoints": 20,
    "completed": false
  }
}
```

Some endpoints return only a `data` property.

For example:

```json
{
  "data": []
}
```

The exact response structure depends on the endpoint.

---

# Error Handling

The backend uses NestJS HTTP exceptions.

Common HTTP status codes include:

| Status Code | Meaning               |
| ----------- | --------------------- |
| `400`       | Bad Request           |
| `401`       | Unauthorized          |
| `403`       | Forbidden             |
| `404`       | Not Found             |
| `409`       | Conflict              |
| `500`       | Internal Server Error |

Error and success messages are returned in Arabic where configured by the service.

## Common Errors

Examples include:

- Invalid MongoDB ObjectId.
- User not found.
- Educational stage not found.
- Month not found.
- Lesson not found.
- Exam not found.
- Invalid or expired OTP.
- Invalid credentials.
- Suspended account.
- Invalid answer count.
- Duplicate subscription.
- Month does not belong to the student's stage.

---

# Environment Variables

The application uses environment variables for configuration.

The exact required variables depend on the current configuration files.

Typical configuration categories include:

```env
NODE_ENV=development
PORT=8000

MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_ACCESS_SECRET=YOUR_ACCESS_TOKEN_SECRET
JWT_REFRESH_SECRET=YOUR_REFRESH_TOKEN_SECRET

JWT_ACCESS_EXPIRES_IN=YOUR_ACCESS_TOKEN_EXPIRATION
JWT_REFRESH_EXPIRES_IN=YOUR_REFRESH_TOKEN_EXPIRATION

MAIL_HOST=YOUR_MAIL_HOST
MAIL_PORT=YOUR_MAIL_PORT
MAIL_USER=YOUR_MAIL_USER
MAIL_PASSWORD=YOUR_MAIL_PASSWORD

OTP_EXPIRATION=YOUR_OTP_EXPIRATION
OTP_COOLDOWN=YOUR_OTP_COOLDOWN
```

> Use the actual variable names defined in the project configuration files. Do not commit secrets or production credentials to the repository.

---

# Installation

## 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

## 2. Navigate to the Backend Directory

```bash
cd back-end
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

Create the appropriate environment file and provide the required configuration values.

## 5. Start MongoDB

Make sure the configured MongoDB database is accessible.

---

# Running the Application

## Development

```bash
npm run start:dev
```

## Standard Start

```bash
npm run start
```

## Production Build

```bash
npm run build
```

## Production Start

```bash
npm run start:prod
```

---

# Development Notes

## MongoDB ObjectId Validation

Routes that accept MongoDB IDs use `ParseMongoIdPipe` where configured.

Example:

```typescript
@Param("lessonId", ParseMongoIdPipe)
lessonId: string
```

---

## Data Protection

Sensitive user fields are excluded from profile and student-management responses where configured.

Sensitive fields include:

- Password.
- Hashed refresh token.
- Email OTP.
- OTP expiration.
- OTP cooldown data.

---

## Refresh Token Security

Refresh tokens are hashed before being stored in the database.

When the user logs out or resets the password, the stored refresh token hash is cleared.

---

## Content Ordering

Educational stages, months, lessons, and exams use an `order` field.

Lessons and exams inside the same month share a common content ordering system.

This allows the frontend to display lessons and exams together in the intended order.

---

## Locked Content

Educational content can be returned in a locked state when the authenticated student does not have access to the corresponding month.

Locked content exposes limited information rather than the complete lesson or exam data.

---

## Subscription Model

Student access to months is managed by administrators.

A student can access a month when its ID exists in the student's `subscribedMonths` field.

Teachers and administrators have access to all months according to the service access-control rules.

---

## API Testing

The API can be tested using tools such as:

- Postman.
- Insomnia.
- Swagger, if configured.
- Frontend HTTP clients.

For protected endpoints, include:

```http
Authorization: Bearer <access_token>
```

For endpoints that require MongoDB IDs, provide valid ObjectId values.

---

## Project Status

The backend includes the following major modules:

- Authentication.
- Users.
- Educational Content.
- Progress.
- Admin.
- Leaderboard.

The exact implementation and available request fields are defined by the corresponding controllers, services, DTOs, schemas, and configuration files.
