# RUQI — Authentication APIs

## Base URL

Production:

```text
https://app-6a923169.deploy.meerasolution.com
```

---

# Authentication APIs

## 1. Register

### Endpoint

```http
POST /auth/register
```

### Description

Creates a new student account and sends an email verification OTP to the registered email address.

The account is initially created with:

```text
role: student
status: pending
```

### Request Body

Content-Type: `application/json`

```json
{
  "name": "Ahmed Mahmoud",
  "email": "ahmed@example.com",
  "password": "Password123",
  "phoneNumber": "01095554022",
  "address": "Damanhur",
  "educationalStageId": "OPTIONAL_MONGODB_OBJECT_ID"
}
```

### Fields

#### name

- Type: `string`
- Required: Yes
- Description: Student's full name.

#### email

- Type: `string`
- Required: Yes
- Description: Student's email address.
- Must be a valid email.

#### password

- Type: `string`
- Required: Yes
- Description: Student's password.

#### phoneNumber

- Type: `string`
- Required: Yes
- Description: Student's phone number.

#### address

- Type: `string`
- Required: Yes
- Description: Student's address.

#### educationalStageId

- Type: `string`
- Required: No
- Description: MongoDB ObjectId of the student's educational stage.

This field is optional because the platform may not have educational stages/content available yet.

### Successful Response

Status: `201 Created`

```json
{
  "userId": "6a920adefc1738b9d99cfef7",
  "name": "Ahmed Mahmoud",
  "email": "ahmed@example.com",
  "message": "A verification code has been sent to your email."
}
```

### Frontend Usage

After successful registration:

1. Do not consider the user authenticated.
2. Navigate to the email verification page.
3. Keep the returned `userId`.
4. Ask the user to enter the OTP received by email.
5. Use the `userId` and OTP with `/auth/verify-email`.

Recommended frontend route:

```text
/verify-email?userId=6a920adefc1738b9d99cfef7
```

### Errors

#### 400 Bad Request

Returned when the request body fails validation.

Example:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "name must be a string"],
  "error": "Bad Request"
}
```

#### 409 Conflict

Returned when the email is already registered.

```json
{
  "statusCode": 409,
  "message": "Email is already registered",
  "error": "Conflict"
}
```

---

# 2. Verify Email

### Endpoint

```http
POST /auth/verify-email
```

### Description

Verifies the user's email address using the OTP sent during registration.

After successful verification, the account becomes active.

### Request Body

Content-Type: `application/json`

```json
{
  "userId": "6a920adefc1738b9d99cfef7",
  "otp": "123456"
}
```

### Fields

#### userId

- Type: `string`
- Required: Yes
- Description: The `userId` returned from `/auth/register`.

#### otp

- Type: `string`
- Required: Yes
- Description: The verification code received by email.

### Successful Response

Status: `200 OK`

```json
{
  "user": {
    "id": "6a920adefc1738b9d99cfef7",
    "studentId": "RUQI-CC9F05BD",
    "name": "Ahmed Mahmoud",
    "email": "ahmed@example.com",
    "role": "student",
    "status": "active"
  },
  "message": "Email verified successfully"
}
```

### Frontend Usage

After successful verification:

1. Consider the email verification completed.
2. The account is now active.
3. Show the success message.
4. Navigate the user to `/login`.

Recommended message:

```text
Email verified successfully
```

### Errors

#### 400 Bad Request — OTP Not Found

```json
{
  "statusCode": 400,
  "message": "OTP not found",
  "error": "Bad Request"
}
```

#### 400 Bad Request — OTP Expired

```json
{
  "statusCode": 400,
  "message": "OTP has expired. Please request a new OTP",
  "error": "Bad Request"
}
```

#### 400 Bad Request — Invalid OTP

```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}
```

#### 400 Bad Request — Email Already Verified

```json
{
  "statusCode": 400,
  "message": "Email is already verified",
  "error": "Bad Request"
}
```

#### 404 Not Found — User Not Found

```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

# 3. Login

### Endpoint

```http
POST /auth/login
```

### Description

Authenticates an active user using their email and password.

### Request Body

Content-Type: `application/json`

```json
{
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

### Fields

#### email

- Type: `string`
- Required: Yes
- Description: User's registered email address.
- Must be a valid email.

#### password

- Type: `string`
- Required: Yes
- Description: User's account password.

### Successful Response

Status: `200 OK`

```json
{
  "user": {
    "id": "6a920adefc1738b9d99cfef7",
    "studentId": "RUQI-CC9F05BD",
    "name": "Ahmed Mahmoud",
    "email": "ahmed@example.com",
    "role": "student",
    "status": "active"
  },
  "accessToken": "JWT_ACCESS_TOKEN"
}
```

### Refresh Token

The backend automatically sets the refresh token as an HTTP-only cookie:

```text
refreshToken=<JWT_REFRESH_TOKEN>
```

The refresh token is not included in the JSON response.

The frontend must not attempt to read the refresh token using JavaScript.

### Frontend Usage

After successful login:

1. Save the returned `accessToken`.
2. Save the returned `user` in the authentication state.
3. The browser automatically stores the `refreshToken` cookie.
4. Use the `accessToken` for protected API requests.
5. Redirect the user according to their role.

Example protected request:

```http
Authorization: Bearer JWT_ACCESS_TOKEN
```

### Role-Based Routing

The frontend can use `user.role` to determine the appropriate interface/dashboard.

Possible roles:

```text
student
teacher
administrator
```

Example:

```text
student
→ Student Dashboard

