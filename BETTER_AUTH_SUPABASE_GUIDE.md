# Better Auth + Supabase Integration Guide for Invoify

## Table of Contents
1. [What is Better Auth?](#what-is-better-auth)
2. [Why Better Auth + Supabase?](#why-better-auth--supabase)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema & Tables](#database-schema--tables)
5. [Authentication Flow](#authentication-flow)
6. [Authentication Methods](#authentication-methods)
7. [Invoify-Specific Implementation](#invoify-specific-implementation)
8. [Hybrid Storage Strategy](#hybrid-storage-strategy)
9. [API Route Protection](#api-route-protection)
10. [User Schema Design](#user-schema-design)
11. [Configuration Examples](#configuration-examples)
12. [Migration Strategy](#migration-strategy)
13. [Next Steps & Roadmap](#next-steps--roadmap)

---

## What is Better Auth?

**Better Auth** is a modern, framework-agnostic authentication library for TypeScript applications. It's designed to be the developer-friendly alternative to traditional auth solutions.

### Key Features

- **Type-Safety First**: Full TypeScript support with automatic type inference across client and server
- **Framework Agnostic**: Works with Next.js, SvelteKit, Remix, Express, Fastify, Hono, etc.
- **Database Agnostic**: Supports any database through adapters (Prisma, Drizzle, Kysely, MongoDB)
- **Plugin Architecture**: Modular design - only include what you need
- **Modern Security**: Secure cookie-based sessions, CSRF protection, rate limiting
- **Social Providers**: Built-in support for 20+ OAuth providers
- **Passwordless Options**: Magic links, one-time passwords
- **Multi-Factor Auth**: 2FA/MFA through plugins
- **Edge Runtime Compatible**: Works on Vercel Edge, Cloudflare Workers
- **Open Source**: MIT licensed, community-driven

### Better Auth Philosophy

```
Traditional Auth Libraries:
- Opinionated (one way to do things)
- Tightly coupled to specific frameworks
- Heavy dependencies
- Complex configuration

Better Auth:
- Flexible and composable
- Works anywhere JavaScript runs
- Minimal core, extensible via plugins
- Simple, intuitive API
```

### Official Resources

- **Website**: https://www.better-auth.com
- **Documentation**: https://www.better-auth.com/docs
- **GitHub**: https://github.com/better-auth/better-auth
- **NPM Package**: `better-auth`

---

## Why Better Auth + Supabase?

### The Combination

```
Better Auth (Authentication Logic)
    +
Supabase PostgreSQL (Data Storage)
    =
Best of Both Worlds
```

### Why This Combo?

#### 1. **Better Auth handles auth, Supabase handles data**
   - Better Auth: Session management, password hashing, OAuth flows, email verification
   - Supabase: PostgreSQL database, realtime subscriptions, storage, edge functions

#### 2. **You're NOT using Supabase Auth**
   - Supabase Auth is great, but Better Auth gives you more control
   - Better Auth is more flexible for custom auth flows
   - Better Auth has better TypeScript integration
   - You still get Supabase's excellent database infrastructure

#### 3. **Prisma as the Bridge**
   ```
   Better Auth → Prisma Client → Supabase PostgreSQL
   ```
   - Prisma provides type-safe database queries
   - Better Auth's Prisma adapter creates auth tables automatically
   - You get Prisma Studio for database management
   - Schema migrations handled by Prisma

#### 4. **Cost Effective**
   - Better Auth is free and open source
   - Supabase free tier: 500MB database, 2GB bandwidth, 50k monthly active users
   - No vendor lock-in - you can export your data anytime

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INVOIFY APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │   Next.js    │      │  Better Auth │    │   Prisma    │ │
│  │  App Router  │ ───▶ │    Client    │───▶│   Client    │ │
│  │  Components  │      │              │    │             │ │
│  └──────────────┘      └──────────────┘    └─────────────┘ │
│         │                      │                    │        │
│         │                      ▼                    │        │
│         │           ┌──────────────────┐            │        │
│         │           │  API Route:      │            │        │
│         └──────────▶│  /api/auth/[...] │◀───────────┘        │
│                     │                  │                     │
│                     └──────────────────┘                     │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │    SUPABASE POSTGRESQL      │
                ├─────────────────────────────┤
                │  • user table               │
                │  • session table            │
                │  • account table (OAuth)    │
                │  • verification table       │
                │  • invoice table (custom)   │
                │  • template table (custom)  │
                └─────────────────────────────┘
```

### Request Flow

#### Authentication Request
```
1. User clicks "Sign in with Google"
2. Client calls Better Auth SDK: authClient.signIn.social({ provider: "google" })
3. Better Auth redirects to Google OAuth
4. Google redirects back with auth code
5. Better Auth API route validates code
6. Prisma creates user record in Supabase
7. Better Auth creates secure session cookie
8. User is authenticated
```

#### Protected API Request
```
1. User creates invoice
2. Client sends POST to /api/invoice/save with session cookie
3. Middleware checks Better Auth session
4. If valid: Extract user ID
5. Prisma saves invoice linked to user ID in Supabase
6. Return success response
```

---

## Database Schema & Tables

### Tables Created by Better Auth

Better Auth automatically creates and manages these tables via Prisma:

#### 1. **user** table
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]
}
```

**Fields:**
- `id`: Unique user identifier (CUID format)
- `email`: User's email (unique)
- `emailVerified`: Whether email is verified
- `name`: User's display name
- `image`: Profile picture URL
- `createdAt/updatedAt`: Timestamps

#### 2. **session** table
```prisma
model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields:**
- `id`: Session identifier
- `userId`: Foreign key to user
- `expiresAt`: Session expiration time
- `token`: Session token (stored in HTTP-only cookie)
- `ipAddress`: Client IP for security
- `userAgent`: Browser info for session management

#### 3. **account** table (for OAuth)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "google", "github", etc.
  providerAccountId String  // User ID from provider
  accessToken       String? @db.Text
  refreshToken      String? @db.Text
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String? @db.Text

  // Relations
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

**Fields:**
- `provider`: OAuth provider name
- `providerAccountId`: User's ID at the provider
- `accessToken/refreshToken`: OAuth tokens
- `expiresAt`: Token expiration
- Links social accounts to user records

#### 4. **verification** table
```prisma
model Verification {
  id         String   @id @default(cuid())
  identifier String   // Email or phone
  token      String   @unique
  expiresAt  DateTime
  type       String   // "email-verification", "password-reset", etc.
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

**Fields:**
- `identifier`: Email/phone to verify
- `token`: Verification code/token
- `expiresAt`: Token expiration
- `type`: Purpose of verification

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│     User     │◀────────│   Session    │
│              │ 1     * │              │
│ id (PK)      │         │ id (PK)      │
│ email        │         │ userId (FK)  │
│ name         │         │ token        │
│ image        │         │ expiresAt    │
│ emailVerified│         └──────────────┘
└──────────────┘
       │
       │ 1
       │
       │ *
┌──────────────┐
│   Account    │
│              │
│ id (PK)      │
│ userId (FK)  │
│ provider     │
│ accessToken  │
└──────────────┘
```

---

## Authentication Flow

### 1. Email/Password Authentication Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. Submit email + password
      ▼
┌─────────────────────────────┐
│  authClient.signUp.email()  │
└─────────────┬───────────────┘
              │
              │ 2. POST /api/auth/sign-up
              ▼
┌──────────────────────────────┐
│  Better Auth API Route       │
│  • Validate email format     │
│  • Check if email exists     │
│  • Hash password (bcrypt)    │
│  • Generate verification     │
└─────────────┬────────────────┘
              │
              │ 3. Save to database
              ▼
┌──────────────────────────────┐
│  Prisma → Supabase           │
│  • Create user record        │
│  • Create verification token │
└─────────────┬────────────────┘
              │
              │ 4. Send email
              ▼
┌──────────────────────────────┐
│  Email Service               │
│  • Send verification link    │
│  • Link contains token       │
└──────────────────────────────┘

--- User clicks verification link ---

┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 5. Click verification link
      ▼
┌─────────────────────────────┐
│  /api/auth/verify-email     │
│  • Validate token            │
│  • Mark email as verified    │
│  • Create session            │
└─────────────┬───────────────┘
              │
              │ 6. Set session cookie
              ▼
┌──────────────────────────────┐
│  Response with Set-Cookie    │
│  • HTTP-only cookie          │
│  • Secure flag               │
│  • SameSite=Lax              │
└──────────────────────────────┘

User is now authenticated ✓
```

### 2. OAuth (Social) Authentication Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. Click "Sign in with Google"
      ▼
┌─────────────────────────────────┐
│  authClient.signIn.social({     │
│    provider: "google"            │
│  })                              │
└─────────────┬───────────────────┘
              │
              │ 2. Redirect to Google
              ▼
┌──────────────────────────────────┐
│  Google OAuth Page               │
│  • User authorizes app           │
│  • Google generates auth code    │
└─────────────┬────────────────────┘
              │
              │ 3. Redirect back with code
              ▼
┌──────────────────────────────────┐
│  /api/auth/callback/google       │
│  • Exchange code for token       │
│  • Fetch user info from Google   │
└─────────────┬────────────────────┘
              │
              │ 4. Check if user exists
              ▼
┌──────────────────────────────────┐
│  Prisma → Supabase               │
│  • Find user by email            │
│  • If not found: create user     │
│  • Create/update account record  │
│  • Create session                │
└─────────────┬────────────────────┘
              │
              │ 5. Set session cookie
              ▼
┌──────────────────────────────────┐
│  Redirect to app with session    │
└──────────────────────────────────┘

User is now authenticated ✓
```

### 3. Magic Link Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. Enter email
      ▼
┌─────────────────────────────────┐
│  authClient.signIn.magicLink()  │
└─────────────┬───────────────────┘
              │
              │ 2. POST /api/auth/magic-link
              ▼
┌──────────────────────────────────┐
│  Better Auth API                 │
│  • Generate secure token         │
│  • Set expiration (15 minutes)   │
└─────────────┬────────────────────┘
              │
              │ 3. Save token
              ▼
┌──────────────────────────────────┐
│  Prisma → Supabase               │
│  • Save to verification table    │
└─────────────┬────────────────────┘
              │
              │ 4. Send email
              ▼
┌──────────────────────────────────┐
│  Email with magic link           │
│  example.com/auth/verify?        │
│  token=abc123                    │
└──────────────────────────────────┘

--- User clicks magic link ---

┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 5. Click link
      ▼
┌─────────────────────────────────┐
│  /api/auth/verify-magic-link    │
│  • Validate token                │
│  • Check expiration              │
│  • Find/create user              │
│  • Create session                │
└─────────────┬───────────────────┘
              │
              │ 6. Set session cookie
              ▼
┌──────────────────────────────────┐
│  User authenticated              │
└──────────────────────────────────┘
```

### 4. Two-Factor Authentication Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      │ 1. Sign in (email + password)
      ▼
┌─────────────────────────────────┐
│  Better Auth validates creds    │
│  • Check 2FA enabled             │
└─────────────┬───────────────────┘
              │
              │ 2. If 2FA enabled
              ▼
┌──────────────────────────────────┐
│  Generate 6-digit OTP            │
│  • Time-based (TOTP)             │
│  • Or send via email/SMS         │
└─────────────┬────────────────────┘
              │
              │ 3. User enters OTP
              ▼
┌──────────────────────────────────┐
│  Verify OTP                      │
│  • Check code validity           │
│  • Check expiration              │
└─────────────┬────────────────────┘
              │
              │ 4. If valid
              ▼
┌──────────────────────────────────┐
│  Create session                  │
│  • Set 2FA verified flag         │
└──────────────────────────────────┘

User is fully authenticated ✓
```

---

## Authentication Methods

### 1. Email & Password

**How it works:**
- User registers with email and password
- Password is hashed using bcrypt (12 rounds)
- Email verification sent (optional but recommended)
- User can sign in with credentials

**Configuration:**
```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  }
})
```

**Security Features:**
- Password hashing with bcrypt
- Rate limiting on sign-in attempts
- Account lockout after failed attempts
- Password reset via email
- Email verification required

**Best for:**
- Traditional web apps
- Users who prefer username/password
- When you need full control over auth flow

---

### 2. Social OAuth (Google, GitHub, etc.)

**Supported Providers:**
- Google
- GitHub
- Discord
- Facebook
- Twitter/X
- Microsoft
- Apple
- LinkedIn
- Spotify
- Twitch
- GitLab
- Bitbucket
- And 10+ more

**How it works:**
1. User clicks "Sign in with Google"
2. Redirects to provider's OAuth page
3. User authorizes your app
4. Provider redirects back with auth code
5. Better Auth exchanges code for access token
6. Fetches user info (email, name, avatar)
7. Creates/links user account
8. Creates session

**Configuration:**
```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: "http://localhost:3000/api/auth/callback/google"
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
  }
})
```

**Benefits:**
- No password management
- Faster sign-up (one click)
- Trusted providers
- Auto-filled profile info (name, avatar)

**Considerations:**
- Requires OAuth app setup with each provider
- Users need accounts with those providers
- Privacy concerns for some users

---

### 3. Magic Links (Passwordless)

**How it works:**
1. User enters email
2. System generates secure one-time token
3. Email sent with link containing token
4. User clicks link
5. Token validated
6. User authenticated

**Configuration:**
```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  magicLink: {
    enabled: true,
    expiresIn: 900, // 15 minutes
  }
})
```

**Benefits:**
- No password to remember
- No password to secure
- Simple UX (just email)
- Secure (one-time use tokens)

**Considerations:**
- Requires email delivery
- Slight delay (waiting for email)
- Token expiration time
- Email could be intercepted (use HTTPS)

**Best for:**
- Consumer apps
- Low-friction sign-in
- Users who forget passwords

---

### 4. Two-Factor Authentication (2FA)

**Methods supported:**
- **TOTP (Time-based OTP)**: Google Authenticator, Authy
- **SMS OTP**: Text message codes
- **Email OTP**: Email codes
- **Backup codes**: For account recovery

**How TOTP works:**
1. User enables 2FA in settings
2. System generates QR code
3. User scans with authenticator app
4. App generates 6-digit codes every 30 seconds
5. User enters code during sign-in
6. System validates code

**Configuration:**
```typescript
import { betterAuth } from "better-auth"
import { twoFactor } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    twoFactor({
      issuer: "Invoify",
      totpEnabled: true,
      backupCodesEnabled: true,
    })
  ]
})
```

**Security Benefits:**
- Protects against password theft
- Requires physical device
- Industry standard (TOTP)
- Backup codes for recovery

**User Experience:**
- Optional (user opt-in)
- Setup wizard with QR code
- Remember device option
- Backup codes for emergencies

**Best for:**
- Sensitive data (financial, healthcare)
- Admin/power users
- Compliance requirements (SOC 2, HIPAA)

---

## Invoify-Specific Implementation

### Current State
- **No authentication**: Anyone can use the app
- **LocalStorage only**: Data saved in browser
- **No user accounts**: Anonymous users
- **No data sync**: Can't access from multiple devices

### After Better Auth + Supabase
- **User accounts**: Sign up/sign in required for premium features
- **Cloud storage**: Invoices saved to database
- **Cross-device sync**: Access invoices anywhere
- **Collaborative features**: Share invoices, templates
- **Email integration**: Send invoices from your account

---

### Hybrid Storage Strategy

#### Why Hybrid?

**LocalStorage for:**
- Invoice drafts (auto-save every few seconds)
- Fast, instant saves
- Works offline
- No database writes for drafts
- Privacy (draft not uploaded until saved)

**Supabase Database for:**
- Completed invoices (user explicitly saves)
- Invoice templates
- User settings/preferences
- Invoice history
- Cross-device sync

#### Data Flow

```
┌─────────────────────────────────────────────────────┐
│               USER CREATES INVOICE                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Auto-save (every 2 seconds)
                      ▼
              ┌───────────────┐
              │  LocalStorage │  ← Draft saved here
              │  "draftInvoice"│
              └───────────────┘
                      │
                      │ User clicks "Save Invoice"
                      ▼
              ┌───────────────────┐
              │  Check Auth       │
              │  • Logged in?     │
              └─────────┬─────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
    Yes    │                         │ No
           ▼                         ▼
   ┌───────────────┐        ┌────────────────┐
   │ Save to DB    │        │ Show sign-in   │
   │ (Supabase)    │        │ prompt         │
   └───────┬───────┘        └────────────────┘
           │
           │ Success
           ▼
   ┌───────────────┐
   │ Clear draft   │
   │ from Local-   │
   │ Storage       │
   └───────────────┘
```

#### Implementation Details

**Draft Auto-Save (LocalStorage):**
```typescript
// contexts/InvoiceContext.tsx

const DRAFT_KEY = "invoify:invoiceDraft"

// Save draft every 2 seconds
useEffect(() => {
  const subscription = watch((value) => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save draft", error)
    }
  })

  return () => subscription.unsubscribe()
}, [watch])
```

**Save to Database:**
```typescript
// actions/saveInvoice.ts

