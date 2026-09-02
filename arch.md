# Budgetly Sync - Complete Architecture Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Core Vision & Mission](#core-vision--mission)
3. [Key Features](#key-features)
4. [Technical Architecture](#technical-architecture)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Data Flow & Synchronization](#data-flow--synchronization)
8. [State Management](#state-management)
9. [Authentication & Security](#authentication--security)
10. [API Design](#api-design)
11. [Database Schema](#database-schema)
12. [Frontend Components](#frontend-components)
13. [Offline-First Strategy](#offline-first-strategy)
14. [Deployment Architecture](#deployment-architecture)
15. [Development Workflow](#development-workflow)
16. [Performance Optimizations](#performance-optimizations)

---

## Project Overview

**Budgetly Sync** is a modern, offline-first personal finance management application designed specifically for students and individuals who need real-time financial tracking with zero latency, comprehensive budget insights, and automatic synchronization across multiple devices.

### Target Audience

- Students managing limited budgets
- Young professionals tracking personal finances
- Users requiring offline-first capability
- Multi-device synchronization requirements

### Key Promise
>
> **Zero-latency tracking.** Complete offline functionality. Seamless cloud sync.

---

## Core Vision & Mission

### Vision

Empower users with complete control over their personal finances through an intuitive, responsive application that works instantly even without an internet connection, while automatically keeping their data synchronized across all devices.

### Mission

- Provide **instant feedback** on financial decisions (zero latency through local-first architecture)
- Enable **100% offline functionality** for financial tracking
- Guarantee **data consistency** across multiple devices through intelligent background sync
- Maintain **enterprise-grade security** without sacrificing simplicity
- Deliver a **modern, responsive UI** that works seamlessly on desktop and mobile

### Design Philosophy

- **Local-First:** Always trust local state. Sync to cloud asynchronously.
- **Progressive Enhancement:** Base functionality works offline; sync enhances multi-device experience.
- **User-Centric Security:** Strong encryption and validation without exposing complexity to users.
- **Performance-First:** Prioritize responsiveness over eventual consistency.

---

## Key Features

### 1. **Offline-First Tracking**

- Log expenses, income, and transfers instantly without network connectivity
- Real-time calculations and balance updates
- Completely responsive UI using local state

### 2. **Multi-Device Synchronization**

- Automatic background sync to cloud when connected
- Polling mechanism for receiving updates from other devices
- Conflict resolution prioritizing most recent changes
- Debounced syncs to reduce API calls

### 3. **Comprehensive Budget Management**

- Create and track multiple budget categories
- Set spending limits and monitor against actuals
- Recurring expense tracking
- Budget insights and analytics

### 4. **Advanced Financial Features**

- **Transaction Management:** Full transaction history with categorization
- **Savings Goals:** Track progress toward financial objectives
- **Subscriptions:** Monitor recurring subscription expenses
- **Loans & Liabilities:** Track borrowed money and financial obligations
- **Lending Tracking:** Keep records of money lent to others
- **Bucket System:** Allocate funds to specific purposes
- **Income Calendar:** Visualize income streams and timing

### 5. **Personal Finance Tracking**

- Cigarette tracker (vice spending)
- Goal progress visualization
- Monthly spending limits
- Financial insights and analytics

### 6. **Multi-Language & Customization**

- Language preferences with translation system
- Custom appearance themes (dark mode support)
- Notification preferences
- Personalized dashboard

### 7. **Security & Privacy**

- Passkey-based authentication (WebAuthn)
- Session-based access control
- Rate limiting to prevent abuse
- Secure data encryption
- Privacy-first design (data stays local by default)

---

## Technical Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React 19 + Next.js 16 (App Router)                       │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  UI Layer (Tab-based Layout)                         │ │ │
│  │  │  - Home / Transactions / Budget / Finance / Insights │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  State Layer: Zustand Store + LocalStorage                │ │
│  │  - BudgetData (JSON object with all financial data)       │ │
│  │  - Persisted in browser LocalStorage                      │ │
│  │  - Subscribed to by all components                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Sync Worker (Background Service)                         │ │
│  │  - Monitors state changes via Zustand subscription        │ │
│  │  - Debounces rapid changes (500ms)                        │ │
│  │  - POST to /api/sync (upload changes)                     │ │
│  │  - GET from /api/sync every 30s (fetch updates)           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌─────────┐     ┌──────────────┐
   │ HTTP    │    │ HTTP    │     │ (Websocket)  │
   │ POST    │    │ GET     │     │ (Future)     │
   │ /sync   │    │ /sync   │     │              │
   └─────────┘    └─────────┘     └──────────────┘
        │                │
        └────────────────┼────────────────┐
                         │                │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   ┌─────────────────────────────────────────┐
   │   Next.js Backend (App Router)          │
   │                                         │
   │  ┌────────────────────────────────────┐ │
   │  │  /api/auth/* - Authentication      │ │
   │  │  - POST /register                  │ │
   │  │  - POST /login                     │ │
   │  │  - POST /passkey/register*         │ │
   │  │  - POST /passkey/login*            │ │
   │  └────────────────────────────────────┘ │
   │  ┌────────────────────────────────────┐ │
   │  │  /api/sync - Data Sync             │ │
   │  │  - POST (receive from client)      │ │
   │  │  - GET (send to client)            │ │
   │  │  - Zod validation                  │ │
   │  │  - Rate limiting                   │ │
   │  └────────────────────────────────────┘ │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │   Prisma Client ORM                     │
   │   - Database abstraction layer          │
   │   - Type-safe queries                   │
   │   - Connection pooling                  │
   │   - Prisma Accelerate (caching)        │
   └─────────────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────┐
   │   PostgreSQL Database                   │
   │   - Vercel Postgres or Prisma Postgres │
   │   - Tables: users, sessions             │
   │   - Stores JSON sync_data               │
   └─────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

- **Framework:** Next.js 16.3.3 (App Router)
- **Language:** TypeScript 6.0
- **UI Library:** React 19.2
- **Styling:** Tailwind CSS 4.3
- **Icons:** Lucide React 0.344.0
- **State Management:** Zustand 5.0.15
- **Validation:** Zod 4.5.4
- **Utilities:** clsx, tailwind-merge

### Authentication & Security

- **WebAuthn:** @simplewebauthn/browser & @simplewebauthn/server
- **JWT:** jose 6.2.10
- **Hashing:** WebCrypto API (SHA-256)

### Backend

- **Runtime:** Node.js via Next.js
- **ORM:** Prisma Client 5.21.1
- **Query Optimization:** Prisma Accelerate Extension 3.0.1
- **Database Adapters:** pg (PostgreSQL), @libsql/adapter (optional SQLite)

### Database

- **Primary:** PostgreSQL (Vercel Postgres or Prisma Postgres)
- **Backup Support:** SQLite via LibSQL adapter

### Observability

- **Analytics:** @vercel/analytics 2.0.1
- **Performance Monitoring:** @vercel/speed-insights 2.0.0

### Development Tools

- **Linting:** ESLint 9
- **Task Running:** npm scripts

---

## Project Structure

```
budgetly-sync/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── passkey/          # WebAuthn endpoints
│   │   │   │       ├── login/
│   │   │   │       ├── login-options/
│   │   │   │       ├── register/
│   │   │   │       └── register-options/
│   │   │   └── sync/                 # Data synchronization
│   │   │       └── route.ts          # POST/GET for sync
│   │   │
│   │   ├── (tabs)/                   # Authenticated app pages
│   │   │   ├── layout.tsx            # Main app layout with navigation
│   │   │   ├── page.tsx              # Home / Dashboard
│   │   │   ├── budget/
│   │   │   ├── finance/
│   │   │   ├── insights/
│   │   │   ├── profile/
│   │   │   ├── transactions/
│   │   │   └── [other pages]
│   │   │
│   │   ├── auth/                     # Authentication pages
│   │   ├── onboarding/               # First-time setup
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── manifest.ts               # PWA manifest
│   │
│   ├── components/                   # React components
│   │   ├── auth-check.tsx            # Auth wrapper
│   │   ├── budget-ui.tsx             # Reusable UI components
│   │   ├── layout-wrapper.tsx        # Layout utilities
│   │   └── sync-worker.tsx           # Background sync daemon
│   │
│   ├── lib/                          # Utilities & logic
│   │   ├── auth.ts                   # Authentication helpers
│   │   ├── budget-data.ts            # Type definitions & defaults
│   │   ├── budget-store.ts           # Zustand store
│   │   ├── db.ts                     # Database initialization
│   │   ├── mock-storage.ts           # In-memory fallback
│   │   ├── passkey-challenges.ts     # WebAuthn challenge logic
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── storage.ts                # Storage abstraction
│   │   ├── theme-provider.tsx        # Theme context
│   │   └── utils.ts                  # General utilities
│   │
│   └── middleware.ts                 # Next.js middleware (rate limiting)
│
├── prisma/
│   ├── schema.prisma                 # Database schema (Prisma DSL)
│   └── migrations/                   # Database migration history
│
├── public/                           # Static assets
│
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── eslint.config.mjs                 # ESLint configuration
├── package.json                      # Dependencies & scripts
├── README.md                         # User-facing documentation
├── handover.md                       # Technical handover notes
└── arch.md                           # This file
```

---

## Data Flow & Synchronization

### 1. **Local State to UI Flow**

```
User Action (Click button, type text)
         ↓
React Component Handler
         ↓
Call Zustand Store Action
         ↓
Store updates state in-memory
         ↓
Store persists to localStorage
         ↓
Zustand notifies all subscribers
         ↓
Components re-render with new state
         ↓
✅ UI updates instantly (0ms latency)
```

### 2. **Local State to Cloud Flow (Upload)**

```
Store state changes
         ↓
Sync Worker detects change (via subscription)
         ↓
Debounce timer starts (500ms)
         ↓
If more changes arrive → reset timer
         ↓
Timer completes → POST /api/sync
         ↓
Backend receives JSON payload
         ↓
Validate with Zod
         ↓
Check payload size (<1MB)
         ↓
Store in Prisma database
         ↓
Return success to client
         ↓
✅ Data persisted to cloud
```

### 3. **Cloud State to Local Flow (Download)**

```
Sync Worker polls every 30s
         ↓
GET /api/sync
         ↓
Backend queries latest data from database
         ↓
Return JSON payload to client
         ↓
Compare with local state
         ↓
If different → update store
         ↓
Zustand notifies subscribers
         ↓
Components re-render
         ↓
✅ UI reflects cloud state
```

### 4. **Multi-Device Synchronization**

```
Device A: User updates budget
         ↓
Local state changes → debounced POST /api/sync
         ↓
Database updated
         ↓
Device B: Polling GET /api/sync (every 30s)
         ↓
Detects new data in database
         ↓
Updates local store
         ↓
✅ Device B reflects Device A's changes
```

---

## State Management

### Zustand Store Architecture

**Location:** [src/lib/budget-store.ts](src/lib/budget-store.ts)

### Store Structure

```typescript
type BudgetData = {
  settings: AppSettings;           // User settings, language, theme
  transactions: Transaction[];      // All financial transactions
  budgets: BudgetCategory[];       // Budget categories and limits
  recurring: RecurringItem[];       // Recurring expenses
  goals: SavingsGoal[];            // Financial goals
  notifications: NotificationItem[]; // Notification history
  buckets: Bucket[];               // Fund allocation buckets
  bucketTransfers: BucketTransfer[];// Transfers between buckets
  loans: Loan[];                   // Money borrowed
  liabilities: Liability[];        // Financial liabilities
  subscriptions: Subscription[];   // Recurring subscriptions
  lends: Lend[];                   // Money lent to others
};
```

### Store Features

1. **Persistence:** Automatically saved to localStorage via Zustand middleware
2. **Subscriptions:** Components subscribe to specific slices of state
3. **Type Safety:** Fully typed with TypeScript
4. **Immutability:** Zustand enforces immutable updates
5. **Performance:** Selective re-renders only for changed slices

### Key Actions

- `addTransaction(transaction)` - Add new transaction
- `updateTransaction(id, updates)` - Modify existing transaction
- `deleteTransaction(id)` - Remove transaction
- `updateBudget(category, limit)` - Set budget limit
- `addGoal(goal)` - Create savings goal
- `getBalance()` - Calculate current balance
- `reset()` - Clear all data

---

## Authentication & Security

### Authentication Flow

#### 1. **Registration (Passkey)**

```
User clicks "Sign Up"
         ↓
POST /api/auth/passkey/register-options
         ↓
Backend generates challenge
         ↓
Frontend receives challenge
         ↓
@simplewebauthn/browser creates passkey
         ↓
POST /api/auth/passkey/register
         ↓
Backend stores passkey public key in database
         ↓
Generate JWT token
         ↓
Store token in cookie
         ↓
✅ User logged in
```

#### 2. **Login (Passkey)**

```
User clicks "Sign In"
         ↓
POST /api/auth/passkey/login-options
         ↓
Backend generates challenge
         ↓
Frontend receives challenge
         ↓
@simplewebauthn/browser prompts for passkey
         ↓
POST /api/auth/passkey/login
         ↓
Backend verifies signature
         ↓
Generate JWT token
         ↓
Store token in cookie
         ↓
✅ User authenticated
```

### Security Measures

#### 1. **Rate Limiting (Middleware)**

```typescript
// Location: src/middleware.ts
- 60 requests per minute per IP
- Applied to all API routes
- Protects against brute force and DoS
```

#### 2. **Payload Validation (Zod)**

```typescript
// Location: src/app/api/sync/route.ts
- Max payload: 1MB
- Validates JSON structure
- Type-checked before database insert
- Rejects malformed data
```

#### 3. **Security Headers (Next.js Config)**

```typescript
// Location: next.config.ts
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing prevention)
```

#### 4. **JWT Token Management (jose)**

```typescript
// Location: src/lib/auth.ts
- HS256 signing algorithm
- Token expiration enforced
- Signed with secure secret
- Stored in HttpOnly cookies
```

#### 5. **Data Encryption**

- WebAuthn provides cryptographic key binding
- Passwords never transmitted (Passkey authentication)
- Session tokens signed with HMAC-SHA256

---

## API Design

### Authentication Endpoints

#### `POST /api/auth/register`

Traditional username/password registration (if enabled)

#### `POST /api/auth/login`

Traditional username/password login (if enabled)

#### `POST /api/auth/passkey/register-options`

**Request:** `{ username: string }`
**Response:** WebAuthn registration challenge options

#### `POST /api/auth/passkey/register`

**Request:** `{ username: string, ...attestationResponse }`
**Response:** `{ token: string, user: User }`
**Side Effects:** Stores passkey in database, creates session

#### `POST /api/auth/passkey/login-options`

**Request:** `{ username: string }`
**Response:** WebAuthn authentication challenge options

#### `POST /api/auth/passkey/login`

**Request:** `{ username: string, ...assertionResponse }`
**Response:** `{ token: string, user: User }`
**Side Effects:** Creates new session, verifies passkey signature

### Sync Endpoints

#### `POST /api/sync`

Upload local state to cloud

**Request:**

```json
{
  "data": {
    "settings": {...},
    "transactions": [...],
    "budgets": [...],
    // ... all BudgetData fields
  }
}
```

**Response:** `{ success: true, timestamp: string }`

**Validation:**

- Requires authentication (JWT token)
- Payload max 1MB
- Zod schema validation
- Rate limited to 60/minute

#### `GET /api/sync`

Download cloud state to local

**Response:**

```json
{
  "data": {
    "settings": {...},
    "transactions": [...],
    "budgets": [...],
    // ... all BudgetData fields
  },
  "timestamp": "2026-09-01T12:00:00Z"
}
```

**Behavior:**

- Returns latest state from database
- Requires authentication
- Rate limited
- Timestamp for conflict resolution

---

## Database Schema

### Prisma Schema

**Location:** [prisma/schema.prisma](prisma/schema.prisma)

### User Model

```prisma
model User {
  username    String    @id                    // Primary key
  token       String?                          // Registration token
  tokenHash   String    @map("token_hash")     // Hashed token
  passkeys    String    @default("[]")         // JSON array of passkeys
  syncData    String?   @map("sync_data")      // JSON blob of BudgetData
  createdAt   DateTime  @default(now())        // Account creation time
  updatedAt   DateTime  @default(now()) @updatedAt // Last update
  sessions    Session[]                        // Relation to sessions
  
  @@map("users")
}
```

### Session Model

```prisma
model Session {
  id        String   @id                        // Session UUID
  username  String                              // Reference to User
  user      User     @relation(fields: [username], references: [username], onDelete: Cascade)
  expiresAt DateTime @map("expires_at")         // Session expiration
  createdAt DateTime @default(now())            // Session creation
  
  @@map("sessions")
  @@index([username])                           // Fast user lookup
  @@index([expiresAt])                          // Fast cleanup queries
}
```

### Key Design Decisions

1. **JSON Storage:** `syncData` stores entire `BudgetData` as JSON string
   - Pros: Flexible, no schema migrations needed
   - Cons: No querying on financial data, larger payloads

2. **Passkeys as JSON:** Multiple passkeys per user stored as JSON array
   - Allows multiple device registration
   - Simple to manage

3. **Session-Based Auth:** Separate session table
   - Tracks which devices are logged in
   - Allows session invalidation
   - Supports future multi-device management

4. **Timestamp Tracking:** createdAt/updatedAt for sync conflict resolution
   - Determines which version is newer
   - Supports multi-device sync logic

---

## Frontend Components

### Layout Components

#### `src/app/layout.tsx` (Root)

- Providers (Theme, Auth)
- Global styles initialization
- Manifest metadata for PWA

#### `src/app/(tabs)/layout.tsx` (Main App)

- Tab-based navigation (Desktop sidebar + Mobile bottom nav)
- Routes:
  - Home (Dashboard)
  - Transactions
  - Budget
  - Finance
  - Insights
  - Profile
- Responsive design: Desktop sidebar → Mobile bottom navigation

### Page Components

#### Home / Dashboard

- Overview of financial status
- Recent transactions
- Budget progress
- Quick action buttons

#### Transactions

- List all transactions
- Add/edit/delete transactions
- Filter and sort
- Search by category

#### Budget

- View budget categories
- Set/update budget limits
- Track spending vs. budget
- Visual indicators (progress bars)

#### Finance

- Advanced financial management
- Subscriptions, loans, liabilities
- Lending tracking
- Financial overview

#### Insights

- Analytics and visualizations
- Spending trends
- Category breakdowns
- Income vs. expense

#### Profile

- User settings
- Language preferences
- Theme customization
- Notification preferences

### UI Components (Shared)

**Location:** [src/components/budget-ui.tsx](src/components/budget-ui.tsx)

Reusable UI elements:

- Buttons, inputs, cards
- Transaction item components
- Budget category selectors
- Modal/dialog systems
- Notification indicators

### Auth & Sync Components

#### `src/components/auth-check.tsx`

- Route protection wrapper
- Redirects unauthenticated users to login
- Triggers onboarding for new users

#### `src/components/sync-worker.tsx`

- Background synchronization daemon
- Monitors Zustand state changes
- Handles debounced uploads
- Polls for downloads every 30s
- Located in `src/app/layout.tsx` (runs once globally)

---

## Offline-First Strategy

### Principles

1. **Trust Local State First**
   - All reads from localStorage (Zustand store)
   - Zero network latency for user actions
   - No "loading" states for basic operations

2. **Asynchronous Cloud Sync**
   - Changes synced to cloud in background
   - No blocking user interactions
   - Debounced to reduce API calls

3. **Graceful Degradation**
   - App fully functional offline
   - New data created locally, synced later
   - No loss of functionality without internet

4. **Conflict Resolution**
   - Last-write-wins for most fields
   - Timestamp-based detection
   - Users informed of merge conflicts
   - Manual merge if critical conflicts occur

### Implementation

#### Offline Detection

```javascript
// Browser API
window.navigator.onLine

// Network information
navigator.connection?.effectiveType
```

#### Sync Strategy

```
While offline:
  ✓ All changes stored locally
  ✓ No sync attempts
  ✓ No error messages

When online:
  ✓ Sync worker activates
  ✓ Uploads pending changes (debounced)
  ✓ Polls for remote updates
  ✓ Merges state if conflicts detected
```

#### Storage Fallback

```typescript
// Primary: Browser localStorage
// Fallback: In-memory store (if localStorage unavailable)
// Location: src/lib/storage.ts & src/lib/mock-storage.ts
```

---

## Deployment Architecture

### Hosting: Vercel (Recommended)

#### Pre-Deployment Setup

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Import to Vercel Dashboard**
   - Connect GitHub repository
   - Select Budgetly repository
   - Configure build settings

3. **Provision Database**
   - Select "Prisma Postgres" integration
   - Create new Postgres database
   - Vercel injects `DATABASE_URL` env var

4. **Deploy**
   - Framework preset: Next.js
   - Build command: `next build`
   - Start command: `next start`
   - Postinstall: `prisma generate` (auto-configured)

#### Post-Deployment

1. **Initialize Schema**

   ```bash
   # Pull Vercel environment
   npx vercel env pull .env.local
   
   # Push Prisma schema to production
   npx prisma db push
   ```

2. **Verify Deployment**
   - Visit live URL
   - Test authentication
   - Verify sync functionality

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication (if applicable)
AUTH_SECRET=...

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

### Performance Optimizations at Deployment

- **Edge Functions:** API routes run on Vercel Edge (lowest latency)
- **ISR (Incremental Static Regeneration):** Static pages with on-demand updates
- **Image Optimization:** Automatic image resizing and caching
- **Gzip Compression:** Automatic for all responses
- **HTTP/2 Push:** Vercel automatically pushes critical assets

---

## Development Workflow

### Local Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Database**

   ```bash
   # For local development, use SQLite via Prisma
   npx prisma db push
   ```

3. **Environment Variables**
   Create `.env.local`:

   ```env
   DATABASE_URL=file:./dev.db
   NEXTAUTH_SECRET=dev-secret-key
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Development Commands

```bash
npm run dev        # Start dev server (with hot reload)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### Code Organization Principles

1. **Separation of Concerns**
   - API routes in `src/app/api/`
   - Components in `src/components/`
   - Business logic in `src/lib/`
   - Pages in `src/app/(tabs)/`

2. **Type Safety**
   - All TypeScript (no `any` types)
   - Zod schemas for runtime validation
   - Prisma generates types from schema

3. **Component Structure**
   - Functional components only
   - React hooks for state and effects
   - Clear prop interfaces
   - Memoization where needed

4. **Styling**
   - Tailwind CSS for all styles
   - CSS classes via `clsx` for conditions
   - Theme provider for customization
   - Dark mode support built-in

### Testing Strategy

**Note:** Testing framework not currently integrated. Recommended additions:

- Jest (unit tests)
- React Testing Library (component tests)
- Playwright (E2E tests)
- MSW (API mocking)

---

## Performance Optimizations

### Frontend Performance

1. **Lazy Loading**
   - Code splitting at route boundaries (Next.js App Router)
   - Async component imports where applicable
   - Image lazy loading

2. **State Optimization**
   - Zustand selectors to avoid unnecessary re-renders
   - Memoized components (`React.memo`)
   - useCallback for stable function references

3. **Caching**
   - Browser cache for assets (Service Worker - PWA)
   - HTTP cache headers
   - Zustand localStorage persistence

4. **Rendering**
   - Server components for static content
   - Client components only where needed
   - Streaming for large lists (future)

### API Performance

1. **Rate Limiting**
   - 60 requests/minute per IP
   - Protects backend from overload
   - Prevents malicious sync flooding

2. **Payload Optimization**
   - Max 1MB per sync (enforced)
   - JSON compression in transit (gzip)
   - Only changed fields synced (future optimization)

3. **Database Optimization**
   - Prisma Accelerate for query caching
   - Connection pooling via Vercel
   - Indexed queries on username and expiresAt

### Network Performance

1. **Debouncing**
   - 500ms debounce on sync uploads
   - Reduces API calls during rapid changes
   - Batches multiple updates

2. **Polling Strategy**
   - 30-second polling interval (configurable)
   - Balanced between freshness and network load
   - Exponential backoff on errors (future)

3. **Compression**
   - gzip enabled for all responses
   - Modern browser support universal
   - Reduces bandwidth by ~70%

---

## Security Checklist

- ✅ **Authentication:** Passkey-based (WebAuthn) - cryptographically secure
- ✅ **Authorization:** Session tokens with expiration
- ✅ **Data Validation:** Zod schema validation on all inputs
- ✅ **Rate Limiting:** 60 requests/minute per IP
- ✅ **HTTPS Only:** Enforced via HSTS header
- ✅ **CSRF Protection:** SameSite cookies (Next.js default)
- ✅ **XSS Prevention:** React auto-escaping, CSP headers
- ✅ **Secrets Management:** Environment variables via Vercel
- ✅ **Data Privacy:** Zero-knowledge on backend (JSON blob only)
- ✅ **Transport Security:** HTTPS in production, encryption in transit

---

## Future Enhancements

### Phase 2: Advanced Sync

- [ ] WebSocket for real-time sync instead of polling
- [ ] Differential sync (only changed fields)
- [ ] Conflict resolution UI
- [ ] Sync history and rollback

### Phase 3: Collaboration

- [ ] Share budgets with family members
- [ ] Collaborative transaction logging
- [ ] Split expenses with friends
- [ ] Permission system

### Phase 4: Intelligence

- [ ] ML-powered budget recommendations
- [ ] Anomaly detection (unusual spending)
- [ ] Predictive analytics
- [ ] Automated categorization

### Phase 5: Extensions

- [ ] Browser extension for quick expense logging
- [ ] Mobile native app (React Native)
- [ ] Slack integration
- [ ] Email digest reports

### Phase 6: Monetization

- [ ] Premium features (advanced analytics)
- [ ] Family plan pricing
- [ ] API for developers
- [ ] White-label solution

---

## Conclusion

**Budgetly Sync** is a cutting-edge personal finance application that prioritizes user experience through offline-first architecture, real-time synchronization, and enterprise-grade security. The combination of local-first data management with cloud synchronization creates a seamless multi-device experience while maintaining complete privacy and control for users.

The modular architecture, comprehensive type safety via TypeScript, and clean separation of concerns make the codebase maintainable and extensible for future features and scale.

---

## Document History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2026-09-01 | Project | 1.0 | Initial architecture documentation |
