# 📖 رُقِيّ (RUQI) — Project Documentation & UI/UX Specification

> **"نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"**  
> *A premium, Arabic-first educational platform for structured language learning, progress tracking, and competitive gamification.*

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [User Roles & Key Stakeholders](#-user-roles--key-stakeholders)
3. [Core Functional Modules](#-core-functional-modules)
4. [Business Rules Summary](#-business-rules-summary)
5. [System Scope, Assumptions & Dependencies](#-system-scope-assumptions--dependencies)
6. [Design System & UI/UX Guidelines](#-design-system--uiux-guidelines)
7. [Screen & Route Inventory](#-screen--route-inventory)

---

## 🌟 Project Overview

**RUQI (رُقِيّ)** is a modern educational digital platform designed to organize and streamline the learning journey for Arabic language students. It unifies educational content delivery, student assessments, automated evaluation, dynamic leaderboard rankings, subscription management, and direct support into a single cohesive ecosystem.

### Core Objectives:
* **Structured Learning:** Content hierarchically organized into **Educational Stages → Months → Sequential Content (Lessons & Exams)**.
* **Automated Assessment & Gamification:** Real-time scoring, automated exam grading, and a dynamic competitive level/leaderboard system based on earned points.
* **Subscription & Access Control:** Admin-managed month-level activation linked to student subscription requests and receipt verification via external channels (WhatsApp/InstaPay/Vodafone Cash).
* **Direct Support:** Single-tier follow-up system integrated with WhatsApp for rapid resolution.

---

## 👥 User Roles & Key Stakeholders

RUQI enforces **Role-Based Authorization (RBAC)** where every account has exactly one role:

| Role | Arabic Title | Description & Responsibilities |
| :--- | :--- | :--- |
| **Student** | طَالِب | Primary platform user. Enrolls in stages, accesses activated months, completes sequential lessons/exams, views scores, tracks progress, and competes on the leaderboard. |
| **Teacher** | مُعَلِّم | Single platform-level instructor responsible for creating and managing all Educational Stages, Months, Lessons, Homework, and Exams. Does not manage user profiles or subscriptions. |
| **Administrator** | أَدْمِن / إِدَارَة | Manages student profiles, user status (activation/deactivation), subscription requests, payment confirmations, month activation, and support requests. Does not edit educational content. |

---

## ⚙️ Core Functional Modules

### 1. 🔐 Authentication & Authorization (`FR-AUTH`)
* **Registration & Verification:** Student self-registration requires Name, Email, Password, Phone Number, Address, and Educational Stage. Email verification via **Email OTP (6 digits)** is mandatory before account activation (Pending → Active).
* **Authentication Mechanism:** Universal login mechanism using JWT (Access & Refresh Tokens) via Email and Password.
* **Predefined Accounts:** Single platform-level Teacher and Administrator credentials are pre-configured during deployment.
* **Password Management:** Authenticated current-password change and Email OTP-based forgotten password reset.

### 2. 👤 Profiles & Progress (`FR-PROFILE`, `FR-PROG`)
* **Student Profiles:** Stores unique auto-generated Student ID, Email, Name, Phone, Address, Stage, and Profile Image. Stage changes require explicit user confirmation and reset all accumulated points, progress, and activated months.
* **Hierarchy Progress Tracking:** 
  $$	ext{Educational Stage} \longrightarrow 	ext{Month} \longrightarrow 	ext{Lesson / Exam} \longrightarrow 	ext{Homework}$$
* **Lesson Completion Criteria:** A regular lesson is marked **Completed** only when all 3 required components are done:
  1. Video watched (`تمت المشاهدة`)
  2. Written Explanation read
  3. Associated Homework submitted
* **Sequential Access:** Students must complete the current required educational item before unlocking the next in the defined sequence. Revisiting completed items is always permitted.

### 3. 📚 Educational Content (`FR-EDU`)
* **Content Hierarchy:** Teacher constructs Stages containing Months. Each Month contains ordered Lessons and Exams.
* **Lesson Components:** Mandatory YouTube video URL, rich-text written explanation, MCQ homework, and optional book study note (`مطلوب مذاكرته من الكتاب`).
* **Exams:** MCQ-based assessments built into the sequential content flow (not isolated sections). Require a **50% minimum passing score**. Allows retakes (retains highest score). Automated evaluation upon submission.

### 4. 🏆 Scores & Leaderboard (`FR-SCORE`, `FR-LEADER`)
* **Point System:**
  * **Video Watched:** +10 Points (awarded once per lesson)
  * **Explanation Read:** +10 Points (awarded once per lesson)
  * **Homework Correct Answer:** +1 Point per correct choice
  * **Exam Correct Answer:** +1 Point per correct choice
* **Dynamic Level System:** Levels are dynamically calculated relative to student point density and competitive performance across the stage/platform (no static point ranges). Equal points yield equal level/rank.
* **Leaderboards:**
  * **Stage Leaderboard:** Top 10 students per Educational Stage.
  * **Platform Leaderboard:** Top 5 students platform-wide.
  * Current student position is always highlighted at the bottom if outside the top tier.

### 5. 💳 Subscriptions (`FR-SUB`)
* **Month-Level Subscriptions:** Subscriptions grant access per Month. Each month has an active/inactive status. Active subscriptions do not expire by time.
* **Subscription Request Workflow:**
  $$	ext{Subscription Section} \longrightarrow 	ext{Subscription Form} \longrightarrow 	ext{Request Saved} \longrightarrow 	ext{WhatsApp Redirect} \longrightarrow 	ext{Admin Payment Confirmation} \longrightarrow 	ext{Month Activation}$$
* **Preservation of Progress:** Deactivating a subscription locks access to the month's lessons/exams but preserves all completed progress, scores, and earned points intact.

### 6. 🎧 Follow-up & Support (`FR-FOLLOW`)
* **Unified Support:** Follow-up and Support represent the same functionality.
* **Request Lifecycle:** Requests include Request ID, Student ID, Title, Body, Status (`Pending`, `In Progress`, `Under Review`, `Resolved`), and Timestamps.
* **Communication Channel:** Requests are initiated in-app and handed off to **WhatsApp** for direct communication. No multi-message internal chat thread exists in the platform.

---

## 📜 Business Rules Summary

* **BR-AUTH-001..028:** Accounts strictly have 1 role. Email must be unique; phone number does not require uniqueness. Inactive/Pending accounts cannot log in.
* **BR-PROG-001..023:** Student ID & Email are immutable. Changing stage wipes progress and points. Deleting content deletes associated points from student totals.
* **BR-EDU-001..028:** Lessons and Exams share a single unified numerical sequence inside each month. Content deletion wipes associated student scores. Content published immediately (no draft mode).
* **BR-SCORE-001..028:** Retaking exams/homework always preserves the **highest score achieved**. Points cannot be manually altered by Admin or Teacher.
* **BR-SUB-001..026:** Subscriptions are indefinite unless manually deactivated by Admin. Duplicate active subscriptions for the same student and month are prevented.
* **BR-FOLLOW-001..019:** Support requests ordered chronologically (oldest first) for Admin view. Resolved requests remain stored for audit/history.

---

## 🌐 System Scope, Assumptions & Dependencies

### In-Scope
* Web Platform (RTL Native, Arabic-only, Light Mode).
* JWT Authentication with Email OTP verification.
* Full Teacher Content CRUD + MCQ Builders for Homework & Exams.
* Admin User Table, User Drawer, Subscriptions Approval, and Support Request Queue.
* Dynamic Leaderboard and Profile Progress visualizations.

### Out-of-Scope
* Mobile Native Apps (iOS/Android).
* In-app Direct Payment Gateways (e.g., Stripe, Paymob).
* In-app Internal Messaging / Live Chat / Video Conferencing.
* Automated Subscription Expiration / Time-based renewals.

### External Dependencies
* **Firebase:** Email OTP services (Email verification & Forgot password).
* **YouTube:** Educational video hosting and playback.
* **WhatsApp:** Payment receipt submission and support conversations.
* **Vodafone Cash & InstaPay:** Supported manual payment methods.

---

## 🎨 Design System & UI/UX Guidelines

### Brand Identity & Palette
* **Brand Name:** رُقِيّ | **Slogan:** "نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"
* **Primary Color:** Gold (`Primary Gold`, `Light Gold`, `Dark Gold`, `Muted Gold`).
* **Background:** Warm Off-white (`#FAF8F5` / `#FDFBF7` equivalent) across all pages.
* **Dark Surface:** Warm Dark Charcoal / Dark Brown (used for Footer and high-contrast components). Never pure black.
* **Typography:** Primary font **Cairo** (for Headings, Body, Nav, Forms, Tables). **أبجد هوز** style reserved exclusively for brand logo and visual decorative accents.
* **Theme:** **Light Mode Only**, Arabic-First, RTL Native.

### Visual Styling & Components
* **Aesthetics:** Modern Educational + Premium Minimal Islamic (subtle geometric framing, subtle pattern overlays, no old-fashioned religious site visuals).
* **Borders & Radii:** Consistent medium border-radius throughout all UI components. Soft, subtle elevated shadows.
* **Header:** Glassmorphism semi-transparent top bar. Morphs into a floating compact header on scroll. Active link highlighted with a Gold pill. Mobile uses a full-screen drawer sliding from the right.
* **Buttons:** Text-first, Gold fill with dark text (Primary), Gold outline (Secondary).

---

## 🖥️ Screen & Route Inventory

1. **Base Layout & Header/Footer:** Semi-transparent glass header + Dark charcoal footer.
2. **Loading Page:** Minimal RUQI logo with soft pulse/scale animation over low-opacity Islamic geometry.
3. **Home Page (`/`):** Centered Hero with dual CTA, Teacher Intro section, Platform Benefits, "How RUQI Works", and Key Statistics.
4. **Educational Stages (`/stages`):** Responsive grid of stage cards with progress indicators and background image + overlay.
5. **Months View (`/stages/:stageId`):** Month cards displaying total lessons, exams, progress, and locked state overlay (`🔒 غير متاح`).
6. **Sequential Content Flow (`/months/:monthId`):** Unified ordered list displaying interleaved lessons and exams (`الدرس الأول`, `الدرس الثاني`, `الاختبار الأول`, ...).
7. **Lesson Delivery (`/lessons/:lessonId`):** 
   * **Desktop:** Split view with main video/explanation area and collapsible RTL side navigation.
   * **Mobile:** Collapsible bottom/side drawer for content navigation.
8. **Video Player (`/lessons/:lessonId/video`):** Clean YouTube player with `تمت المشاهدة` completion trigger.
9. **Explanation Article (`/lessons/:lessonId/explanation`):** Rich-text Arabic typography view.
10. **Homework & Exam Interface (`/assignments/:id`, `/exams/:id`):** Clean, distraction-free MCQ interface with progress header (`السؤال 1 من 20`) and immediate score breakdown upon submission.
11. **Leaderboard Page (`/leaderboard`):** Dynamic ranking display with Gold/Silver/Bronze trophy callouts for Top 3 and sticky personal rank row.
12. **Auth & Profile Suite (`/login`, `/signup`, `/verify-otp`, `/profile`):** Centered forms, password strength meters, 6-digit OTP input, and comprehensive hierarchical progress meters.
13. **Management Page (`/management`):** Vertical stack containing "My Educational Subscriptions" with month request trigger and "Support & Follow-up" requests queue.
14. **Teacher Dashboard (`/teacher`):** Interactive educational hierarchy dashboard (Stages → Months → Lessons/Exams CRUD + MCQ Question Builder).
15. **Admin Dashboard (`/admin`):** Concise administrative portal featuring Student Management table + detail drawer, Subscription approval controls, and Support ticket status manager.