export async function saveInvoice(invoiceData: Invoice) {
  // Check authentication
  const session = await auth.getSession()
  if (!session) {
    throw new Error("Must be logged in to save invoices")
  }

  // Save to Supabase via Prisma
  const savedInvoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      ...invoiceData,
    }
  })

  // Clear draft from localStorage
  localStorage.removeItem(DRAFT_KEY)

  return savedInvoice
}
```

**Load Invoice (with fallback):**
```typescript
// Load order: Database → LocalStorage

export async function loadInvoice(invoiceId?: string) {
  const session = await auth.getSession()

  // If logged in and has invoice ID, load from database
  if (session && invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user.id // Security: only load user's own invoices
      }
    })
    return invoice
  }

  // Otherwise, load draft from localStorage
  const draft = localStorage.getItem(DRAFT_KEY)
  return draft ? JSON.parse(draft) : null
}
```

---

### Feature Gating

**Free (Anonymous) Users:**
- Create invoices
- Auto-save drafts to LocalStorage
- Generate PDFs
- Basic templates

**Authenticated Users:**
- Save invoices to cloud (unlimited)
- Create custom templates
- View invoice history
- Send invoices via email (user's email as sender)
- Export to CSV/XLSX
- Share invoices with clients

**Premium Users (future):**
- Advanced templates
- Recurring invoices
- Payment tracking
- Client management
- Analytics dashboard

---

### User Journey

#### Scenario 1: Anonymous User
```
1. Visit invoify.com
2. Start creating invoice (no sign-in required)
3. Invoice auto-saves to LocalStorage
4. Generate PDF ✓
5. Click "Save Invoice" → Prompt to sign up
6. Choose to continue anonymously → Can only export PDF
```

#### Scenario 2: Signed-In User
```
1. Visit invoify.com
2. See "Sign In" button
3. Click "Sign in with Google" (OAuth)
4. Authenticated in 2 clicks
5. Create invoice (auto-saves to LocalStorage)
6. Click "Save Invoice" → Saves to Supabase
7. Can access from any device
8. View invoice history
9. Edit saved invoices
10. Create templates from saved invoices
```

#### Scenario 3: Returning User (with draft)
```
1. User was creating invoice yesterday (anonymous)
2. Returns today
3. Draft auto-loads from LocalStorage
4. Continues editing
5. Decides to sign in to save permanently
6. Signs in with email/password
7. Draft is saved to database
8. LocalStorage draft cleared
9. Now synced across devices
```

---

## API Route Protection

### Current State (Unprotected)
```typescript
// app/api/invoice/generate/route.ts
export async function POST(request: Request) {
  const invoiceData = await request.json()
  const pdf = await generatePDF(invoiceData)
  return new Response(pdf)
}
```
**Problem:** Anyone can call this endpoint unlimited times (abuse risk)

### After Protection
```typescript
// app/api/invoice/generate/route.ts
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  // Verify session
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Check rate limit (e.g., 10 PDFs per hour)
  const rateLimit = await checkRateLimit(session.user.id, "pdf_generation")
  if (!rateLimit.allowed) {
    return new Response("Rate limit exceeded", { status: 429 })
  }

  const invoiceData = await request.json()

  // Generate PDF
  const pdf = await generatePDF(invoiceData)

  // Log usage
  await prisma.usageLog.create({
    data: {
      userId: session.user.id,
      action: "pdf_generated",
      metadata: { invoiceId: invoiceData.id }
    }
  })

  return new Response(pdf)
}
```

### Middleware for Global Protection

```typescript
// middleware.ts
import { betterAuth } from "better-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const auth = betterAuth({ /* config */ })

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes
  if (request.nextUrl.pathname.startsWith("/public")) {
    return NextResponse.next()
  }

  // Check session for protected routes
  if (request.nextUrl.pathname.startsWith("/api/invoice")) {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/invoice/:path*", "/dashboard/:path*"]
}
```

### Rate Limiting Strategy

**Purpose:** Prevent abuse of expensive operations (PDF generation, email sending)

**Implementation:**
```typescript
// lib/rateLimit.ts
import { prisma } from "./prisma"

