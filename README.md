# PASIRI PORTFOLIO & CMS

A complete, production-ready personal portfolio website and full-stack Content Management System (CMS) designed for **pasiri** — Design Technologist & Software Architect.

---

## 🌟 Overview & Features

1. **Public Portfolio Website** — Minimal, editorial, and atmospheric digital home.
2. **Project / Case Study Platform** — In-depth architectural case studies with arbitrary content blocks.
3. **Activities & Events Explorer** — Two-column sticky editorial index on desktop, responsive collapsible selector on mobile.
4. **Blog & Long-Form Essays** — Optimized reading typography (65–75 characters measure), estimated reading times, sticky desktop Table of Contents.
5. **Experience & Education** — Clean itemized vertical career journey without decorative icon clutter.
6. **Skills & Certifications** — Categorized skill matrix (no fake percentage bars) and verifiable credentials.
7. **Process Timeline Content Block** — Dedicated numbered step timeline content block with connecting guides inside Articles, Projects, and Activities.
8. **Smokeveil Aura Background** — GPU-accelerated atmospheric background with base `#100e0b`, 3 blurred gradient layers (`screen`/`soft-light` in dark, `multiply` in light), and SVG fractal-noise film grain.
9. **Unified Global Search** — Accessible `Ctrl + K` / `Cmd + K` search modal across projects, activities, blog posts, skills, and certifications.
10. **Full Headless/Modular CMS Dashboard** — Full CRUD management for Projects, Activities, Blog, Experience, Skills, Certifications, Profile, Media Library, Revisions, Homepage Sections, Navigation Menu, and Appearance design tokens.
11. **Tiptap Rich-Text Editor** — Structured prose editor with embedded Process Timeline builder, media insertion, and debounced autosave indicators (`Saving...` / `Saved ✓`).
12. **Live Preview System** — Live side-by-side preview for drafts and published content.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Components & Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Radix UI Primitives (shadcn/ui architecture)
- **Database & ORM**: Prisma ORM (SQLite for local zero-dependency development, PostgreSQL ready)
- **Rich Text**: Tiptap Editor (Headless ProseMirror)
- **Icons**: Lucide React
- **Authentication**: Jose JWT with signed HTTP-only cookies and bcrypt password hashing
- **Validation**: Zod + React Hook Form

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18 (Tested on v24)
- npm >= 9

### 2. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Default configuration in `.env`:
```ini
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="pasiri@example.com"
ADMIN_PASSWORD="pasiripassword2026"
SESSION_SECRET="pasiri-super-secure-session-secret-key-at-least-32-chars-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="pasiri Portfolio"
```

### 3. Database Initialization & Seeding
Generate Prisma client, synchronize database schema, and seed realistic content for **pasiri**:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin CMS Access

- **Portal URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Seeded Credentials**:
  - **Email**: `pasiri@example.com`
  - **Password**: `pasiripassword2026`

---

## 📁 Project Architecture

```
├── app/
│   ├── (public)/                 # Public-facing portfolio routes
│   │   ├── page.tsx              # Editorial Homepage
│   │   ├── about/                # Bio, philosophy, education
│   │   ├── experience/           # Itemized career journey
│   │   ├── projects/             # Project showcase & case studies
│   │   │   └── [slug]/           # Dynamic case study
│   │   ├── activities/           # Master-detail editorial explorer
│   │   │   └── [slug]/           # Direct activity share link
│   │   ├── blog/                 # Articles & essays index
│   │   │   └── [slug]/           # Long-form reader with sticky TOC
│   │   ├── skills/               # Categorized skills matrix
│   │   ├── certifications/       # Verified credentials
│   │   ├── resume/               # Structured resume + PDF action
│   │   └── contact/              # Accessible form with anti-spam
│   ├── admin/                    # Admin CMS dashboard suite
│   │   ├── page.tsx              # Overview metrics & quick actions
│   │   ├── login/                # Authentication portal
│   │   ├── projects/             # Project CRUD & case study editor
│   │   ├── activities/           # Activities CRUD
│   │   ├── blog/                 # Blog CRUD & long-form composer
│   │   ├── experience/           # Experience CRUD
│   │   ├── skills/               # Skills & categories CRUD
│   │   ├── certifications/       # Certifications CRUD
│   │   ├── profile/              # Profile, bio & resume uploader
│   │   ├── media/                # Media Library manager
│   │   ├── website/              # Homepage sections, Navigation, Appearance, SEO
│   │   └── settings/             # Master password rotation & security
│   ├── api/                      # REST & Server Action endpoints
│   ├── layout.tsx                # Root layout (Inter, Geist Mono, theme providers)
│   ├── sitemap.ts                # Dynamic XML sitemap generator
│   └── robots.ts                 # Dynamic robots.txt
├── components/
│   ├── backgrounds/
│   │   └── Smokeveil.tsx         # Atmospheric aura background engine
│   ├── layout/
│   │   ├── Header.tsx            # CMS-driven navigation header
│   │   ├── Footer.tsx            # Colophon & dynamic year footer
│   │   ├── CommandMenu.tsx       # Global Ctrl+K search dialog
│   │   └── ThemeToggle.tsx       # Dark/Light theme switcher
│   ├── content/
│   │   ├── BlockRenderer.tsx     # Universal structured block renderer
│   │   └── ProcessTimelineBlock.tsx # Numbered step timeline component
│   ├── editor/
│   │   ├── RichTextEditor.tsx    # Tiptap rich-text editor
│   │   └── ProcessTimelineEditor.tsx # Interactive step milestone composer
│   └── ui/                       # Radix UI / shadcn design primitives
├── lib/
│   ├── auth/session.ts           # Jose JWT & HTTP-only cookies
│   ├── db/prisma.ts              # Prisma singleton client
│   ├── storage/index.ts          # File upload & MIME validation
│   ├── validation/schemas.ts     # Zod schemas
│   └── utils.ts                  # Utility helpers & date formatters
├── prisma/
│   ├── schema.prisma             # Relational data model
│   └── seed.mjs                  # Comprehensive seed script
└── styles/
    └── globals.css               # Design tokens & editorial styling
```

---

## 🎨 Smokeveil Background Calculus

The **Smokeveil** component provides an organic visual atmosphere without compromising readability:
- **Base Canvas**: `#100e0b` applied directly to `<body>`.
- **Layer 1 (Linear 155°)**: `blur(175px / 252px)` (`screen` in dark, `multiply` in light).
- **Layer 2 (Radial 70% 42%)**: `blur(163px / 234px)` (`screen` in dark, `multiply` in light).
- **Layer 3 (Linear 25°)**: `blur(113px / 162px)` (`soft-light` in dark, `multiply` in light).
- **Grain Layer**: SVG `feTurbulence` (fractalNoise, 0.7 base frequency) with custom color matrix.

---

## 🛡️ Security & Performance Standards

- **Server-Side Authorization**: Protected `/admin` routes using signed HTTP-only cookies and JWT verification.
- **Content Sanitization**: Structured JSON blocks with strictly typed nodes, preventing arbitrary XSS injections.
- **File Upload Safeguards**: MIME allowlist, 10MB size enforcement, sanitized filename hashing.
- **Accessibility**: WCAG 2.2 AA compliant contrast, visible focus rings, ARIA landmarks, keyboard-friendly command search.
