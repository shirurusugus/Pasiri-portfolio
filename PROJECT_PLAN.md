# PASIRI PORTFOLIO — PROJECT PLAN & ARCHITECTURE

## 1. Project Overview & Objective

**PASIRI PORTFOLIO** is a production-ready, editorial-grade personal portfolio website and comprehensive Headless/Full-Stack Content Management System (CMS) designed for **pasiri**.

The system functions across 6 core pillars:
1. **Public Portfolio Website** — Minimal, editorial, atmospheric showcase for identity and philosophy.
2. **Project / Case Study Platform** — In-depth architectural case studies with arbitrary content blocks.
3. **Activity Showcase** — Competitions, bootcamps, workshops, teaching, exhibitions with sticky editorial side navigation.
4. **Personal Blog & Writing Platform** — Long-form editorial articles with sticky Table of Contents and rich media.
5. **Experience & Credentials** — Itemized, clean vertical career journey (without decorative clutter) + verified certifications + categorized skills.
6. **Full Admin / CMS Dashboard** — Full CRUD, media library, process timeline builder, revision history, preview, autosave, appearance tokens, navigation manager, and SEO controls.

---

## 2. Existing Codebase Inspection & Gap Analysis

- **Current Workspace State**: Clean slate / empty directory (`d:/pasiri4_portfolio`).
- **Target Runtime**: Node.js v24.18.0, npm 11.13.0, TypeScript strict mode, Next.js 15+ (App Router).
- **Missing Architecture to Build**:
  - Full Next.js project scaffold with Tailwind CSS, Lucide icons, and shadcn/ui primitives.
  - Complete Prisma schema matching PostgreSQL requirements (with SQLite/Postgres dual-support or direct Postgres adapter capability for zero-friction local and production operation).
  - Smokeveil Aura background engine (`#100e0b` dark base + dual theme math with `screen`/`soft-light` for dark, `multiply` for light, and SVG fractal noise color-matrix grain).
  - Clean modular folder structure (`app/(public)`, `app/admin`, `app/api`, `components/editor`, `components/backgrounds`, `lib/auth`, etc.).
  - Tiptap rich content editor with custom extensions (Process Timeline block, safe media embeds, syntax code blocks, callouts, galleries).
  - Secure Authentication layer (credentials with bcrypt hashing, signed HTTP-only cookies, session guards, server-side route protection).
  - Media Library with local/cloud object storage abstraction, file-type & dimension validation, safe filename hashing, and metadata extraction.
  - Live Preview system, revision rollback, and autosave indicators.

---

## 3. Technology Stack & Design Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Framework** | Next.js (App Router, React 19 / Server Components) | Fast streaming SSR, optimal SEO, zero-bundle overhead on public reads, tight server-action integration. |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety across database, API routes, editor schemas, and UI components. |
| **Styling & UI** | Tailwind CSS + Radix UI / shadcn/ui primitives | Curated token system, WCAG 2.2 AA compliant contrast, no heavy UI framework lock-in. |
| **Icons** | Lucide React | Clean, lightweight, uniform icon set with accessible screen-reader labels. |
| **ORM & Database** | Prisma ORM with PostgreSQL / SQLite driver | Structured relations, type-safe migrations, revision snapshots, seed automation. |
| **Validation** | Zod + React Hook Form | Dual client/server validation, robust schema enforcement on dynamic content blocks. |
| **Rich Text Editor** | Tiptap (Headless ProseMirror) | Full control over JSON document model, custom block nodes (Process Timeline, Callouts, Safe Video). |
| **Authentication** | Secure Jose / Iron-Session / Auth.js standard | Robust server-side session cookies, bcrypt password hashing, CSRF resistance. |
| **Motion** | Framer Motion (Restrained & Accessible) | Strictly respect `prefers-reduced-motion`; no unnecessary continuous GPU drains. |

---

## 4. Visual Design & Smokeveil Background Architecture