const LIMITS = {
  pdf_generation: { max: 10, window: 3600 }, // 10 per hour
  email_send: { max: 5, window: 3600 },      // 5 per hour
  api_calls: { max: 100, window: 60 }        // 100 per minute
}

export async function checkRateLimit(
  userId: string,
  action: keyof typeof LIMITS
) {
  const limit = LIMITS[action]
  const windowStart = Date.now() - limit.window * 1000

  // Count recent actions
  const count = await prisma.usageLog.count({
    where: {
      userId,
      action,
      createdAt: { gte: new Date(windowStart) }
    }
  })

  return {
    allowed: count < limit.max,
    remaining: Math.max(0, limit.max - count),
    resetAt: new Date(windowStart + limit.window * 1000)
  }
}
```

---

## User Schema Design

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Supabase connection string
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// BETTER AUTH TABLES (auto-generated)
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Better Auth relations
  sessions      Session[]
  accounts      Account[]

  // Invoify custom relations
  invoices      Invoice[]
  templates     InvoiceTemplate[]
  settings      UserSettings?
  usageLogs     UsageLog[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String? @db.Text
  refreshToken      String? @db.Text
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String? @db.Text

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  expiresAt  DateTime
  type       String
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}

// ============================================
// INVOIFY CUSTOM TABLES
// ============================================

model Invoice {
  id        String   @id @default(cuid())
  userId    String

  // Invoice metadata
  invoiceNumber String
  status        String   @default("draft") // draft, sent, paid, overdue
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Sender information
  senderName    String
  senderEmail   String?
  senderAddress String?
  senderZipCode String?
  senderCity    String?
  senderCountry String?
  senderPhone   String?

  // Receiver information
  receiverName    String
  receiverEmail   String?
  receiverAddress String?
  receiverZipCode String?
  receiverCity    String?
  receiverCountry String?
  receiverPhone   String?

  // Invoice details
  invoiceDate   DateTime
  dueDate       DateTime?
  items         Json     // Array of line items
  currency      String   @default("USD")
  language      String   @default("en")

  // Financial details
  subTotal      Float
  totalAmount   Float
  taxDetails    Json?    // Tax breakdown
  discountDetails Json?  // Discount info
  shippingDetails Json?  // Shipping info

  // Additional information
  paymentInformation String? @db.Text
  additionalNotes    String? @db.Text
  paymentTerms       String? @db.Text

  // PDF settings
  pdfTemplate   String?  @default("modern")
  invoiceLogo   String?  // Logo URL
  signature     String?  // Signature image URL

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model InvoiceTemplate {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?

  // Template data (same structure as Invoice)
  templateData Json

  // Metadata
  isPublic    Boolean  @default(false)
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model UserSettings {
  id                    String  @id @default(cuid())
  userId                String  @unique

  // Default invoice settings
  defaultCurrency       String  @default("USD")
  defaultLanguage       String  @default("en")
  defaultPdfTemplate    String  @default("modern")

  // Branding
  companyName           String?
  companyLogo           String?
  companyAddress        String?
  companyEmail          String?
  companyPhone          String?

  // Preferences
  emailNotifications    Boolean @default(true)
  autoSaveDrafts        Boolean @default(true)

  // Relations
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "pdf_generated", "email_sent", "invoice_saved"
  metadata  Json?    // Additional context
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, action, createdAt])
}
```

