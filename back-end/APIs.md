# RUQI — Authentication APIs

## Base URL

Development:
http://localhost:3000

## Authentication

## 1. Register

### Endpoint

POST /auth/register

### Description

Creates a new student account and sends an email verification OTP to the registered email address.

The account is created with:

- role: student
- status: pending

The student cannot be considered fully activated until the email verification process is completed.

### Request Body

Content-Type: application/json

{
"name": "Ahmed Mahmoud",
"email": "[ahmed@example.com](mailto:ahmed@example.com)",
"password": "Password123",
"phoneNumber": "01095554022",
"address": "Damanhur",
"educationalStageId": "OPTIONAL_MONGODB_OBJECT_ID"
}

### Fields

name

- Type: string
- Required: Yes
- Description: Student's full name.

email

- Type: string
- Required: Yes
- Description: Student's email address.
- Must be a valid email.

password

- Type: string
- Required: Yes
- Description: Student's password.

phoneNumber

- Type: string
- Required: Yes
- Description: Student's phone number.

address

- Type: string
- Required: Yes
- Description: Student's address.

educationalStageId

- Type: string
- Required: No
- Description: MongoDB ObjectId of the student's educational stage.
- This field is optional because the platform may not have educational content/stages available yet.

### Successful Response

Status: 201 Created

{
"userId": "6a920adefc1738b9d99cfef7",
"name": "Ahmed Mahmoud",
"email": "[ahmed@example.com](mailto:ahmed@example.com)",
"message": "A verification code has been sent to your email."
}

### Frontend Behavior

After receiving a successful response:

1. Do NOT consider the user fully authenticated yet.
2. Navigate the user to the email verification page.
3. Pass/store the returned userId so it can be used with the verify-email endpoint.
4. The user should enter the OTP received by email.

Recommended frontend route:

/verify-email

Example:

/verify-email?userId=6a920adefc1738b9d99cfef7

The frontend should display a message informing the user that a verification code has been sent to their email.

Example:

"A verification code has been sent to your email."

### Possible Errors

400 Bad Request

Returned when the request body fails validation.

Example:

{
"statusCode": 400,
"message": [
"email must be an email",
"name must be a string"
],
"error": "Bad Request"
}

409 Conflict

Returned when the email is already registered.

Example:

{
"statusCode": 409,
"message": "Email is already registered",
"error": "Conflict"
}

==================================================

## 2. Verify Email

### Endpoint

POST /auth/verify-email

### Description

Verifies the student's email address using the OTP sent during registration.

If the OTP is valid and has not expired, the user's status changes from:

pending

to:

active

### Request Body

Content-Type: application/json

{
"userId": "6a920adefc1738b9d99cfef7",
"otp": "123456"
}

### Fields

userId

- Type: string
- Required: Yes
- Description: The user ID returned from the register endpoint.

otp

- Type: string
- Required: Yes
- Description: The verification code sent to the user's email.

### Successful Response

Status: 200 OK

{
"user": {
"id": "6a920adefc1738b9d99cfef7",
"studentId": "RUQI-CC9F05BD",
"name": "Ahmed Mahmoud",
"email": "[ahmed@example.com](mailto:ahmed@example.com)",
"role": "student",
"status": "active"
},
"message": "Email verified successfully"
}

### Frontend Behavior

After receiving a successful response:

1. Consider the email verification process completed.
2. The user account is now active.
3. Navigate the user to the appropriate next page.

Current recommended route:

/login

The frontend should display:

"Email verified successfully"

Then allow the user to log in using their email and password.

### Possible Errors

400 Bad Request — OTP Not Found

{
"statusCode": 400,
"message": "OTP not found",
"error": "Bad Request"
}

400 Bad Request — OTP Expired

{
"statusCode": 400,
"message": "OTP has expired. Please request a new OTP",
"error": "Bad Request"
}

400 Bad Request — Invalid OTP

{
"statusCode": 400,
"message": "Invalid OTP",
"error": "Bad Request"
}

400 Bad Request — Email Already Verified

{
"statusCode": 400,
"message": "Email is already verified",
"error": "Bad Request"
}

404 Not Found — User Not Found

{
"statusCode": 404,
"message": "User not found",
"error": "Not Found"
}

==================================================

## Authentication Flow

The frontend should implement the following flow:

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

## Important Notes

1. Registration does NOT log the user in automatically.

2. The user must verify their email before the account becomes active.

3. The OTP is sent directly to the email provided during registration.

4. educationalStageId is optional.

5. The frontend must keep the userId returned from /auth/register because it is required by /auth/verify-email.

6. The frontend must NOT generate or validate the OTP locally. OTP validation is handled entirely by the backend.

7. The frontend should not assume that an account is active immediately after registration.

8. After successful email verification, the user can proceed to login.

9. The user-facing messages returned by the backend can be displayed directly unless the frontend wants to provide its own localized messages.

10. All API requests and responses use JSON unless otherwise specified.