teacher
→ Teacher Dashboard

administrator
→ Admin Dashboard
```

### Errors

#### 400 Bad Request

Returned when the request body fails validation.

#### 401 Unauthorized

Returned when:

- Email/password are incorrect.
- The account is not active.

---

# 4. Refresh Access Token

### Endpoint

```http
POST /auth/refresh
```

### Description

Returns a new access token using the refresh token stored in the HTTP-only cookie.

### Request Body

No request body is required.

```json
{}
```

### Frontend Usage

The browser automatically sends the `refreshToken` cookie.

Example:

```http
POST /auth/refresh
```

If using Axios:

```ts
axios.post(
  '/auth/refresh',
  {},
  {
    withCredentials: true,
  },
);
```

If using `fetch`:

```ts
fetch('/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
```

### Successful Response

Status: `200 OK`

```json
{
  "accessToken": "NEW_JWT_ACCESS_TOKEN"
}
```

### Frontend Behavior

When the current access token expires:

1. Call `/auth/refresh`.
2. The browser sends the refresh token automatically.
3. Receive the new access token.
4. Replace the old access token.
5. Retry the failed API request.

The frontend must not:

- Read the refresh token.
- Store the refresh token in localStorage.
- Send the refresh token in the request body.
- Generate refresh tokens locally.

### Errors

#### 401 Unauthorized

Returned when the refresh token is:

- Missing.
- Invalid.
- Expired.

---

# 5. Logout

### Endpoint

```http
POST /auth/logout
```

### Description

Logs out the authenticated user and clears the refresh token cookie.

### Authentication

Required.

Send the access token in the Authorization header:

```http
Authorization: Bearer JWT_ACCESS_TOKEN
```

### Request Body

No request body is required.

### Frontend Usage

Example with Axios:

```ts
axios.post(
  '/auth/logout',
  {},
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  },
);
```

Example with fetch:

```ts
fetch('/auth/logout', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: 'include',
});
```

### Successful Response

Status: `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

### Frontend Behavior

After successful logout:

1. Remove the `accessToken` from frontend storage/state.
2. Clear the authenticated user state.
3. Redirect the user to `/login`.

The frontend does not need to manually delete the `refreshToken` cookie because it is an HTTP-only cookie managed by the backend.

### Errors

#### 401 Unauthorized

Returned when the access token is missing or invalid.

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

# Authentication Flow

```text
REGISTER
   |
   v
POST /auth/register
   |
   v
Account Created
(status = pending)
   |
   v
OTP Sent To Email
   |
   v
/verify-email
   |
   v
POST /auth/verify-email
   |
   v
Email Verified
(status = active)
   |
   v
/login
   |
   v
POST /auth/login
   |
   +----------------------+
   |                      |
   v                      v
Access Token        Refresh Token
                    HTTP-only Cookie
   |
   v
Protected APIs
   |
   v
Access Token Expires
   |
   v
POST /auth/refresh
   |
   v
New Access Token
   |
   v
Continue Using Protected APIs
```

---

# Protected API Authentication

For any protected API, send the access token using:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
GET /some-protected-endpoint
Authorization: Bearer JWT_ACCESS_TOKEN
```

If the access token is expired:

```text
API Request
    |
    v
401 Unauthorized
    |
    v
POST /auth/refresh
    |
    v
New Access Token
    |
    v
Retry Original Request
```

---

# User Roles

The backend currently supports:

```text
student
teacher
administrator
```

The frontend should use the `role` returned from login to determine the user's available interface and navigation.

Role-based access is enforced by the backend.

If the user is authenticated but does not have permission for a specific endpoint, the backend returns:

```text
403 Forbidden
```

---

# API Summary

| Method | Endpoint             | Authentication |
| ------ | -------------------- | -------------- |
| POST   | `/auth/register`     | Public         |
| POST   | `/auth/verify-email` | Public         |
| POST   | `/auth/login`        | Public         |
| POST   | `/auth/refresh`      | Refresh Cookie |
| POST   | `/auth/logout`       | Access Token   |

---

# Frontend Authentication Rules

1. `/auth/register` creates the account but does not log the user in.
2. The `userId` returned from registration is required for email verification.
3. The OTP is received by email.
4. `/auth/verify-email` activates the account.
5. `/auth/login` returns the user data and access token.
6. The refresh token is stored automatically as an HTTP-only cookie.
7. The frontend must never try to read the refresh token.
8. Protected APIs require the access token in the `Authorization` header.
9. When the access token expires, call `/auth/refresh`.
10. After logout, clear the frontend authentication state and redirect to `/login`.
11. Role-based permissions are enforced by the backend.
12. The frontend should use the returned `user.role` to determine the appropriate dashboard and UI.
13. Requests that use the refresh token cookie must allow credentials.