### Schema Explanation

#### User Table
- Core user identity
- Created by Better Auth
- Extended with Invoify relations

#### Invoice Table
- Stores all saved invoices
- Linked to user via `userId`
- Contains all form fields from current Zod schema
- `items` stored as JSON (array of line items)
- `status` for invoice lifecycle tracking

#### InvoiceTemplate Table
- Reusable invoice templates
- Users can create templates from saved invoices
- `isPublic` for future template marketplace
- `templateData` contains full invoice structure

#### UserSettings Table
- User preferences and defaults
- Company branding info
- Notification settings
- One-to-one with User

#### UsageLog Table
- Track user actions for rate limiting
- Analytics and debugging
- Audit trail

---

## Configuration Examples

### 1. Better Auth Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { twoFactor } from "better-auth/plugins"
import { prisma } from "./prisma"

export const auth = betterAuth({
  // Database connection via Prisma
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Social OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // Cache for 5 minutes
    }
  },

  // Plugins
  plugins: [
    twoFactor({
      issuer: "Invoify",
      totpEnabled: true,
      backupCodesEnabled: true,
    })
  ],

  // Advanced options
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    cookieName: "invoify-session"
  },

  // Email configuration (for verification emails)
  emailConfig: {
    from: process.env.EMAIL_FROM!,
    sendVerificationEmail: async ({ user, url, token }) => {
      // Use your existing Nodemailer setup
      await sendEmail({
        to: user.email,
        subject: "Verify your Invoify account",
        html: `
          <h1>Welcome to Invoify!</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${url}">Verify Email</a>
          <p>Or use this code: ${token}</p>
        `
      })
    }
  }
})

