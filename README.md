<div align="center">

# TickMate

**AI-powered support ticket management system with semantic search and automated triage**

[![Live Demo](https://img.shields.io/badge/Live_Demo-10B981?style=for-the-badge&logo=vercel&logoColor=white)](#)
[![GitHub Repo](https://img.shields.io/badge/Source_Code-181717?style=for-the-badge&logo=github&logoColor=white)](#)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Ticket Lifecycle](#ticket-lifecycle)
- [AI Integration](#ai-integration)
- [Vector Search](#vector-search)
- [Authentication & Security](#authentication--security)
- [Email Workflows](#email-workflows)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Business Rules](#business-rules)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

TickMate is a full-stack support ticket management system that uses artificial intelligence to automatically analyze, categorize, and match tickets with similar resolved issues. Built as a monorepo with a TypeScript backend and Next.js frontend, it combines semantic search capabilities with traditional ticketing workflows to improve support team efficiency.

### The Problem

Traditional helpdesk systems treat tickets as plain text entries with basic categorization. This leads to:
- Manual triage taking 3-5 minutes per ticket
- Difficulty finding related resolved tickets due to keyword-dependent search
- Knowledge locked in closed tickets that no one can easily discover
- Lost time due to agents solving the same problems repeatedly

### The Solution

TickMate treats every ticket as structured, analyzable data:
1. **AI Analysis** - Every ticket is automatically analyzed by GPT-4.1-mini to generate summaries, priority suggestions, required skills, and agent notes
2. **Semantic Search** - Vector embeddings (OpenAI text-embedding-3-small) stored in Qdrant enable finding similar tickets even when wording differs completely
3. **Async Workflows** - Email delivery and AI analysis run as durable background jobs via Inngest with automatic retries
4. **Role-Based Access** - Users submit and track tickets; moderators and admins manage the queue and assignments
5. **Audit Trail** - Every key action is logged to an immutable audit log for compliance and debugging

---

## Key Features

### Core Functionality
- 🎫 **Complete Ticket Management** - Create, read, update, soft-delete tickets with status tracking
- 🤖 **AI Ticket Analysis** - Automatic analysis via OpenAI GPT-4.1-mini with structured output (Zod validation)
- 🔍 **Semantic Similar Ticket Search** - Find related resolved tickets using vector similarity (Qdrant + OpenAI embeddings)
- 👥 **Role-Based Access Control** - Three roles: user, moderator, admin with granular permissions
- 📊 **Admin Dashboard** - Platform-wide statistics, AI usage analytics, and comprehensive audit logs
- 📧 **Async Email Workflows** - Email verification, password reset, and ticket notifications via Inngest + Resend

### User Experience
- 🌓 **Light & Dark Mode** - Full theme support across all pages via next-themes
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS v4 and shadcn/ui components
- 🔐 **Secure Authentication** - Argon2 password hashing, JWT in HttpOnly cookies, email verification
- 🎨 **Modern UI** - Accessible components built with Radix UI primitives

### Developer Experience
- 📝 **Type Safety** - End-to-end TypeScript with Zod schemas for runtime validation
- 🔄 **ESM-First** - Modern ECMAScript modules throughout the backend
- 🗄️ **Schema-First Database** - Drizzle ORM with generated migrations from TypeScript schema
- 🧪 **API Testing** - `.http` files for manual testing with VS Code REST Client
- 🐳 **Docker Ready** - Multi-stage Dockerfile with non-root user for production deployment

---

## Technology Stack

### Backend (`tickmate-backend/`)

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle-000000?style=for-the-badge&logo=drizzle&logoColor=white" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Qdrant-FF6F00?style=for-the-badge&logo=qdrant&logoColor=white" alt="Qdrant" />
</p>

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 22+ |
| **Express 5** | HTTP server with async middleware support | 5.2.1 |
| **TypeScript** | Type-safe language with ESM support | 5.9.3 |
| **Drizzle ORM** | Schema-first PostgreSQL ORM with migrations | 0.45.1 |
| **PostgreSQL** | Primary relational database | 8+ |
| **Zod** | Runtime schema validation | 4.3.6 |
| **Argon2** | Password hashing (memory-hard, GPU-resistant) | 0.44.0 |
| **JWT (jsonwebtoken)** | Auth token generation and verification | 9.0.3 |
| **Inngest** | Durable async background jobs with retries | 3.52.6 |
| **Resend** | Transactional email delivery | 6.9.3 |
| **OpenAI (via LangChain)** | GPT-4.1-mini for analysis, text-embedding-3-small for vectors | Latest |
| **LangChain** | Structured AI output with Zod validation | 1.2.29 |
| **Qdrant** | Vector database for semantic similarity search | 1.17.0 |
| **cookie-parser** | Cookie parsing middleware | 1.4.7 |
| **cors** | Dynamic CORS configuration | 2.8.6 |

### Frontend (`tickmate-frontend/`)

<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Radix%20UI-000000?style=for-the-badge&logo=radixui&logoColor=white" alt="Radix UI" />
</p>

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js 16** | React framework with App Router and SSR | 16.1.6 |
| **React 19** | UI library with modern concurrent features | 19.2.4 |
| **TypeScript** | Type-safe frontend development | 5.9.3 |
| **Tailwind CSS v4** | Utility-first CSS framework | 4.2.1 |
| **shadcn/ui** | Pre-built accessible component library | Latest |
| **Radix UI** | Unstyled, accessible component primitives | Various |
| **React Hook Form** | Performant form validation with Zod | 7.71.2 |
| **Axios** | HTTP client with credentials support | 1.13.6 |
| **Recharts** | Data visualization for analytics dashboard | 3.8.0 |
| **next-themes** | Light/dark mode with system preference support | 0.4.6 |
| **Biome** | Fast linter and formatter (ESLint + Prettier alternative) | 2.4.6 |
| **Lucide React** | Icon library | 0.577.0 |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Next.js 16 Frontend (App Router, Server & Client Components)   │
│  - Authentication Pages    - User Dashboard    - Admin Panel     │
│  - Ticket Management      - Profile Pages      - Analytics       │
└─────────────────────────────────────────────────────────────────┘
                              ▼ HTTP/HTTPS (CORS + Cookies)
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│         Express 5 Backend (TypeScript ESM, Port 3000)            │
│  ┌──────────────┬──────────────┬──────────────┬───────────────┐ │
│  │ User Routes  │ Ticket Routes│ Admin Routes │ Inngest Hook  │ │
│  │ /api/auth    │ /api/tickets │ /api/admin   │ /api/inngest  │ │
│  └──────────────┴──────────────┴──────────────┴───────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Middlewares: Auth (JWT), Admin Check, CORS, Cookie Parser │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │  Qdrant Vector   │  │  Inngest Cloud   │
│   Database       │  │     Database     │  │  (Async Jobs)    │
│                  │  │                  │  │                  │
│ - users          │  │ - tickmate_db    │  │ - on-signup      │
│ - tickets        │  │   collection     │  │ - on-forgot-pwd  │
│ - magic_links    │  │ - 1536-dim       │  │ - on-ticket-     │
│ - ai_usage_logs  │  │   embeddings     │  │   created        │
│ - audit_logs     │  │ - cosine         │  │                  │
│                  │  │   similarity     │  │ Auto-retry on    │
│ Drizzle ORM      │  │                  │  │ failure          │
│ Schema-first     │  │ OpenAI           │  │                  │
│ migrations       │  │ text-embedding-  │  └──────────────────┘
│                  │  │ 3-small          │           ▼
└──────────────────┘  └──────────────────┘  ┌──────────────────┐
                               ▲            │  Resend Email    │
                               │            │  Service         │
                     ┌─────────┴─────────┐  │                  │
                     │  OpenAI API       │  │ - Verification   │
                     │                   │  │ - Password Reset │
                     │ - GPT-4.1-mini    │  │ - Notifications  │
                     │   (Analysis)      │  │                  │
                     │ - text-embedding- │  │ HTML Templates   │
                     │   3-small         │  │ in public/emails │
                     │   (Vectors)       │  └──────────────────┘
                     └───────────────────┘
```

### Monorepo Structure

```
tickmate/
├── tickmate-backend/          # Express 5 + TypeScript API
│   ├── src/
│   │   ├── config/           # Database, environment, vector DB setup
│   │   ├── controllers/      # Request handlers for routes
│   │   ├── middlewares/      # Auth, admin, CORS logic
│   │   ├── routes/           # Route definitions
│   │   ├── models/           # Drizzle ORM schema
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── utils/            # Helpers (AI, vector, email, cookies)
│   │   ├── inngest/          # Background job functions
│   │   ├── scripts/          # Seed and test scripts
│   │   └── index.ts          # Express app entry point
│   ├── public/emails/        # HTML email templates
│   ├── requests/             # .http files for API testing
│   ├── drizzle/              # Generated migration files
│   ├── Dockerfile            # Multi-stage production build
│   ├── drizzle.config.ts     # Drizzle Kit configuration
│   ├── tsconfig.json         # TypeScript ESM config
│   └── package.json          # Backend dependencies
│
├── tickmate-frontend/         # Next.js 16 + TypeScript UI
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── auth/         # Sign in, sign up, password flows
│   │   │   ├── dashboard/
│   │   │   │   ├── user/     # User dashboard, tickets, profile
│   │   │   │   └── admin/    # Admin dashboard, management
│   │   │   ├── layout.tsx    # Root layout with theme provider
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # Auth forms and flows
│   │   │   ├── tickets/      # Ticket cards, create/edit dialogs
│   │   │   ├── profile/      # Profile management components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── usage/        # AI usage analytics
│   │   │   └── ui/           # shadcn/ui base components
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios client + typed API functions
│   │   │   ├── schemas.ts    # Shared Zod schemas + TypeScript types
│   │   │   └── utils.ts      # Utility functions
│   │   └── hooks/            # Custom React hooks
│   ├── netlify.toml          # Netlify deployment config
│   ├── biome.json            # Biome linter/formatter config
│   ├── next.config.ts        # Next.js configuration
│   ├── tailwind.config.ts    # Tailwind CSS v4 config
│   └── package.json          # Frontend dependencies
│
├── .github/workflows/         # CI/CD workflows
│   └── deploy.yml            # Auto-deploy to Oracle VM via Docker
│
├── CLAUDE.md                 # Claude AI codebase documentation
└── README.md                 # This file
```

---

## Project Structure

### Backend Directory Details

```
tickmate-backend/src/
├── config/
│   ├── db.config.ts              # Drizzle PostgreSQL connection
│   ├── env.config.ts             # Typed environment variable loader
│   └── vector.config.ts          # Qdrant client initialization
│
├── controllers/
│   ├── user.controller.ts        # Auth, profile, password management
│   ├── ticket.controller.ts      # Ticket CRUD, search, replies
│   └── admin.controller.ts       # User management, analytics, audit logs
│
├── middlewares/
│   ├── auth.middleware.ts        # JWT cookie verification
│   └── admin.middleware.ts       # Admin/moderator role check
│
├── routes/
│   ├── user.routes.ts            # /api/auth/* endpoints
│   ├── ticket.routes.ts          # /api/tickets/* endpoints
│   └── admin.routes.ts           # /api/admin/* endpoints
│
├── models/
│   └── model.ts                  # Drizzle schema (users, tickets, logs)
│
├── schemas/
│   ├── user.schema.ts            # Zod validation for user operations
│   ├── ticket.schema.ts          # Zod validation for ticket operations
│   └── user-response.schema.ts   # Response type definitions
│
├── utils/
│   ├── agent.utils.ts            # OpenAI/LangChain ticket analysis
│   ├── vector-db.utils.ts        # Qdrant upsert/search/delete
│   ├── mailer.utils.ts           # Resend email integration
│   ├── magic-link.utils.ts       # Token generation for emails
│   ├── cookie.utils.ts           # Secure cookie helpers
│   ├── audit-log.utils.ts        # Audit event recording
│   └── response.utils.ts         # Standardized API responses
│
├── inngest/
│   ├── client.ts                 # Inngest client setup
│   └── functions/
│       ├── on-signup.ts          # Email verification on registration
│       ├── on-forgot-password.ts # Password reset email
│       └── on-ticket-create.ts   # AI analysis + vector indexing
│
├── scripts/
│   ├── seed.ts                   # Database seeding script
│   ├── test-search.ts            # Vector search testing
│   └── test-search-verbose.ts    # Detailed search testing
│
└── index.ts                      # Express app + route mounting
```

### Frontend Directory Details

```
tickmate-frontend/src/
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   │   ├── page.tsx              # Role selection page
│   │   │   ├── user/page.tsx         # User sign-in form
│   │   │   └── admin/page.tsx        # Admin sign-in form
│   │   ├── signup/page.tsx           # Registration form
│   │   ├── forgot-password/page.tsx  # Request password reset
│   │   ├── reset-password/page.tsx   # Set new password
│   │   ├── verify-email/page.tsx     # Email verification handler
│   │   └── layout.tsx                # Auth pages layout
│   │
│   ├── dashboard/
│   │   ├── user/
│   │   │   ├── page.tsx              # User home dashboard
│   │   │   ├── tickets/page.tsx      # My tickets + create new
│   │   │   ├── public-tickets/page.tsx # Browse resolved tickets
│   │   │   ├── profile/page.tsx      # Profile settings
│   │   │   └── layout.tsx            # User dashboard layout
│   │   │
│   │   └── admin/
│   │       ├── page.tsx              # Admin stats dashboard
│   │       ├── tickets/page.tsx      # All tickets management
│   │       ├── users/page.tsx        # User management
│   │       ├── ai-usage/page.tsx     # AI token usage analytics
│   │       ├── logs/page.tsx         # Audit log viewer
│   │       └── layout.tsx            # Admin dashboard layout
│   │
│   ├── layout.tsx                    # Root layout + theme provider
│   ├── page.tsx                      # Landing/home page
│   └── globals.css                   # Global styles
│
├── components/
│   ├── auth/                         # Sign in/up forms, verification
│   ├── tickets/                      # Ticket cards, dialogs
│   ├── profile/                      # Profile management components
│   ├── admin/                        # User table, edit/delete modals
│   ├── usage/                        # AI usage charts
│   ├── ui/                           # shadcn/ui components
│   ├── app-sidebar.tsx               # User dashboard sidebar
│   ├── admin-sidebar.tsx             # Admin dashboard sidebar
│   ├── theme-provider.tsx            # next-themes provider
│   └── theme-toggle.tsx              # Light/dark mode toggle
│
├── lib/
│   ├── api.ts                        # All API call functions
│   ├── schemas.ts                    # Shared types and Zod schemas
│   └── utils.ts                      # Helper utilities
│
└── hooks/
    ├── use-toast.ts                  # Toast notification hook
    └── use-mobile.ts                 # Mobile detection hook
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (22 recommended for backend Docker image)
- **pnpm** 10.30.3 or higher (`npm install -g pnpm`)
- **PostgreSQL** database (local or cloud)
- **Qdrant** instance (cloud or self-hosted)
- **Inngest** account (free dev server or cloud)
- **OpenAI** API key with access to GPT-4.1-mini and embeddings
- **Resend** account for email delivery

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tickmate.git
cd tickmate
```

#### 2. Install Backend Dependencies

```bash
cd tickmate-backend
pnpm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../tickmate-frontend
pnpm install
```

#### 4. Configure Environment Variables

Create `tickmate-backend/.env` with the following:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tickmate

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Qdrant Vector DB
QDRANT_URL=https://your-qdrant-instance.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Email (Resend)
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL (for CORS and magic links)
APP_URL=http://localhost:5000

# Optional
CORS_ORIGINS=http://localhost:3001,https://your-frontend-domain.com
COOKIE_DOMAIN=localhost
SIMILAR_TICKET_MIN_SCORE=0.75
```

Create `tickmate-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### 5. Set Up Database

Run migrations to create all tables:

```bash
cd tickmate-backend
pnpm drizzle:generate    # Generate migration files from schema
pnpm drizzle:migrate     # Apply migrations to database
```

Optional: Seed the database with test data:

```bash
pnpm seed
```

#### 6. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd tickmate-backend
pnpm dev    # Starts on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd tickmate-frontend
pnpm dev    # Starts on http://localhost:3000 (Next.js default)
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3000/api`.

#### 7. (Optional) Run Inngest Dev Server

For local development of background jobs:

```bash
npx inngest-cli@latest dev
```

This starts a local Inngest server at `http://localhost:8288` that will trigger your functions.

---

## Environment Variables

### Backend Environment Variables

#### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/tickmate` |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | `your-super-secret-jwt-key-here` |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4.1-mini and embeddings | `sk-proj-...` |
| `QDRANT_URL` | Qdrant vector database URL | `https://abc123.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant API authentication key | `your-qdrant-api-key` |
| `INNGEST_EVENT_KEY` | Inngest event key for triggering functions | `evt_...` |
| `INNGEST_SIGNING_KEY` | Inngest signing key for webhook verification | `signkey-...` |
| `RESEND_API_KEY` | Resend API key for sending emails | `re_...` |
| `EMAIL_FROM` | Sender email address for all outgoing emails | `noreply@yourdomain.com` |

#### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the Express server listens on |
| `NODE_ENV` | — | Set to `production` in deployed environments |
| `APP_URL` | — | Frontend public URL (used in magic links and CORS) |
| `CORS_ORIGINS` | — | Comma-separated additional CORS origins |
| `COOKIE_DOMAIN` | — | Domain for auth cookie (for cross-subdomain) |
| `SIMILAR_TICKET_MIN_SCORE` | `0.75` | Cosine similarity threshold for vector search (0-1) |
| `GEMINI_API_KEY` | — | Defined in config but currently unused |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000/api` |

---

## Database Schema

TickMate uses PostgreSQL with Drizzle ORM. The schema is defined in `tickmate-backend/src/models/model.ts`.

### Tables

#### `users`
Stores user accounts with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, auto-increment | User ID |
| `name` | varchar(255) | NOT NULL | Full name |
| `username` | varchar(255) | NOT NULL, UNIQUE | Login username |
| `email` | varchar(255) | NOT NULL, UNIQUE | Email address |
| `password` | text | NOT NULL | Argon2-hashed password |
| `role` | enum | NOT NULL, default `user` | `user`, `moderator`, or `admin` |
| `skills` | text[] | NOT NULL, default `[]` | Array of skills (for moderator assignment) |
| `isActive` | boolean | NOT NULL, default `false` | Email verified flag |
| `loginTime` | timestamp | NOT NULL, default NOW | Last login time |
| `createdAt` | timestamp | NOT NULL, default NOW | Account creation time |

#### `tickets`
Main ticket table with soft-delete support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, auto-increment | Ticket ID |
| `title` | varchar(255) | NOT NULL | Ticket title |
| `description` | text | NOT NULL | Detailed description |
| `status` | enum | NOT NULL, default `pending` | `pending`, `in_progress`, `completed` |
| `category` | varchar(255) | NOT NULL | Ticket category |
| `priority` | enum | NOT NULL, default `medium` | `low`, `medium`, `high` |
| `deadline` | timestamp | nullable | Optional deadline |
| `helpfulNotes` | text | nullable | AI-generated agent notes |
| `isPublic` | boolean | NOT NULL, default `true` | Public knowledge base flag |
| `relatedSkills` | text[] | NOT NULL, default `[]` | Required skills (AI-generated + manual) |
| `replies` | jsonb | NOT NULL, default `[]` | Array of reply objects |
| `createdBy` | integer | FOREIGN KEY → users.id | Ticket creator |
| `assignedTo` | integer | FOREIGN KEY → users.id | Assigned moderator/admin |
| `createdAt` | timestamp | NOT NULL, default NOW | Creation time |
| `updatedAt` | timestamp | NOT NULL, default NOW | Last update time |
| `deletedAt` | timestamp | nullable | Soft-delete timestamp |

#### `magic_links`
Tokens for email verification and password reset.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, auto-increment | Magic link ID |
| `userId` | integer | FOREIGN KEY → users.id, NOT NULL | Associated user |
| `tokenHash` | text | NOT NULL, UNIQUE | SHA-256 hashed token |
| `purpose` | enum | NOT NULL | `email_verification`, `password_reset`, `password_change` |
| `expiresAt` | timestamp | NOT NULL | Token expiration time |
| `usedAt` | timestamp | nullable | Token usage timestamp |
| `createdAt` | timestamp | NOT NULL, default NOW | Creation time |

#### `ai_usage_logs`
Tracks all OpenAI API calls for cost monitoring.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, auto-increment | Log entry ID |
| `userId` | integer | FOREIGN KEY → users.id | User who triggered the call |
| `ticketId` | integer | FOREIGN KEY → tickets.id | Related ticket |
| `operation` | varchar(100) | NOT NULL | Operation type (e.g., `ticket_analysis`) |
| `provider` | varchar(50) | NOT NULL | AI provider (e.g., `openai`) |
| `modelName` | varchar(100) | NOT NULL | Model used (e.g., `gpt-4.1-mini`) |
| `requestId` | varchar(150) | nullable | OpenAI request ID |
| `promptTokens` | integer | NOT NULL, default 0 | Prompt token count |
| `completionTokens` | integer | NOT NULL, default 0 | Completion token count |
| `totalTokens` | integer | NOT NULL, default 0 | Total token count |
| `cachedPromptTokens` | integer | NOT NULL, default 0 | Cached prompt tokens |
| `isCacheHit` | boolean | NOT NULL, default false | Cache hit flag |
| `status` | enum | NOT NULL, default `success` | `success`, `error`, `cache_hit` |
| `errorMessage` | text | nullable | Error details if failed |
| `metadata` | jsonb | nullable | Additional metadata |
| `createdAt` | timestamp | NOT NULL, default NOW | Log time |

#### `audit_logs`
Immutable audit trail for all critical actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY, auto-increment | Log entry ID |
| `action` | enum | NOT NULL | Action type (login, ticket_created, etc.) |
| `entityType` | enum | NOT NULL | `auth`, `user`, `ticket` |
| `entityId` | integer | nullable | Entity primary key |
| `actorUserId` | integer | FOREIGN KEY → users.id | User who performed action |
| `targetUserId` | integer | FOREIGN KEY → users.id | User affected by action |
| `ticketId` | integer | FOREIGN KEY → tickets.id | Related ticket |
| `assignedFromUserId` | integer | FOREIGN KEY → users.id | Previous assignee (for reassignment) |
| `assignedToUserId` | integer | FOREIGN KEY → users.id | New assignee (for reassignment) |
| `description` | text | nullable | Human-readable description |
| `metadata` | jsonb | NOT NULL, default `{}` | Additional context |
| `ipAddress` | varchar(45) | nullable | Client IP address |
| `userAgent` | text | nullable | Client user agent |
| `createdAt` | timestamp | NOT NULL, default NOW | Log time |

**Indexes:**
- `idx_audit_logs_created_at` on `createdAt`
- `idx_audit_logs_action_created_at` on `(action, createdAt)`
- `idx_audit_logs_actor_created_at` on `(actorUserId, createdAt)`
- `idx_audit_logs_target_user_created_at` on `(targetUserId, createdAt)`
- `idx_audit_logs_ticket_created_at` on `(ticketId, createdAt)`
- `idx_audit_logs_assigned_to_created_at` on `(assignedToUserId, createdAt)`

### Database Migrations

Drizzle Kit generates migrations from the TypeScript schema:

```bash
# Generate migration files after schema changes
pnpm drizzle:generate

# Apply migrations to database
pnpm drizzle:migrate

# Push schema directly to dev DB (bypasses migration files)
pnpm drizzle:push
```

Migration files are stored in `tickmate-backend/drizzle/`.

---

## API Reference

All API routes are prefixed with `/api`. Authentication is via JWT in HttpOnly cookies set on login.

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | No | Register new user account |
| `POST` | `/verify` | No | Verify email with token from link |
| `POST` | `/login` | No | User/moderator login (sets auth cookie) |
| `POST` | `/logout` | Yes | Clear auth cookie |
| `POST` | `/forgot-password` | No | Send password reset email |
| `POST` | `/reset-password` | No | Set new password via magic link token |
| `GET` | `/check-username/:username` | No | Check if username is available |
| `POST` | `/resend-verification-email` | No | Resend email verification link |
| `GET` | `/profile` | Yes | Get current user's profile |
| `PATCH` | `/profile` | Yes | Update profile (name, username, skills) |
| `PUT` | `/update-password` | Yes | Change password (requires current password) |
| `DELETE` | `/profile` | Yes | Delete own account (soft-delete) |

### Ticket Routes (`/api/tickets`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Yes | Get current user's tickets |
| `POST` | `/` | Yes | Create new ticket (triggers async AI analysis) |
| `GET` | `/public-completed` | Yes | Browse all resolved public tickets |
| `POST` | `/similar` | Yes | Find semantically similar resolved tickets |
| `GET` | `/get-assigned` | Yes | Get tickets assigned to current user |
| `GET` | `/tickets-summary` | Yes | 7-day ticket activity summary |
| `PUT` | `/status/:id` | Yes | Mark ticket as completed |
| `PUT` | `/ticket-reply` | Mod/Admin | Add reply to a ticket |
| `PUT` | `/edit-ticket` | Yes | Edit ticket (blocked if status is `completed`) |
| `DELETE` | `/delete-ticket` | Yes | Soft-delete a ticket (removes vector) |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/login` | No | Admin login (separate endpoint) |
| `POST` | `/logout` | Admin | Clear admin session |
| `GET` | `/dashboard` | Admin | Platform-wide stats (user count, ticket counts, etc.) |
| `GET` | `/users` | Admin | List all users with pagination |
| `POST` | `/create-user` | Admin | Create new user account (any role) |
| `PUT` | `/update-user` | Admin | Update any user (role, status, details) |
| `DELETE` | `/delete-user` | Admin | Delete any user account |
| `GET` | `/tickets` | Admin | List all tickets (including deleted) |
| `POST` | `/create-ticket` | Admin | Create ticket on behalf of user |
| `PUT` | `/tickets/toggle-status` | Admin | Change any ticket's status |
| `DELETE` | `/tickets/delete-ticket` | Admin | Delete any ticket |
| `GET` | `/ai-usage` | Admin | AI token usage statistics |
| `GET` | `/audit-logs` | Admin | Paginated audit log with filters |

### Inngest Webhook (`/api/inngest`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/inngest` | Inngest | Health check for Inngest |
| `POST` | `/api/inngest` | Inngest | Webhook for background job triggers |
| `PUT` | `/api/inngest` | Inngest | Webhook for job updates |

This endpoint is managed by the Inngest SDK and should not be called directly.

---

## Ticket Lifecycle

### Complete Flow

```
1. User creates ticket via frontend
   ↓
2. POST /api/tickets (ticket stored in PostgreSQL)
   ↓
3. Inngest event "ticket/created" triggered
   ↓
4. on-ticket-create.ts background job runs:
   a. Fetch ticket from database
   b. Set status to "pending"
   c. Call OpenAI GPT-4.1-mini via LangChain for analysis
   d. Parse structured JSON output (summary, priority, helpfulNotes, relatedSkills)
   e. Update ticket with AI-generated data
   f. Set status to "in_progress"
   g. If ticket is completed + public, create vector embedding and upsert to Qdrant
   h. Assign ticket to moderator (skill-matched) or fallback to admin
   i. Log assignment to audit_logs
   j. Send email notification to assignee
   ↓
5. Ticket appears in user dashboard (status: in_progress)
   ↓
6. Moderator/admin adds replies via PUT /api/tickets/ticket-reply
   ↓
7. User or admin marks ticket as completed via PUT /api/tickets/status/:id
   ↓
8. If isPublic is true:
   - Generate vector embedding from ticket text
   - Upsert vector to Qdrant (collection: tickmate_db)
   - Ticket now searchable via semantic similarity
   ↓
9. User searches for similar tickets:
   - POST /api/tickets/similar
   - Query text converted to vector embedding
   - Qdrant returns nearest neighbors with cosine similarity scores
   - Results filtered by minimum score threshold (default 0.75)
   ↓
10. On soft-delete (DELETE /api/tickets/delete-ticket):
    - Set deletedAt timestamp
    - Remove vector from Qdrant
    - Ticket hidden from UI but retained in database
```

### Status Transitions

| Current Status | Allowed Next Status | Triggered By |
|----------------|---------------------|--------------|
| `pending` | `in_progress` | AI analysis completion |
| `in_progress` | `completed` | User, moderator, or admin |
| `completed` | — | Final state (cannot change) |

### Vector Embedding Conditions

A ticket is indexed in Qdrant **only if**:
- `status` is `completed`
- `isPublic` is `true`
- `deletedAt` is `null`

Vectors are **removed** when:
- Ticket is soft-deleted (`deletedAt` set)
- Ticket's `isPublic` flag is set to `false`
- Ticket is updated and no longer meets vector conditions

---

## AI Integration

### OpenAI Models Used

| Model | Purpose | Context | Output |
|-------|---------|---------|--------|
| **gpt-4.1-mini** | Ticket analysis | Ticket title + description | Structured JSON (summary, priority, helpfulNotes, relatedSkills) |
| **text-embedding-3-small** | Vector embeddings | Ticket title + category + description + helpfulNotes + skills | 1536-dimensional vector |

### Ticket Analysis with LangChain

Located in `tickmate-backend/src/utils/agent.utils.ts`.

**Process:**
1. User creates ticket with title, description, category
2. Inngest triggers `on-ticket-create.ts`
3. Function calls `analyzeTicket()` with ticket data
4. LangChain sends system prompt + user message to GPT-4.1-mini
5. Model returns JSON string
6. JSON parsed and validated against Zod schema
7. If valid, ticket updated with AI-generated fields
8. Token usage logged to `ai_usage_logs` table

**System Prompt:**
```
You are an expert AI assistant that processes technical support tickets.
Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.
IMPORTANT:
- Respond with only valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.
```

**Output Schema:**
```typescript
{
  summary: string;          // Concise 1-2 sentence summary
  priority: "low" | "medium" | "high";
  helpfulNotes: string;     // Detailed technical notes + links
  relatedSkills: string[];  // Required skills (e.g., ["React", "PostgreSQL"])
}
```

**Token Usage Tracking:**
Every AI call is logged to `ai_usage_logs` with:
- Prompt tokens, completion tokens, total tokens
- Cached prompt tokens (for repeat prompts)
- Request ID (OpenAI API identifier)
- Status (success, error, cache_hit)
- Model name and provider
- User ID and ticket ID

**Error Handling:**
- Network failures: Logged to `ai_usage_logs` with error message, ticket saved without AI fields
- Invalid JSON: Logged as error, ticket proceeds without AI analysis
- Zod validation failure: Logged as error, original ticket preserved

---

## Vector Search

### Qdrant Configuration

Located in `tickmate-backend/src/utils/vector-db.utils.ts`.

**Collection:** `tickmate_db`  
**Vector Size:** 1536 (OpenAI text-embedding-3-small)  
**Distance Metric:** Cosine similarity  
**Payload Indexes:**
- `status` (keyword index)
- `isPublic` (boolean index)

### Embedding Generation

When a ticket is completed and public, its text is embedded:

**Embedding Text Format:**
```
Title: [ticket.title]
Category: [ticket.category]
Description: [ticket.description]
Helpful Notes: [ticket.helpfulNotes]
Related Skills: [skill1, skill2, ...]
```

This combined text is sent to OpenAI `text-embedding-3-small` to generate a 1536-dimensional vector.

### Vector Operations

#### Upsert (Create/Update)
```typescript
upsertResolvedPublicTicketVector(ticket: TicketVectorSource)
```
- Called when ticket status changes to `completed` and `isPublic` is `true`
- Creates vector from ticket text
- Upserts point to Qdrant collection with full payload
- If vector already exists (by ticket ID), it's updated

#### Search
```typescript
searchSimilarResolvedPublicTickets(input: SimilarTicketSearchInput): Promise<SimilarTicketResult[]>
```
- Takes query text (title, description, category)
- Generates query vector
- Searches Qdrant with filters: `status = completed` AND `isPublic = true`
- Returns results with score >= `SIMILAR_TICKET_MIN_SCORE` (default 0.75)
- Sorted by descending similarity score

**Query Text Format:**
```
Title: [input.title]
Category: [input.category]
Description: [input.description]
```

#### Delete
```typescript
deleteTicketVector(ticketId: number)
```
- Called when ticket is soft-deleted or made private
- Removes vector point from Qdrant by ticket ID
- Fails silently if vector doesn't exist

### Similarity Scoring

Qdrant returns cosine similarity scores between 0 and 1:
- **1.0** = Identical vectors
- **0.9-1.0** = Extremely similar
- **0.75-0.89** = Very similar (default threshold)
- **0.5-0.74** = Moderately similar
- **< 0.5** = Not similar

The `SIMILAR_TICKET_MIN_SCORE` environment variable controls the threshold.

---

## Authentication & Security

### Password Security

- **Hashing:** Argon2id (memory-hard, GPU/ASIC-resistant)
- **Configuration:** Default Argon2 parameters (16 MiB memory, 3 time cost, 4 parallelism)
- **Storage:** Hashed passwords stored in `users.password` column
- **Verification:** Argon2 `verify()` during login

### JWT Tokens

**Token Structure:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "role": "user",
  "isActive": true,
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Lifecycle:**
- Issued on successful login
- Stored in HttpOnly cookie (name: `token`)
- Cookie settings: `httpOnly: true`, `secure: true` (production), `sameSite: "lax"`
- Verified on every authenticated request via `auth.middleware.ts`
- Expired tokens automatically rejected (401 Unauthorized)

**Cookie Settings:**
```typescript
{
  httpOnly: true,          // Not accessible to JavaScript
  secure: NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax',         // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
  domain: COOKIE_DOMAIN || undefined, // Optional cross-subdomain
  path: '/'
}
```

### Magic Links

Used for email verification and password reset.

**Flow:**
1. User requests verification/reset
2. System generates random token (crypto.randomBytes)
3. Token hashed with SHA-256 and stored in `magic_links.tokenHash`
4. Raw token sent via email link
5. User clicks link with token in query param
6. Token hashed and compared to database
7. If valid and not expired, action performed (email verified or password reset)
8. `usedAt` timestamp set to prevent reuse

**Expiration:**
- Email verification: 24 hours
- Password reset: 1 hour

### CORS Configuration

Located in `tickmate-backend/src/index.ts`.

**Allowed Origins:**
- Hardcoded: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://127.0.0.1:3001`
- Dynamic: `APP_URL` environment variable
- Additional: `CORS_ORIGINS` (comma-separated)

**CORS Headers:**
```
Access-Control-Allow-Origin: [reflected origin if whitelisted]
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Vary: Origin
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **user** | Create tickets, view own tickets, update own profile, search public tickets |
| **moderator** | All user permissions + add ticket replies, view assigned tickets |
| **admin** | All permissions + user management, all tickets access, AI usage analytics, audit logs |

**Middleware:**
- `auth.middleware.ts` - Validates JWT token, extracts user data, attaches to `req.user`
- `admin.middleware.ts` - Checks `req.user.role` is `moderator` or `admin`, else 403 Forbidden

### Security Best Practices

✅ **Implemented:**
- HttpOnly cookies (XSS protection)
- Argon2 password hashing (brute-force protection)
- JWT expiration (session timeout)
- Email verification (prevents fake accounts)
- Magic link expiration (time-limited tokens)
- CORS whitelist (prevents unauthorized origins)
- Soft-delete (audit trail preservation)
- Audit logging (compliance and forensics)
- Environment variable validation (fail-fast on misconfiguration)

⚠️ **Consider Adding:**
- Rate limiting (prevent brute-force login attempts)
- CAPTCHA on registration/login (bot protection)
- 2FA support (enhanced account security)
- Content Security Policy headers (XSS mitigation)
- SQL injection protection (Drizzle ORM already helps, but parameterized queries everywhere)

---

## Email Workflows

### Email Service

**Provider:** Resend  
**Templates:** HTML files in `tickmate-backend/public/emails/`  
**Sender:** Configured via `EMAIL_FROM` environment variable

### Email Types

#### 1. Email Verification

**Triggered:** User registers via `POST /api/auth/register`  
**Inngest Function:** `on-signup.ts`  
**Template:** `verification-email.html`  
**Contains:**
- Welcome message
- Verification link with magic link token
- Link expires in 24 hours
- Fallback token for manual entry

**Flow:**
```
User registers → Inngest event "user/signup" 
→ on-signup.ts runs → Create magic link 
→ Send email via Resend → User clicks link 
→ POST /api/auth/verify → Account activated
```

#### 2. Password Reset

**Triggered:** User requests reset via `POST /api/auth/forgot-password`  
**Inngest Function:** `on-forgot-password.ts`  
**Template:** `pass-reset-email.html`  
**Contains:**
- Password reset link with magic link token
- Link expires in 1 hour
- Security notice about unsolicited resets

**Flow:**
```
User requests reset → Inngest event "user/forgot-password" 
→ on-forgot-password.ts runs → Create magic link 
→ Send email via Resend → User clicks link 
→ POST /api/auth/reset-password → Password updated
```

#### 3. Ticket Assignment Notification

**Triggered:** Ticket assigned to moderator/admin  
**Inngest Function:** `on-ticket-create.ts` (last step)  
**Template:** Plain text email (no HTML)  
**Contains:**
- Notification of new ticket assignment
- Ticket title

**Flow:**
```
Ticket created → AI analysis → Moderator assigned 
→ Send email via Resend → Moderator notified
```

### Email Reliability

**Inngest Benefits:**
- Automatic retries on failure (up to 2 retries per function)
- Durable execution (survives server restarts)
- Status dashboard (view all email jobs)
- Error tracking (failed emails logged with error details)

**Resend Benefits:**
- High deliverability (dedicated IP, SPF/DKIM setup)
- Email logs and analytics
- Bounce and complaint tracking
- Webhook support for status updates

---

## Deployment

### Backend Deployment (Docker + Oracle VM)

#### Dockerfile

Located at `tickmate-backend/Dockerfile`. Multi-stage build:

**Stage 1 - Base:**
- Node.js 22 bookworm-slim image
- Enable pnpm via corepack

**Stage 2 - Dependencies:**
- Copy `package.json` and `pnpm-lock.yaml`
- Run `pnpm install --frozen-lockfile`

**Stage 3 - Build:**
- Copy source files (`src/`, `tsconfig.json`, `public/`)
- Run `pnpm build` (TypeScript compilation)
- Run `pnpm prune --prod` (remove dev dependencies)

**Stage 4 - Runner:**
- Node.js 22 bookworm-slim image
- Copy built files and production dependencies
- Create non-root user `tickmate`
- Expose port 3000
- Run `node dist/index.js`

#### GitHub Actions Workflow

Located at `.github/workflows/deploy.yml`.

**Trigger:** Push to `main` branch

**Steps:**
1. SSH into Oracle VM (credentials from secrets)
2. Navigate to project directory
3. Pull latest code from `main` branch
4. Build Docker image with tag `tickmate`
5. Stop and remove old container (if exists)
6. Start new container:
   - Name: `tickmate`
   - Environment: `--env-file /home/ubuntu/.env.production`
   - Port binding: `127.0.0.1:3000:3000`
   - Restart policy: `always`
7. Clean up unused Docker images

**Environment Variables:**
Production `.env.production` file stored on VM at `/home/ubuntu/.env.production`.

**Manual Deployment:**
```bash
cd tickmate-backend
docker build -t tickmate .
docker stop tickmate || true
docker rm tickmate || true
docker run --env-file /path/to/.env.production -d \
  --name tickmate \
  --restart always \
  -p 127.0.0.1:3000:3000 \
  tickmate
```

### Frontend Deployment (Netlify)

#### Netlify Configuration

Located at `tickmate-frontend/netlify.toml`.

```toml
[build]
  base = "tickmate-frontend"
  publish = "/.next"
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Environment Variables on Netlify:**
- `NEXT_PUBLIC_API_URL` - Set to deployed backend URL (e.g., `https://api.yourdomain.com/api`)

**Deployment Steps:**
1. Connect GitHub repository to Netlify
2. Set build command: `pnpm build` (or `npm run build`)
3. Set publish directory: `.next`
4. Add `NEXT_PUBLIC_API_URL` environment variable
5. Deploy

**Alternative: Vercel Deployment**
```bash
cd tickmate-frontend
vercel --prod
```

Set environment variables in Vercel dashboard.

### Production Checklist

Backend:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 random characters)
- [ ] Configure production `DATABASE_URL`
- [ ] Set `APP_URL` to frontend domain
- [ ] Add frontend domain to `CORS_ORIGINS`
- [ ] Set `COOKIE_DOMAIN` if using subdomains
- [ ] Configure Qdrant API key
- [ ] Set up Inngest cloud account (dev server not for production)
- [ ] Configure Resend domain and DNS records
- [ ] Run database migrations: `pnpm drizzle:migrate`
- [ ] Set up database backups
- [ ] Configure reverse proxy (Nginx/Caddy) for SSL termination
- [ ] Set up monitoring and logging

Frontend:
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Test CORS from frontend domain
- [ ] Verify cookie authentication works cross-origin
- [ ] Test all pages for broken links/images
- [ ] Run Lighthouse audit

---

## Available Scripts

### Backend Scripts (`tickmate-backend/`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/index.ts` | Start dev server with hot reload on port 3000 |
| `build` | `tsc` | Compile TypeScript to JavaScript in `dist/` |
| `start` | `node dist/index.js` | Run compiled production code |
| `drizzle:generate` | `drizzle-kit generate` | Generate migration files from schema changes |
| `drizzle:migrate` | `drizzle-kit migrate` | Apply pending migrations to database |
| `drizzle:push` | `drizzle-kit push` | Push schema directly (dev only, bypasses migrations) |
| `seed` | `tsx src/scripts/seed.ts` | Seed database with test data |
| `test:search` | `tsx src/scripts/test-search.ts` | Test vector similarity search |

### Frontend Scripts (`tickmate-frontend/`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start Next.js dev server on port 3000 |
| `build` | `next build` | Build optimized production bundle |
| `start` | `next start` | Start production server (after build) |
| `lint` | `biome check` | Run Biome linter checks |
| `format` | `biome format --write` | Format code with Biome |

---

## Testing

### Manual API Testing

Located in `tickmate-backend/requests/`. Requires [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

**Files:**
- `user-routes.http` - Authentication flows, profile management
- `ticket-routes.http` - Ticket CRUD, similarity search
- `admin-routes.http` - Admin operations, analytics

**Usage:**
1. Open `.http` file in VS Code
2. Click "Send Request" above any request
3. View response in side panel
4. Chain requests using variables defined at top

**Example:**
```http
### Register User
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "skills": ["React", "Node.js"]
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",
  "password": "SecurePass123!"
}
```

### Vector Search Testing

Located at `tickmate-backend/src/scripts/test-search.ts` and `test-search-verbose.ts`.

**Purpose:** Test semantic similarity search with sample tickets.

**Run:**
```bash
cd tickmate-backend
pnpm test:search
```

This creates test tickets, generates embeddings, and performs similarity searches to verify Qdrant integration.

### Future Testing Improvements

- [ ] Unit tests with Vitest
- [ ] Integration tests with Supertest
- [ ] Frontend component tests with React Testing Library
- [ ] E2E tests with Playwright
- [ ] API contract tests with Pact

---

## Business Rules

### User Management
- Users cannot log in until email is verified (`isActive = true`)
- Only admins can create moderator/admin accounts
- Users can only update their own profile
- Account deletion is soft-delete (data retained for audit)

### Tickets
- Tickets cannot be edited once status is `completed`
- Ticket deletion is always soft-delete (`deletedAt` timestamp)
- Soft-deleted tickets are hidden from UI but retained in database
- Vector embeddings removed from Qdrant on soft-delete
- Only moderators and admins can add ticket replies
- Tickets auto-assigned to skill-matched moderator or fallback to admin

### Vector Search
- Only completed and public tickets are indexed in Qdrant
- Similarity search only returns completed public tickets
- Minimum similarity score configurable via `SIMILAR_TICKET_MIN_SCORE`
- Vector sync failures logged but do not block ticket operations

### Email Workflows
- Email verification links expire after 24 hours
- Password reset links expire after 1 hour
- Magic links can only be used once (`usedAt` timestamp prevents reuse)
- Email delivery failures retried automatically via Inngest

### AI Analysis
- AI analysis failures do not prevent ticket creation
- Token usage logged to `ai_usage_logs` for all calls (success or failure)
- AI-generated priority suggestions can be overridden by users/admins
- Cached prompts tracked separately for cost optimization

### Audit Logging
- All authentication events logged (login, logout)
- All user management events logged (create, update, delete, role change)
- All ticket events logged (create, assign, update, complete, delete)
- Audit logs are immutable (no updates/deletes)
- Logs include actor, target, metadata, IP address, user agent

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a pull request

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, missing semicolons)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

**Backend:**
- TypeScript strict mode enabled
- ESM imports with `.js` extensions
- Drizzle ORM for all database operations
- Zod schemas for all request validation
- Async/await for all promises

**Frontend:**
- Biome for linting and formatting
- Tailwind CSS for styling (no inline styles)
- shadcn/ui components (no custom UI primitives)
- React Hook Form for all forms
- Server components by default, client components when needed

---

## License

This project is licensed under the ISC License.

---

<div align="center">

**Built by [Your Name](https://github.com/your-username)**

[Report Bug](https://github.com/your-username/tickmate/issues) · [Request Feature](https://github.com/your-username/tickmate/issues) · [Documentation](https://github.com/your-username/tickmate/wiki)

</div>
