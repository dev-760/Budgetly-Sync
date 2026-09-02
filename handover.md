# Project Handover

## Technical Stack
- **Framework:** Next.js 14+ (App Router)
- **UI & Styling:** Tailwind CSS 4, V2 UI Design (Shadcn UI), Lucide React (Icons)
- **State Management:** Zustand (with LocalStorage persistence for Offline-First capability)
- **Database ORM:** Prisma Client & Prisma Accelerate (`@prisma/client`, `@prisma/extension-accelerate`)
- **Database Engine:** PostgreSQL (Optimized for Vercel Prisma Postgres)
- **Authentication:** Custom JWT-based Auth (`jose`) with WebCrypto API hashing (SHA-256)
- **Language:** TypeScript
- **Validation:** Zod (API payload validation)
- **Observability:** `@vercel/analytics`, `@vercel/speed-insights`

## Architecture Overview
Budgetly is built as an **Offline-First PWA (Progressive Web App)**. 

### 1. Data Layer (Client)
The application relies heavily on `zustand` to persist financial data in `localStorage`. This ensures that all UI interactions (logging expenses, viewing insights) have **zero latency** and work completely without an internet connection.

### 2. Synchronization Engine (Worker)
A global `<SyncWorker />` component sits in `src/app/layout.tsx`. It acts as a background daemon that:
- Subscribes to the local Zustand state.
- Debounces rapid changes.
- Seamlessly pushes (`POST /api/sync`) a JSON representation of the user's data to the backend.
- Silently polls (`GET /api/sync`) every 30 seconds to fetch changes made on other devices.

### 3. Backend & Security
The Next.js backend serves two primary roles:
- **Authentication:** `/api/auth/*` handles user registration and token generation using a custom JWT implementation.
- **Data Persistence:** `/api/sync/route.ts` uses Prisma to save the JSON payload into a Postgres database. 

**Security Measures Implemented:**
- **Rate Limiting:** A custom `middleware.ts` enforces 60 requests/minute per IP to prevent DoS attacks.
- **Security Headers:** Strict CSP, HSTS, and Anti-Clickjacking headers are enforced via `next.config.ts`.
- **Zod Validation:** The `/api/sync` route drops any payload larger than 1MB and uses Zod to validate the JSON structure before it reaches Prisma.

## Key Directories
- `/src/app/(tabs)`: The main authenticated application views (Home, Transactions, Budget, etc.).
- `/src/lib/budget-store.ts`: The core Zustand store that handles local persistence and offline logic.
- `/src/components/sync-worker.tsx`: The background sync engine.
- `/src/app/api`: Next.js Route Handlers for Auth and Sync.
- `/prisma/schema.prisma`: The PostgreSQL database schema.