// Export type-safe client
export type Session = typeof auth.$Infer.Session
```

### 2. Prisma Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

### 3. Better Auth API Route

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Single route handles all auth endpoints:
// /api/auth/sign-in
// /api/auth/sign-up
// /api/auth/sign-out
// /api/auth/callback/google
// /api/auth/session
// etc.

export const { GET, POST } = toNextJsHandler(auth)
```

### 4. Better Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
})

// Usage in components:
// const { data: session, isPending } = authClient.useSession()
// await authClient.signIn.email({ email, password })
// await authClient.signIn.social({ provider: "google" })
// await authClient.signOut()
```

### 5. Environment Variables

```env
# .env.local

# Supabase Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (existing Nodemailer config)
EMAIL_FROM="noreply@invoify.com"
NODEMAILER_EMAIL="your_email@example.com"
NODEMAILER_PW="your_email_password"
```

### 6. Protected Component Example

```typescript
// components/ProtectedButton.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SaveInvoiceButton({ invoice }: { invoice: Invoice }) {
  const { data: session } = authClient.useSession()

  const handleSave = async () => {
    if (!session) {
      // Show sign-in modal
      authClient.signIn.redirect()
      return
    }

    // Save invoice
    await saveInvoice(invoice)
  }

  return (
    <Button onClick={handleSave}>
      {session ? "Save Invoice" : "Sign In to Save"}
    </Button>
  )
}
```

### 7. Server-Side Session Check

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      {/* Dashboard content */}
    </div>
  )
}
```

