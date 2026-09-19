# رُقِيّ (RUQI) — Frontend

> **رُقِيّ، نرتقي باللغة لنرتقي بالعلم**

The frontend of **RUQI**, a premium Arabic educational platform designed for students studying Arabic language across general and Al-Azhar educational tracks.

RUQI provides a structured learning experience built around educational stages, months, lessons, assignments, exams, progress tracking, and student competition. The frontend consumes the RUQI backend API and presents the platform through a consistent, Arabic-first, RTL interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Product Goals](#product-goals)
- [Core Principles](#core-principles)
- [Technology Direction](#technology-direction)
- [Backend Integration](#backend-integration)
- [User Roles](#user-roles)
- [Main Product Areas](#main-product-areas)
- [Educational Content Model](#educational-content-model)
- [Authentication](#authentication)
- [Progress and Completion Rules](#progress-and-completion-rules)
- [Leaderboard](#leaderboard)
- [Management and Support](#management-and-support)
- [Design System](#design-system)
- [Responsive and Accessibility Requirements](#responsive-and-accessibility-requirements)
- [Project Screens](#project-screens)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Conventions](#api-conventions)
- [Security Requirements](#security-requirements)
- [Development Guidelines](#development-guidelines)
- [Project Status](#project-status)

---

## Project Overview

RUQI is an Arabic educational platform created for **أستاذ سمير محمد أبو المجد**. It targets students in:

- الإعدادية العامة
- الإعدادية الأزهرية
- الثانوية العامة
- الثانوية الأزهرية

The frontend is responsible for delivering the user experience for students, teachers, and administrators while integrating with the NestJS backend for authentication, educational content, subscriptions, progress, and leaderboard data.

### Main objectives

- Provide a clear and organized educational journey.
- Make Arabic learning accessible through a modern RTL experience.
- Allow students to follow lessons and monitor their progress.
- Support assignments and MCQ-based exams.
- Give teachers structured educational-content management tools.
- Give administrators student and subscription-management tools.
- Encourage healthy competition through a public leaderboard.

---

## Product Goals

The product should feel:

- Premium
- Professional
- Calm
- Educational
- Structured
- Modern
- Arabic-first
- RTL-native
- Consistent across all screens

RUQI must not feel like a generic school website, an unrelated SaaS template, or an overloaded traditional educational portal.

---

## Core Principles

1. **Arabic first:** all user-facing content is Arabic.
2. **Native RTL:** layouts are designed for Arabic rather than simply mirrored from an LTR interface.
3. **Consistency:** shared tokens and reusable components are used across the entire application.
4. **Clarity over decoration:** visual elements must support learning and navigation.
5. **Role-based access:** the interface must reflect the permissions provided by the backend.
6. **Progressive disclosure:** complex information is revealed in a structured way.
7. **Responsive composition:** mobile layouts are intentionally recomposed instead of merely shrinking desktop layouts.
8. **Accessible interaction:** status must not be communicated through color alone.

---

## Technology Direction

The frontend is designed to integrate with the RUQI backend, which is built with NestJS.

The frontend technology stack should follow the implementation used in the project. The expected direction is:

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** reusable design tokens and component-based styling
- **Typography:** Cairo for the primary interface font
- **Icons:** minimal line icons, such as Lucide-style icons
- **Media:** YouTube lesson videos and educational imagery
- **API communication:** REST API integration with the RUQI backend

> Keep the actual dependencies and scripts synchronized with `package.json`. This README describes the product and integration contract; it should not be treated as a replacement for the project's package configuration.

---

## Backend Integration

The frontend consumes the RUQI backend through the configured API base URL.

Current backend base URL documented for integration:

```env
NEXT_PUBLIC_API_BASE_URL=https://app-6a995274.deploy.meerasolution.com
```

For local development, use the local backend URL configured for the environment, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The API uses versioned routes where applicable and returns Arabic response and error messages. The authentication header follows this format:

```http
Authorization: Bearer <access-token>
```

The refresh-token endpoint is:

```http
POST /auth/get-new-access-token
```

The frontend must centralize API communication rather than placing duplicated request logic inside individual components.

---

## User Roles

### Guest

Guests can:

- Visit the homepage.
- Browse educational stages.
- Browse the educational structure and available months.
- View the public leaderboard.
- Open the account page.
- Navigate to login or signup.

Guests cannot access restricted lesson content or private student information.

### Student

Students can:

- Access their account and profile.
- View available educational stages and months.
- Access content permitted by their subscription.
- Watch lesson videos.
- Read explanations.
- Complete assignments and exams.
- View their progress.
- View their current rank, level, and points.
- Submit subscription and support requests.

### Teacher

Teachers can:

- View the educational-content hierarchy.
- Create, edit, delete, and reorder stages.
- Create, edit, delete, and reorder months.
- Create, edit, and delete lessons.
- Create, edit, and delete exams.
- Manage MCQ questions.
- View educational-content statistics.

Teacher profile information is read-only in the dashboard.

### Admin

Administrators can:

- View students.
- Search students by Student ID.
- View student details.
- Update student information when permitted.
- Delete students when permitted.
- Manage student month access and subscriptions.
- Review the operational overview for users, subscriptions, and support.

The admin interface does not include teacher management or admin management.

---

## Main Product Areas

### 1. Public Website

- Homepage
- Educational stages
- Months and educational structure
- Public leaderboard
- Account selection page

### 2. Authentication

- Login
- Signup
- OTP verification
- Resend OTP
- Forgot password
- Reset password
- Refresh access token
- Logout

### 3. Student Experience

- Student profile
- Sequential month content
- Video lesson
- Explanation article
- Assignment
- Exam overview
- Exam questions
- Exam result
- Educational progress
- Competition information
- Subscription management
- Support requests

### 4. Teacher Experience

- Teacher dashboard
- Educational hierarchy
- Stage management
- Month management
- Lesson management
- Exam management
- MCQ question builder
- Content ordering
- Educational statistics

### 5. Admin Experience

- Admin overview
- Student table
- Student details drawer
- Student search by Student ID
- Subscription access management

---

## Educational Content Model

RUQI uses the following hierarchy:

```text
Educational Stage
└── Month
    └── Sequential Content
        ├── Lesson
        └── Exam
```

The educational structure includes twelve stages:

- Three general preparatory stages
- Three Al-Azhar preparatory stages
- Three general secondary stages
- Three Al-Azhar secondary stages

The exact stage names and their display order are provided by the backend and should be rendered according to the stage `order` value.

### Sequential content

Exams are not displayed as a separate section under a month. They are part of the same ordered content stream:

```text
Lesson 1
Lesson 2
Exam 1
Lesson 3
Lesson 4
Exam 2
```

Content ordering is numeric. The frontend should provide an ordering interface without introducing drag-and-drop unless the product requirements are changed.

All content is published immediately. The product does not include draft, scheduling, or publishing-status workflows.

---

## Authentication

The frontend integrates with the backend authentication flow:

```text
Signup
  ↓
OTP Verification
  ↓
Account Activation
  ↓
Login
  ↓
Access Token + Refresh Token
```

### Authentication requirements

- Store tokens using a secure strategy appropriate for the application architecture.
- Attach the access token to protected API requests.
- Refresh expired access tokens through the backend refresh endpoint.
- Handle unauthorized responses consistently.
- Redirect users only when the authentication state requires it.
- Never expose technical backend errors to users.
- Keep the email address immutable after registration if that is enforced by the backend.

### Authentication UI

The authentication interface must include:

- Arabic labels and validation messages.
- Password visibility control.
- Password requirements.
- Confirm-password matching feedback.
- Six-digit OTP input.
- Loading states for form submissions.
- Inline validation and top-center alerts where appropriate.

---

## Progress and Completion Rules

Each educational component has an independent completion state.

| Component | Completion rule |
|---|---|
| Video | Student explicitly selects `تمت المشاهدة` |
| Explanation | Student explicitly marks the explanation as completed |
| Assignment | All assignment questions are answered and submitted according to the backend rules |
| Exam | All exam questions are completed and submitted |
| Book note | Displayed as an educational requirement when configured; it is not a separate page |

A month is unlocked according to the subscription access granted by the administrator and the backend's access rules.

The frontend must not assume that a specific percentage score automatically unlocks a month. Completion and access decisions must follow the backend contract.

### Progress presentation

Use appropriate visualizations:

- Progress bars
- Circular progress indicators
- Summary statistics
- Line charts or bar charts only when they communicate meaningful progress

The student profile should present progress hierarchically:

```text
Stage
└── Months
    └── Lessons
        ├── Videos
        ├── Explanations
        ├── Assignments
        └── Exams
```

---

## Leaderboard

The leaderboard is public and does not require authentication for basic viewing.

It should include:

- All stages filter.
- Educational-stage filters.
- Rank.
- Student avatar.
- Student name.
- Educational stage.
- Level.
- Points.
- Special presentation for the top three students.
- Current-student highlighting when a student is authenticated.

The leaderboard must not use fixed, artificial point ranges to define levels. Level information is supplied by the competition system and should be presented as dynamic data.

The current student's rank should be highlighted without displaying a previous rank.

---

## Management and Support

The management page contains two primary sections:

### Educational subscription

- Current educational stage.
- Months and their access status.
- Open or closed month access.
- `طلب اشتراك جديد` action.

### Support and follow-up

- Existing support requests.
- Request title.
- Request details.
- Request status.
- `طلب جديد` action.

Supported support statuses:

- قيد المتابعة
- تم الحل

The subscription-request and support-request flows save the request through the platform and then direct the student to WhatsApp for further communication.

The frontend must not introduce an internal chat system or additional support statuses.

---

## Design System

### Brand

- **Brand:** رُقِيّ
- **Slogan:** رُقِيّ، نرتقي باللغة لنرتقي بالعلم
- **Primary color:** controlled gold palette
- **Background:** warm off-white
- **Dark surfaces:** warm charcoal or dark brown
- **Primary font:** Cairo
- **Brand typography:** أبجد هوز only for logo and selected decorative moments

### UI direction

- Light mode only.
- Arabic-only interface.
- Native RTL layout.
- Medium, consistent border radius.
- Soft, subtle shadows.
- Text-first buttons.
- Minimal line icons.
- Subtle Islamic geometric patterns.
- No excessive ornamentation.
- No random colors or one-off component styles.

### Shared components

Build and reuse components for:

- Header
- Footer
- Buttons
- Inputs
- Selects
- Cards
- Alerts and toasts
- Confirmation modals
- Drawers
- Status badges
- Progress bars
- Circular progress
- Statistics
- Educational cards
- Locked states
- Empty states
- Tables
- Question blocks
- Leaderboard rows
- Form sections

### Header

The global header contains:

- رُقِيّ logo linking to the homepage.
- المحتوى التعليمي
- المتفوقين
- الحساب
- الدعم

The active navigation item uses a gold pill. On mobile, navigation opens from the right side in a full-screen or full-height premium drawer.

### Footer

The footer uses a warm dark surface and includes:

- Brand logo and slogan.
- Platform links.
- Social media links.
- Copyright notice:

```text
حقوق النشر محفوظة © 2026 رُقِيّ
```

---

## Responsive and Accessibility Requirements

The interface must support:

- Desktop
- Tablet
- Mobile

### Mobile requirements

- Recompose layouts instead of simply shrinking them.
- Convert lesson navigation into a drawer.
- Preserve important table data through horizontal scrolling where needed.
- Keep touch targets sufficiently large.
- Maintain readable Arabic typography.

### Accessibility requirements

- WCAG-friendly contrast.
- Keyboard navigation.
- Visible focus states.
- Semantic HTML.
- Accessible labels.
- Clear validation and error messages.
- Status communication that does not rely on color alone.
- Proper RTL reading order.

---

## Project Screens

The frontend should cover the following primary screens:

1. Base layout
2. Loading page
3. Homepage
4. Educational stages
5. Months
6. Sequential educational content
7. Video lesson
8. Explanation
9. Assignment
10. Exam overview
11. Exam questions
12. Exam result
13. Leaderboard
14. Account
15. Login
16. Signup
17. OTP verification
18. Student profile
19. Teacher dashboard
20. Admin dashboard
21. Management
22. Subscription request
23. Support request

Important shared states:

- Loading
- Empty
- Locked
- Success
- Error
- Validation
- Confirmation
- Completed
- In progress
- Not started

---

## Getting Started

### Prerequisites

Install the versions required by the project's package configuration. At minimum, the development environment needs:

- Node.js
- npm
- Access to the RUQI backend API

### Installation

```bash
npm install
```

### Environment configuration

Create the environment file required by the project, for example:

```bash
.env.local
```

Add the backend base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Use the deployed backend URL only in the appropriate deployment environment.

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Start the production build

```bash
npm run start
```

> Confirm the available scripts in `package.json` before running commands in a new environment.

---

## Environment Variables

The exact environment variables must be documented alongside the implementation. The frontend is expected to require values similar to:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |
| `NEXT_PUBLIC_YOUTUBE` or equivalent configuration | Only if required by the actual media implementation |
| Other deployment variables | Must be documented when introduced |

Do not commit secrets, private tokens, or production credentials to the repository.

---

## API Conventions

The frontend API layer should follow these rules:

- Keep the base URL configurable.
- Centralize request and response handling.
- Attach `Authorization: Bearer <access-token>` to protected requests.
- Handle Arabic backend messages without replacing them with technical errors.
- Normalize loading, success, and failure states.
- Handle `401 Unauthorized` consistently.
- Prevent duplicated requests where possible.
- Validate user-controlled input before submission.
- Use typed request and response models.
- Keep backend-specific logic out of presentational components.

### Backend endpoint groups

The current backend is organized around these endpoint groups:

- Authentication: `/auth`
- Users: `/users`
- Educational content: `/educational-content`
- Progress: `/progress`
- Administration: `/admin`
- Leaderboard: `/leaderboard`

The frontend must use the actual backend DTOs, response structures, guards, and access rules. Do not invent client-side permissions that contradict the backend.

---

## Security Requirements

The frontend is not a security boundary. All sensitive authorization decisions must be enforced by the backend.

Frontend responsibilities include:

- Avoid exposing secrets in client-side code.
- Do not place private API keys in public environment variables.
- Handle access-token expiration correctly.
- Avoid displaying sensitive backend errors.
- Avoid trusting client-side role or subscription state without backend validation.
- Prevent accidental duplicate submissions.
- Protect authenticated routes at the UI level while retaining backend enforcement.
- Use HTTPS in production.
- Configure CORS and cookie/token behavior according to the deployed architecture.

A user must not gain access to locked educational content simply by manipulating frontend state.

---

## Development Guidelines

### Component architecture

- Prefer reusable components over duplicated page-specific implementations.
- Separate presentational components from API and business logic.
- Keep forms typed and validated.
- Use consistent loading, empty, error, and success states.
- Keep educational content components composable.

### UX guidelines

- Use top-center alerts for global notifications.
- Use inline validation for field-specific errors.
- Use confirmation modals for destructive or irreversible actions.
- Use skeleton loaders for content loading.
- Use button-level loading indicators for mutations.
- Keep the user informed when an action is processing.
- Never expose stack traces or raw technical exceptions.

### Product constraints

Do not introduce new product concepts without an explicit requirement, including:

- New user roles.
- New subscription statuses.
- New support statuses.
- Teacher or admin management systems not specified by the product.
- Draft or publishing workflows.
- Separate exam sections under months.
- Fixed level thresholds.
- Unnecessary navigation items.
- Unnecessary analytics dashboards.
- Dark mode.
- English UI labels.

---

## Project Status

The frontend is being developed as the client application for the RUQI backend.

Implementation status should be maintained in the project issue tracker or a dedicated task document. When adding or completing a feature, verify:

- Its UI state coverage.
- Its responsive behavior.
- Its API integration.
- Its authorization behavior.
- Its loading and error states.
- Its Arabic copy.
- Its accessibility.
- Its consistency with the shared design system.

---

## Final Principle

RUQI should feel like one coherent product from the homepage to the student experience, teacher dashboard, and admin dashboard.

The implementation must preserve the same:

- Gold system
- Typography
- Spacing
- Border radius
- Shadows
- Button system
- Form system
- Alert system
- Progress system
- Arabic RTL logic
- Product and permission rules

> **علم + لغة عربية + ارتقاء + تنظيم + منافسة + احتراف**