### 4.1 Base Color & Layout Constraints
- Base background `#100e0b` applied directly to `<body>` or root viewport wrapper.
- The `Smokeveil` container is `position: relative` with `min-height: 100vh`, strictly **transparent** (NO background color), permitting blend modes to composite directly against `#100e0b`.
- All decorative gradient layers and SVG grain overlay are set to `position: absolute; inset: 0; pointer-events: none; aria-hidden="true"`.
- Page content is isolated in `position: relative; z-index: 1`.

### 4.2 Layer Math & Responsive Blurs
- **Layer 1 (Linear Gradient 155deg)**:
  - Gradient: `transparent 8%, rgba(30,75,68,0.12) 28%, rgba(45,112,99,0.25) 43%, rgba(23,65,59,0.18) 59%, transparent 82%`
  - Dark Mode: `mix-blend-mode: screen` | Light Mode: `mix-blend-mode: multiply`
  - Blur: Mobile `175px`, Desktop `252px` (`transform: translateZ(0); will-change: transform;`)
- **Layer 2 (Radial Gradient 70% 42% at 45% 50%)**:
  - Gradient: `rgba(40,111,99,0.25) 0%, rgba(20,61,55,0.12) 48%, transparent 82%`
  - Opacity: `0.9` | Dark Mode: `mix-blend-mode: screen` | Light Mode: `mix-blend-mode: multiply`
  - Blur: Mobile `163px`, Desktop `234px`
- **Layer 3 (Linear Gradient 25deg)**:
  - Gradient: `transparent 25%, rgba(90,151,135,0.07) 50%, transparent 75%`
  - Opacity: `0.8` | Dark Mode: `mix-blend-mode: soft-light` | Light Mode: `mix-blend-mode: multiply`
  - Blur: Mobile `113px`, Desktop `162px`
- **Grain Overlay (SVG feTurbulence)**:
  - `type="fractalNoise"`, `baseFrequency="0.7"`, `numOctaves="4"`, `stitchTiles="stitch"`.
  - `mix-blend-mode: overlay`, `opacity: 0.85`.
  - Custom ColorMatrix:
    ```
    0.181 0.608 0.061 0 0.075
    0.181 0.608 0.061 0 0.075
    0.181 0.608 0.061 0 0.075
    0     0     0     1 0
    ```

---

## 5. Information Architecture & URL Routing

### 5.1 Public Routes
```
/                      -> Editorial Homepage (Hero, Featured Projects, Selected Activities, Latest Posts, Experience, Skills, Certs, CTA)
/about                 -> Bio, Philosophy, Current Focus, Interests, Supporting Media
/experience            -> Itemized List / Clean Vertical Journey (NO icons per item)
/projects              -> Categorized Project Grid / List with Tag Filtering
/projects/[slug]       -> Editorial Case Study Layout (Arbitrary Content Blocks & Process Timelines)
/activities            -> Master-Detail Editorial Two-Column (Sticky Left Index, Right Live Content)
/activities/[slug]     -> Direct Shareable URL for Selected Activity
/blog                  -> Article Index with Search, Categories, Tags, Featured Story
/blog/[slug]           -> Editorial Article with Sticky Desktop / Collapsible Mobile TOC
/skills                -> Grouped Categorized Badges (Programming, Frontend, Backend, Tools, etc.)
/certifications        -> Credential Cards with Verification Links & Issuer Metadata
/resume                -> Dynamic Web Resume + PDF Download Action
/contact               -> Accessible Contact Form with Server Validation & Anti-Spam
```