---

## Migration Strategy

### Phase 1: Setup (Week 1)

**Tasks:**
1. Set up Supabase project
2. Get database connection string
3. Install dependencies:
   ```bash
   npm install better-auth @prisma/client
   npm install -D prisma
   ```
4. Initialize Prisma:
   ```bash
   npx prisma init
   ```
5. Create Prisma schema (copy from above)
6. Set up environment variables
7. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
8. Configure Better Auth
9. Create API route `/api/auth/[...all]`
10. Test basic auth (sign up, sign in, sign out)

**Deliverables:**
- Working authentication system
- User can create account and sign in
- Session persists across page reloads
- Database tables created in Supabase

---

### Phase 2: Basic Integration (Week 2)

**Tasks:**
1. Create sign-in/sign-up UI components
2. Add "Sign In" button to header
3. Add user menu (avatar, dropdown)
4. Protect "Save Invoice" feature (require auth)
5. Create `saveInvoice` server action
6. Migrate invoice saving from LocalStorage to database
7. Create invoice history page
8. Add "Load Invoice" functionality
9. Test full flow: sign up → create invoice → save → load

**Deliverables:**
- Users can save invoices to database
- Users can view their invoice history
- Users can load and edit saved invoices
- LocalStorage still used for drafts

---

### Phase 3: OAuth & Magic Links (Week 3)

