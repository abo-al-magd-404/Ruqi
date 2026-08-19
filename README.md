# 📖 رُقِيّ (RUQI) — Project Documentation & UI/UX Specification

> **"نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"**  
> *A premium, Arabic-first educational platform for structured language learning, progress tracking, and competitive gamification.*

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [User Roles & Key Stakeholders](#-user-roles--key-stakeholders)
- [Core Functional Modules](#-core-functional-modules)
- [Business Rules Summary](#-business-rules-summary)
- [System Scope, Assumptions & Dependencies](#-system-scope-assumptions--dependencies)
- [Design System & UI/UX Guidelines](#-design-system--uiux-guidelines)
- [Color Palette & Animations](#-color-palette--animations)
- [Screen & Route Inventory](#-screen--route-inventory)

---

## 🌟 Project Overview

**RUQI (رُقِيّ)** is a modern educational digital platform designed to organize and streamline the learning journey for Arabic language students. It unifies educational content delivery, student progress tracking, competitive gamification, and administrative oversight.

### Core Objectives

- **Structured Learning:** Content hierarchically organized into **Educational Stages → Months → Sequential Content (Lessons & Exams)**
- **Automated Assessment & Gamification:** Real-time scoring, automated exam grading, and a dynamic competitive level/leaderboard system based on earned points
- **Subscription & Access Control:** Admin-managed month-level activation linked to student subscription requests and receipt verification via external channels (WhatsApp/InstaPay/Vodafone Cash)
- **Direct Support:** Single-tier follow-up system integrated with WhatsApp for rapid resolution

---

## 👥 User Roles & Key Stakeholders

RUQI enforces **Role-Based Authorization (RBAC)** where every account has exactly one role:

| Role | Arabic Title | Description & Responsibilities |
| :--- | :--- | :--- |
| **Student** | طَالِب | Primary platform user. Enrolls in stages, accesses activated months, completes sequential lessons/exams, views scores, tracks progress, and competes on the leaderboard. Receives notifications for new content and subscription updates. |
| **Teacher** | مُعَلِّم | Single platform-level instructor responsible for creating and managing all Educational Stages, Months, Lessons, Homework, and Exams. Does not manage user profiles or subscriptions. |
| **Administrator** | أَدْمِن / إِدَارَة | Manages student profiles, user status (activation/deactivation), subscription requests, payment confirmations, month activation, and support requests. |

---

## ⚙️ Core Functional Modules

### 1. 🔐 Authentication & Authorization (`FR-AUTH`)

- **Registration & Verification:** Student self-registration requires Name, Email, Password, Phone Number, Address, and Educational Stage. Email verification via **Email OTP (6 digits)** is mandatory
- **Authentication Mechanism:** Universal login mechanism using JWT (Access & Refresh Tokens) via Email and Password
- **Predefined Accounts:** Single platform-level Teacher and Administrator credentials are pre-configured during deployment
- **Password Management:** Authenticated current-password change and Email OTP-based forgotten password reset

### 2. 👤 Profiles & Progress (`FR-PROFILE`, `FR-PROG`)

- **Student Profiles:** Stores unique auto-generated Student ID, Email, Name, Phone, Address, Stage, and Profile Image. Stage changes require explicit user confirmation and reset all accumulated points
- **Hierarchy Progress Tracking:**
  ```
  Educational Stage → Month → Lesson / Exam → Homework
  ```
- **Lesson Completion Criteria:** A regular lesson is marked **Completed** only when all 3 required components are done:
  1. ✅ Video watched (`تمت المشاهدة`)
  2. ✅ Written Explanation read
  3. ✅ Associated Homework submitted
- **Sequential Access:** Students must complete the current required educational item before unlocking the next in the defined sequence. Revisiting completed items is always permitted

### 3. 📚 Educational Content (`FR-EDU`)

- **Content Hierarchy:** Teacher constructs Stages containing Months. Each Month contains ordered Lessons and Exams
- **Lesson Components:** Mandatory YouTube video URL, rich-text written explanation, MCQ homework, and optional book study note (`مطلوب مذاكرته من الكتاب`)
- **Exams:** MCQ-based assessments built into the sequential content flow (not isolated sections). Require a **50% minimum passing score**. Allows retakes (retains highest score). Automated evaluation

### 4. 🏆 Scores & Leaderboard (`FR-SCORE`, `FR-LEADER`)

- **Point System:**
  - **Video Watched:** +10 Points (awarded once per lesson)
  - **Explanation Read:** +10 Points (awarded once per lesson)
  - **Homework Correct Answer:** +1 Point per correct choice
  - **Exam Correct Answer:** +1 Point per correct choice
- **Dynamic Level System:** Levels are dynamically calculated relative to student point density and competitive performance across the stage/platform (no static point ranges). Equal points yield equal levels
- **Leaderboards:**
  - **Stage Leaderboard:** Top 10 students per Educational Stage
  - **Platform Leaderboard:** Top 5 students platform-wide
  - Current student position is always highlighted at the bottom if outside the top tier

### 5. 💳 Subscriptions (`FR-SUB`)

- **Month-Level Subscriptions:** Subscriptions grant access per Month. Each month has an active/inactive status. Active subscriptions do not expire by time
- **Subscription Request Workflow:**
  ```
  Subscription Section → Subscription Form → Request Saved → WhatsApp Redirect → Admin Payment Confirmation
  ```
- **Preservation of Progress:** Deactivating a subscription locks access to the month's lessons/exams but preserves all completed progress, scores, and earned points intact

### 6. 🎧 Follow-up & Support (`FR-FOLLOW`)

- **Unified Support:** Follow-up and Support represent the same functionality
- **Request Lifecycle:** Requests include Request ID, Student ID, Title, Body, Status (`Pending`, `In Progress`, `Under Review`, `Resolved`), and Timestamps
- **Communication Channel:** Requests are initiated in-app and handed off to **WhatsApp** for direct communication. No multi-message internal chat thread exists in the platform

---

## 📜 Business Rules Summary

| Rule Category | Key Rules |
| :--- | :--- |
| **Authentication (BR-AUTH)** | Accounts strictly have 1 role. Email must be unique; phone number does not require uniqueness. Inactive/Pending accounts cannot log in. |
| **Progress (BR-PROG)** | Student ID & Email are immutable. Changing stage wipes progress and points. Deleting content deletes associated points from student totals. |
| **Educational Content (BR-EDU)** | Lessons and Exams share a single unified numerical sequence inside each month. Content deletion wipes associated student scores. Content published immediately (no draft mode). |
| **Scoring (BR-SCORE)** | Retaking exams/homework always preserves the **highest score achieved**. Points cannot be manually altered by Admin or Teacher. |
| **Subscriptions (BR-SUB)** | Subscriptions are indefinite unless manually deactivated by Admin. Duplicate active subscriptions for the same student and month are prevented. |
| **Support (BR-FOLLOW)** | Support requests ordered chronologically (oldest first) for Admin view. Resolved requests remain stored for audit/history. |

---

## 🌐 System Scope, Assumptions & Dependencies

### In-Scope ✅

- Web Platform (RTL Native, Arabic-only, Light Mode)
- JWT Authentication with Email OTP verification
- Full Teacher Content CRUD + MCQ Builders for Homework & Exams
- Admin User Table, User Drawer, Subscriptions Approval, and Support Request Queue
- Dynamic Leaderboard and Profile Progress visualizations

### Out-of-Scope ❌

- Mobile Native Apps (iOS/Android)
- In-app Direct Payment Gateways (e.g., Stripe, Paymob)
- In-app Internal Messaging / Live Chat / Video Conferencing
- Automated Subscription Expiration / Time-based renewals

### External Dependencies 🔗

- **Firebase:** Email OTP services (Email verification & Forgot password)
- **YouTube:** Educational video hosting and playback
- **WhatsApp:** Payment receipt submission and support conversations
- **Vodafone Cash & InstaPay:** Supported manual payment methods

---

## 🎨 Design System & UI/UX Guidelines

### Brand Identity

- **Brand Name:** رُقِيّ
- **Slogan:** "نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"
- **Theme:** Light Mode Only, Arabic-First, RTL Native
- **Aesthetic:** Modern Educational + Premium Minimal Islamic (subtle geometric framing, subtle pattern overlays, no old-fashioned religious site visuals)

### Typography

- **Primary Font:** [Cairo](https://fonts.google.com/specimen/Cairo) — Used for Headings, Body, Navigation, Forms, and Tables
- **Decorative Font:** أبجد هوز — Reserved exclusively for brand logo and visual decorative accents
- **Hierarchy:**
  - **H1:** 2.5rem (40px) | Bold | Letter-spacing: 0.5px
  - **H2:** 2rem (32px) | Semi-Bold | Letter-spacing: 0.3px
  - **H3:** 1.5rem (24px) | Semi-Bold | Letter-spacing: 0.2px
  - **Body:** 1rem (16px) | Regular | Line-height: 1.6
  - **Small:** 0.875rem (14px) | Regular | Line-height: 1.5

### Borders & Spacing

- **Border Radius:** Medium across all UI components (8px - 12px)
- **Box Shadow:** Soft, subtle elevated shadows (0 2px 8px rgba(0,0,0,0.08))
- **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px

---

## 🎨 Color Palette & Animations

### Color System

#### Primary Colors
```
Primary Gold:        #D4AF37
Light Gold:          #F4E4C1
Dark Gold:           #8B7618
Muted Gold:          #C4A747 (with transparency: rgba(196, 167, 71, 0.1))
```

#### Background & Surface
```
Off-White:           #FAF8F5 (Primary background)
Warm Off-White:      #FDFBF7 (Secondary background)
White:               #FFFFFF (Card backgrounds)
```

#### Text & Dark Surfaces
```
Text Primary:        #2D2D2D (Main text on light backgrounds)
Text Secondary:      #666666 (Secondary text, labels)
Text Muted:          #999999 (Disabled, hint text)
Dark Surface:        #1A1A1A (Footer, dark components) — Never pure black
```

#### Semantic Colors
```
Success:             #4CAF50
Warning:             #FF9800
Error:               #F44336
Info:                #2196F3
Disabled:            #E0E0E0
```

### Animation Library

#### 1. **Fade In** (Page Transitions)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 0.6s | Easing: ease-in-out | Delay: 0s */
```

#### 2. **Slide In Down** (Header)
```css
@keyframes slideInDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
/* Duration: 0.5s | Easing: cubic-bezier(0.34, 1.56, 0.64, 1) */
```

#### 3. **Slide In Up** (Content Cards)
```css
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
/* Duration: 0.6s | Easing: ease-out | Stagger: 0.1s between items */
```

#### 4. **Scale & Pulse** (Loading Logo)
```css
@keyframes scalePulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
/* Duration: 2s | Easing: ease-in-out | Loop: infinite */
```

#### 5. **Hover Elevation** (Interactive Elements)
```css
@keyframes hoverElevation {
  from { transform: translateY(0); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  to { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.15); }
}
/* Duration: 0.3s | Easing: ease-out */
```

#### 6. **Gold Shimmer** (Premium Accent)
```css
@keyframes goldShimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
/* Duration: 2s | Easing: linear | Loop: infinite */
/* Background: linear-gradient(90deg, #D4AF37, #F4E4C1, #D4AF37) */
```

#### 7. **Slide In Right** (Side Navigation)
```css
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
/* Duration: 0.4s | Easing: cubic-bezier(0.34, 1.56, 0.64, 1) */
```

#### 8. **Bounce** (Achievement/Score Update)
```css
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
/* Duration: 0.6s | Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55) */
```

#### 9. **Fade in Text** (Typography)
```css
@keyframes fadeInText {
  from { opacity: 0; letter-spacing: 2px; }
  to { opacity: 1; letter-spacing: 0; }
}
/* Duration: 0.8s | Easing: ease-out | Used for headings */
```

#### 10. **Rotate** (Loading Spinner)
```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* Duration: 1.5s | Easing: linear | Loop: infinite */
```

### Component Animation Guidelines

#### Buttons
- **Default State:** No animation
- **Hover:** Elevation (0.3s) + subtle background color shift
- **Active/Click:** Brief scale (0.95) with 0.2s duration
- **Disabled:** Opacity 0.5, no hover effect

#### Cards & Containers
- **Page Load:** Slide In Up (0.6s) with staggered delays (0.1s between items)
- **Hover:** Subtle elevation (translateY -4px) + shadow enhancement (0.3s)

#### Forms & Inputs
- **Focus:** Border color change to Gold (#D4AF37) with 0.2s transition
- **Error State:** Shake animation (translateX -5px) + red border
- **Success State:** Fade In Success Icon + green checkmark

#### Progress Indicators
- **Bar Fill:** Smooth width transition (0.5s) using ease-out
- **Percentage Number:** Count-up animation from 0 to final value (0.8s)

#### Leaderboard
- **Rank Change:** Bounce animation (0.6s) when position changes
- **Trophy Animation:** Subtle spin on Top 3 ranks
- **Highlight:** Gold shimmer on current user row

#### Modals & Drawers
- **Open:** Fade background (0.3s) + Slide In (0.4s)
- **Close:** Reverse animation (0.3s)

---

## 🖥️ Screen & Route Inventory

### 1. **Loading Page** (`/loading`)
- Minimal RUQI logo with soft pulse/scale animation over low-opacity Islamic geometry
- Background: Off-white with subtle geometric pattern overlay
- Animation: Scale pulse (2s) + fade in decorative elements

### 2. **Home Page** (`/`)
- Centered Hero with dual CTA buttons
- Teacher Intro section with gold accent line
- Platform Benefits (animated cards on scroll)
- "How RUQI Works" timeline visualization
- Key Statistics with counter animations
- Footer with dark charcoal background

### 3. **Educational Stages** (`/stages`)
- Responsive grid of stage cards
- Progress indicators with animated bars
- Background image + gold overlay on hover
- Slide in up animation on page load

### 4. **Months View** (`/stages/:stageId`)
- Month cards displaying total lessons, exams, and progress
- Locked state overlay (`🔒 غير متاح`) with blur effect
- Hover elevation with gold shadow
- Staggered slide in animations

### 5. **Sequential Content Flow** (`/months/:monthId`)
- Unified ordered list displaying interleaved lessons and exams
- Lesson numbering (`الدرس الأول`, `الدرس الثاني`, `الاختبار الأول`)
- Progress bar at top showing completion percentage
- Smooth transitions between content sections

### 6. **Lesson Delivery** (`/lessons/:lessonId`)
- **Desktop:** Split view with main video/explanation area and collapsible RTL side navigation
- **Mobile:** Collapsible bottom/side drawer for content navigation
- Completion checkmarks with bounce animation
- Smooth transitions between video, explanation, and homework

### 7. **Video Player** (`/lessons/:lessonId/video`)
- Clean YouTube embedded player with custom controls
- `تمت المشاهدة` (Watched) completion trigger with success animation
- Progress bar with gold accent
- RTL video controls

### 8. **Explanation Article** (`/lessons/:lessonId/explanation`)
- Rich-text Arabic typography with optimized line-height
- Fade in text animation on load
- Code blocks and media with subtle borders
- Scrollable container with smooth transitions

### 9. **Homework & Exam Interface** (`/assignments/:id`, `/exams/:id`)
- Clean, distraction-free MCQ interface
- Progress header (`السؤال 1 من 20`)
- Animated option selection with highlight
- Score breakdown modal on completion with bounce animation
- Percentage circle with animated fill

### 10. **Leaderboard Page** (`/leaderboard`)
- Dynamic ranking display with Gold/Silver/Bronze trophy callouts for Top 3
- Current student rank always highlighted at bottom if outside top tier
- Animated rank changes with bounce effect
- Gold shimmer on trophy icons
- Animated counter for rank position

### 11. **Auth & Profile Suite**
- **Login** (`/login`): Centered form, password strength meter
- **Signup** (`/signup`): Multi-step registration with fade transitions
- **Verify OTP** (`/verify-otp`): 6-digit OTP input with focus animations
- **Profile** (`/profile`): Comprehensive hierarchical progress meters with animated fills
- **Password Reset:** Email + OTP verification flow

### 12. **Management Page** (`/management`)
- Vertical stack layout
- "My Educational Subscriptions" section with month request trigger
- "Support & Follow-up" requests queue with status badges
- Smooth expand/collapse animations for sections

### 13. **Teacher Dashboard** (`/teacher`)
- Interactive educational hierarchy dashboard
- Stages → Months → Lessons/Exams CRUD
- MCQ Question Builder with real-time preview
- Animated drag-and-drop for content reordering
- Form validation with error animations

### 14. **Admin Dashboard** (`/admin`)
- Concise administrative portal layout
- Student Management table + detail drawer (slide in right animation)
- Subscription approval controls with status transitions
- Support ticket status manager with priority coloring
- Action buttons with hover elevations and gold accents

---

## 🎬 Micro-interaction Guidelines

### Button Interactions
```
Default → Hover (0.3s ease-out) → Active (0.2s) → Released
- Hover: Translate Y -4px, Shadow increase, Background lighten
- Active: Scale 0.95
```

### Form Validation
```
Typing → Validation Check (real-time) → Valid State (Green border + checkmark fade in)
- Error: Red border + shake (0.4s)
- Success: Green check icon + bounce (0.6s)
```

### Notification Toast
```
Triggered → Slide in from top (0.4s) → Display (3s) → Slide out (0.4s)
- Colors: Success (green), Error (red), Warning (orange), Info (blue)
```

---

## 📝 Implementation Notes

- All animations should use `will-change` for performance optimization
- Provide `prefers-reduced-motion` media query alternatives for accessibility
- Test animations on lower-end devices for smooth performance
- Use CSS transitions for simple state changes, CSS animations for complex sequences
- Consider dark mode variants for future scalability

---

## 📞 Support & Contact

For questions or contributions to this specification, please open an issue or contact the development team via the support channels outlined in the platform.

---

**Last Updated:** August 2026 | **Version:** 1.0.0