# رُقِيّ (RUQI) — Front-End

> **"نَرْتَقِي بِاللُّغَةِ، لِتَرْتَقِي بِالْعِلْمِ"**
>
> The front-end for the RUQI educational platform — a fully Arabic, RTL, light-mode Next.js application.

---

## ✨ Overview

The RUQI front-end is a **Next.js (App Router)** application that delivers the entire student + teacher experience over a REST API:

- **Student journey:** browse educational stages → months → sequential lessons/exams, watch videos, read explanations, submit MCQ homework, take timed exams, track progress, view the leaderboard.
- **Teacher journey:** full content management dashboard — create/edit/delete/reorder stages, months, lessons, and exams with an MCQ builder.
- **Account suite:** 2-step signup (data → avatar picker), email OTP verification, login, forgot/reset password, profile editing, and fully customizable avatars.

All UI text, error messages, dates, and layout are **Arabic-first and RTL-native**; the design is light-mode with the premium gold/off-white brand palette and the Cairo typeface.

---

## 🧱 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.3.2 | App Router, Server/RSC support, Rewrites proxy |
| React | 19.2.8 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Styling (`@tailwindcss/postcss`, design tokens in `globals.css`) |
| Framer Motion | 13.x | Page/element animations |
| Lucide React | 1.x | Icons |
| @dicebear/core + @dicebear/styles | 10.x | DiceBear avatars (Glyphs style, seed-based) |

---

## 📁 Project Structure

```
front-end/
├── app/                                 # App Router routes
│   ├── layout.tsx                       # Root layout: <html lang="ar" dir="rtl"> + Cairo font + <SiteChrome>
│   ├── globals.css                      # Design tokens + component classes
│   ├── page.tsx                         # Home (/) — hero + platform stats
│   ├── loading.tsx                      # Branded loading screen
│   ├── not-found.tsx                    # 404 page
│   │
│   ├── educational-content/
│   │   ├── page.tsx                     # Stages catalog (/educational-content)
│   │   ├── stage/[stageId]/page.tsx     # Months of a stage
│   │   ├── month/[monthId]/page.tsx     # Month content (interleaved lessons/exams) + subscribe button
│   │   ├── content/[contentId]/
│   │   │   ├── page.tsx                 # Lesson: video + explanation + sidebar
│   │   │   └── assignment/{page,result,review}/  # Homework MCQ flow
│   │   ├── exam/[contentId]/
│   │   │   ├── page.tsx                 # Exam overview
│   │   │   ├── take/page.tsx            # Timed exam screen (chrome hidden)
│   │   │   └── {result,review}/         # Exam result & review (chrome hidden)
│   │   └── module/                      # dashboard/sections/modals hooks + site-chrome
│   │                                    #  (site-chrome hides Navbar/Footer on exam & assignment screens)
│   │
│   ├── account/
│   │   ├── page.tsx                     # Auth landing (login / register)
│   │   ├── {login,register,verify-email,forgot-password}/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── choose-avatar/page.tsx       # Optional standalone avatar picker (GuestGuard)
│   │   ├── profile/page.tsx             # Profile + progress + teacher dashboard
│   │   └── module/                      # auth-form (2-step signup incl. avatar), AvatarPicker, password-field, GuestGuard
│   │       └── profile/module/          # profile, avatar rendering, modals
│   │
│   ├── leaderboard/page.tsx             # Rankings (/leaderboard)
│   └── support/page.tsx                 # Support request
│
├── components/                          # Shared chrome — Navbar & Footer only
│                                         #  (one file each; nothing else lives here)
│
├── public/
│   └── teacher-image.png                # Static photo shown for TEACHER accounts (not an avatar)
│
├── lib/                                 # Client-side logic & API clients
│   ├── tokens/tokens.ts                 # Access/refresh token storage + refresh rotation
│   ├── core/http.ts                     # authedFetch, authedJson, error helpers + signup "pending" name/email
│   ├── account/                         # auth + profile API clients
│   ├── educational-content/             # stages, months, content, stats API clients
│   ├── avatar.ts                        # DiceBear (Glyphs) avatar engine (single source of truth)
│   ├── progress.ts                      # Student progress (localStorage)
│   ├── leaderboard.ts                   # Leaderboard API client
│   ├── password.ts                      # Password strength scoring
│   └── types/                           # Domain types (no barrel)
```