**Tasks:**
1. Set up Google OAuth app
2. Configure Google provider in Better Auth
3. Add "Sign in with Google" button
4. Test Google sign-in flow
5. Set up GitHub OAuth (optional)
6. Configure magic link authentication
7. Add "Email me a login link" option
8. Test magic link flow

**Deliverables:**
- OAuth social login working
- Magic link passwordless auth working
- Users can choose preferred sign-in method

---

### Phase 4: Templates & Advanced Features (Week 4)

**Tasks:**
1. Create invoice templates table
2. Add "Save as Template" button
3. Create templates page
4. Add template selector when creating new invoice
5. Implement user settings page
6. Add default preferences (currency, language, logo)
7. Create company branding settings
8. Test template creation and usage

**Deliverables:**
- Users can create reusable templates
- Users can set default invoice settings
- Company branding applied automatically

---

### Phase 5: API Protection & Rate Limiting (Week 5)

**Tasks:**
1. Add authentication check to all API routes
2. Implement rate limiting system
3. Create usage tracking
4. Add error handling for auth failures
5. Add loading states for auth operations
6. Test rate limits
7. Add user-friendly error messages

**Deliverables:**
- All API routes protected
- Rate limiting prevents abuse
- Graceful handling of auth errors

---

### Phase 6: 2FA & Security (Week 6) - Optional