### 5.2 Admin CMS Routes
```
/admin                 -> Overview Metrics, Quick Actions, Activity Feed
/admin/login           -> Secure Authentication Portal
/admin/projects        -> Project Table, Reordering, Feature Toggle, Create/Edit/Delete
/admin/projects/new    -> Full Case Study Composer (Tiptap + Blocks + SEO + Cover)
/admin/projects/[id]   -> Case Study Editor with Autosave, History, Preview
/admin/activities      -> Activity Index Manager (Drag-and-Drop Order, Categorization)
/admin/activities/new  -> Activity Composer
/admin/activities/[id] -> Activity Editor
/admin/blog            -> Blog Post Manager (Draft / Published / Archived filters)
/admin/blog/new        -> Longform Blog Composer
/admin/blog/[id]       -> Blog Editor with Live Word Count & Reading Time Estimation
/admin/experience      -> Career & Education Entry CRUD with Visibility & Order
/admin/skills          -> Skills Matrix & Category Management
/admin/certifications  -> Certification Credential Registry
/admin/profile         -> About, Philosophy, Social Links, Resume PDF Uploader
/admin/media           -> Media Library (Batch Upload, File Metadata, Safe URL Copy)
/admin/website/homepage-> Homepage Section Manager (Enable/Disable, Reorder, Custom Headings)
/admin/website/navigation -> Header/Footer Menu Reordering & Internal/External Linking
/admin/website/appearance -> Design Tokens, Accent Colors, Border Radius, Contrast Checker
/admin/website/seo     -> Global Meta, Open Graph, Sitemap & Robots Config
/admin/settings        -> Account Security, Password Rotation, System Health
```

---

## 6. Implementation Phases Roadmap

- **Phase 1: Environment & Project Foundation**
  - Scaffold Next.js TypeScript project, Tailwind CSS token configuration, Lucide Icons, base layout structure.
- **Phase 2: Database Layer & Prisma Setup**
  - Setup Prisma schema, migrations, seed script with realistic `pasiri` portfolio content, DB client singleton.
- **Phase 3: Smokeveil Background Engine & Design Tokens**
  - Implement `Smokeveil.tsx` with dual-theme blend-mode calculus, SVG turbulence filter, and responsive blurs.
- **Phase 4: Core Shared UI & Layout Primitives**
  - Header with CMS-driven navigation, Footer, Command Menu (`Ctrl + K` global search), Theme Toggle, accessible dialogs & drawers.
- **Phase 5: Public Pages Implementation**
  - Homepage, About, Experience (itemized), Skills, Certifications, Resume, Contact (with server action).
- **Phase 6: Projects & Case Study Showcase**
  - Projects index, category filters, `[slug]` dynamic case study page rendering arbitrary structured content blocks.
- **Phase 7: Activities Editorial Showcase**
  - Desktop sticky two-column index + mobile collapsible select layout with synchronized query/slug navigation.
- **Phase 8: Blog Platform & Reading Experience**
  - Blog index (search, categories, tags), reading time calculation, `[slug]` page with sticky TOC and article typography (65-75 ch line length).
- **Phase 9: Rich Content Block Engine & Process Timeline**
  - Universal block renderer (paragraphs, headings, images, safe videos, code blocks, callouts, blockquotes, and **Process Timeline Block** with numbered step anchors).
- **Phase 10: Authentication & Security System**
  - Admin login, bcrypt password verification, signed HTTP-only session cookies, server middleware protection, rate limiting, and input sanitization.
- **Phase 11: Media Library & Storage System**
  - Secure file upload API, MIME/extension verification, hashed storage paths, metadata extraction, media browser modal.
- **Phase 12: Admin CMS Dashboard & Content CRUD**
  - Admin layout, overview analytics, CRUD interfaces for Projects, Activities, Blog, Experience, Skills, Certifications.
- **Phase 13: Tiptap Rich Text Editor & Timeline Builder**
  - Custom Tiptap integration with Process Timeline block controls, media insertion, auto-save status indicator, and preview mode.
- **Phase 14: Website Management CMS**
  - Homepage section manager (reordering & toggles), Navigation manager, Appearance tokens & contrast validator, SEO settings.
- **Phase 15: Revision History & Draft/Publish Workflow**
  - Snapshot saving on edit, version comparison, rollback capability, Draft vs Published visibility guards.
- **Phase 16: Verification, SEO, Accessibility & Build QA**
  - Sitemap generation, robots.txt, OpenGraph metadata, WCAG 2.2 AA audit (keyboard nav, ARIA, focus rings), TypeScript check, production build.