**Convention:** every route folder holds only its `page.tsx`; all supporting files (modals, hooks, sections, types) live in a colocated **`module/`** subfolder.

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20+**
- A running RUQI backend (see the repo's backend docs / `back-end/APIs.md`)

### Install & run

```bash
npm install
npm run dev        # http://localhost:3000
```

### API wiring

All API calls go to the relative base `/api/backend`, which Next.js rewrites to the remote API server:

```ts
// next.config.ts
const REMOTE_API_URL =
  process.env.API_BASE_URL_ENV ?? "https://app-6a995274.deploy.meerasolution.com";
```

`/api/backend/auth/login` ⇒ `{API_BASE_URL_ENV}/auth/login`.

Override the origin locally with `API_BASE_URL_ENV`:

```bash
# .env.local
API_BASE_URL_ENV=http://localhost:8000
```

---

## 🔑 Authentication & Tokens

- After login/refresh, **access + refresh tokens** are stored in `localStorage` under `ruqi_access_token` / `ruqi_refresh_token` (`lib/tokens/tokens.ts`).
- `lib/core/http.ts` exposes `authedFetch` / `authedJson`, which attach `Authorization: Bearer <token>` and automatically retry once with a refreshed token on `401`.
- Guests are redirected via `account/module/GuestGuard.tsx`; authenticated users via `isAuthenticated()`.

---

## 🖼️ Avatars

`lib/avatar.ts` is the **single source of truth** for the avatar system (DiceBear **Glyphs**, v10):

- **Options** — `AvatarOptions { seed, glyphColor, shapeVariant }` with exported
  `GLYPHS_PALETTE` (7 colors) and `GLYPHS_SHAPE_VARIANTS` (35 glyph literals) (ui: `AvatarPicker`).
- **Rendering** — `avatarDataUri()` renders SVG **client-side and caches it**; `resolveAvatarSrc()` decides
  image-vs-dicebear for a stored value. No network round-trip for avatars.
- **Storage format** — a plain **seed** string when uncustomized; a **DiceBear SVG URL** when any option is
  customized (`avatarStringFromOptions()` / `parseAvatarValue()` handle both directions).
- **Customization UI** — `AvatarPicker` (in `app/account/module/`) with color swatches, a horizontal row of the 35
  glyph shapes, a seed field, and a shuffle button; used by the 2nd signup step and the profile editor.
- **Roles** — `STUDENT` accounts get a Glyphs avatar; `TEACHER` accounts always render the static photo
  `/teacher-image.png` (their real picture, **not** an avatar).

> **Pending-avatar flow (front-end only).** The signup API does not accept an `avatar` field, so the avatar chosen
> during the 2nd signup step is kept in `localStorage` (`ruqi_pending_avatar`, via `pendingAvatarStorage()`) and
> applied automatically on first login through `updateStudentProfile({ avatar })` — no backend change required.

---

## 🧪 Scripts

```bash
npm run dev          # next dev
npm run build        # production build
npm run start        # start the production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript type check
```

---

## 🧭 Design Notes

- **RTL native** — `dir="rtl"` set at the root; layouts are mirrored, not tempted to flip.
- **Light theme only** — warm off-white background, gold primary palette, dark charcoal surfaces (never pure black).
- **Typeface** — Cairo for all UI text; brand/decorative glyphs reserved for the logo.
- **Design tokens** — colors, radii, and control styles are centralized in `app/globals.css` (Tailwind v4 `@theme`).

---

## 📖 Related Docs

- **API reference** → `../back-end/APIs.md`
- **Full UI/UX specification** → `../docs/RUQI UI-UX Design Documentation.md`
- **Root project spec** → `../README.md`