**Tasks:**
1. Add 2FA plugin to Better Auth
2. Create 2FA setup page
3. Generate QR code for TOTP
4. Implement 2FA verification flow
5. Add backup codes generation
6. Create account security settings page
7. Test 2FA flow

**Deliverables:**
- Users can enable 2FA
- TOTP authentication working
- Backup codes for recovery

---

### Phase 7: Polish & Testing (Week 7)

**Tasks:**
1. Add loading skeletons
2. Improve error messages
3. Add toast notifications
4. Test edge cases (expired sessions, invalid tokens)
5. Mobile responsive testing
6. Cross-browser testing
7. Write documentation

**Deliverables:**
- Polished user experience
- All edge cases handled
- Mobile-friendly
- Documentation complete

---

## Next Steps & Roadmap

### Immediate Next Steps

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Copy database connection string
   - Save in `.env.local`

2. **Install Dependencies**
   ```bash
   npm install better-auth @prisma/client
   npm install -D prisma
   ```

3. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

4. **Create Schema**
   - Copy Prisma schema from this document
   - Paste into `prisma/schema.prisma`

5. **Run Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Configure Better Auth**
   - Create `lib/auth.ts`
   - Copy configuration from this document

7. **Create API Route**
   - Create `app/api/auth/[...all]/route.ts`
   - Copy code from this document

8. **Test Basic Auth**
   - Create sign-up page
   - Test creating account
   - Verify database records

---

### Long-Term Roadmap

#### Q1 2025: Foundation
- Complete authentication integration
- Migrate core features to database
- Launch user accounts

#### Q2 2025: Templates & Collaboration
- Invoice templates marketplace
- Shared invoices (view-only links)
- Recurring invoices

#### Q3 2025: Payments
- Payment status tracking
- Integration with Stripe/PayPal
- Automatic payment reminders

#### Q4 2025: Teams & Enterprise
- Team workspaces
- Role-based permissions
- Advanced analytics

---

## Resources & Documentation

### Better Auth
- **Official Docs**: https://www.better-auth.com/docs
- **GitHub**: https://github.com/better-auth/better-auth
- **Discord Community**: https://discord.gg/better-auth

### Supabase
- **Official Docs**: https://supabase.com/docs
- **Database Management**: https://supabase.com/dashboard
- **Pricing**: https://supabase.com/pricing

### Prisma
- **Official Docs**: https://www.prisma.io/docs
- **Schema Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Prisma Studio**: `npx prisma studio`

### Next.js + Auth
- **Next.js Auth Patterns**: https://nextjs.org/docs/authentication
- **Route Protection**: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

## FAQ

### Q: Why Better Auth instead of NextAuth.js?
**A:** Better Auth has:
- Better TypeScript support
- More flexible plugin system
- Framework agnostic
- More modern architecture
- Active development

### Q: Can I use Supabase Auth instead?
**A:** Yes, but Better Auth gives you:
- More control over auth flows
- Better customization
- Framework independence
- You still use Supabase database

### Q: What about existing LocalStorage data?
**A:**
- Drafts stay in LocalStorage (fast auto-save)
- Saved invoices migrate to database
- Users can import old invoices

### Q: Is this GDPR compliant?
**A:**
- Yes, with proper configuration
- Supabase is GDPR compliant
- Add privacy policy and terms
- Implement data export/deletion

### Q: Cost estimate?
**A:**
- Better Auth: Free (open source)
- Supabase free tier: 500MB DB, 50k MAU
- Supabase Pro: $25/month (8GB DB, 100k MAU)
- Estimate: Free for first 1000 users

### Q: Can users migrate between devices?
**A:** Yes, after signing in:
- Invoices sync automatically
- Can access from any device
- Real-time updates (optional with Supabase Realtime)

---

## Conclusion

This guide provides a complete overview of integrating Better Auth with Supabase for the Invoify application. The hybrid approach (LocalStorage + Database) gives you the best of both worlds:

- **Fast, instant saves** (LocalStorage drafts)
- **Reliable persistence** (Database for completed work)
- **Cross-device sync** (Cloud storage)
- **Privacy-first** (Drafts stay local until explicitly saved)

The phased migration strategy allows you to implement features incrementally without disrupting existing functionality.

**Ready to start?** Begin with Phase 1: Setup (Week 1) and create your Supabase project!

---

**Document Version**: 1.0
**Last Updated**: 2025-11-04
**Author**: Claude (Anthropic)
**Project**: Invoify Authentication Integration
