# M7 PCs - Subscription Management Platform

## Overview

M7 PCs is a luxury-themed device subscription management platform built for the Saudi Arabian market. It allows customers to browse subscription plans (priced in SAR/Halalas), purchase subscriptions for specific devices, manage their wallet balance through top-up requests, and track subscription statuses. Admins can approve/reject top-ups, activate subscriptions, manage users (role changes, balance adjustments, ban/unban, delete), cancel/delete subscriptions, edit subscription dates, view activity logs, export data as CSV, create announcements, and view dashboard analytics.

The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database. It supports bilingual UI (English/Arabic with RTL support) and uses Discord OAuth2 for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Discord OAuth2 Migration**: Replaced Replit Auth with Discord OAuth2. Login via Discord button, session-based auth with PostgreSQL sessions. Admin IDs hardcoded: 1125880459579109407, 1131700999250264135, 1061025903079063672
- **Protected Routes**: Only landing page (/) accessible without authentication. All other routes (shop, dashboard, transactions, inbox, leaderboard, admin) require Discord login
- **Profile Dropdown**: Nav bar shows Discord avatar + balance pill. Dropdown displays balance, total spent, rank with tier progress bar, logout button
- **Rank/Tier System**: 10-tier system based on total SAR spent (NEWCOMER through PRIMEVAL) with Roman numeral levels (I-X), color-coded badges, and progress bars. Defined in client/src/lib/ranks.ts
- **Leaderboard Page**: New /leaderboard page showing top 10 spenders with tier badges, progress indicators, and "You" marker for current user
- **Countdown Timer**: Dashboard subscription cards show real-time countdown (days/hours/minutes/seconds) for active subscriptions with end date
- **Admin Ban/Delete**: Admins can ban/unban users (blocks login), delete users (with confirmation dialog), edit subscription start/end dates, delete subscriptions
- **User Schema Updates**: Added username, isBanned, totalSpent columns. totalSpent auto-increments on purchase
- **Enhanced Admin Dashboard**: Users tab shows Discord avatars, ban status badges, ban/unban/delete buttons. Subscriptions tab has edit dates and delete buttons

## System Architecture

### Directory Structure
- `client/` — React SPA (Vite-powered)
- `server/` — Express API server
- `shared/` — Shared types, schemas, and route definitions used by both client and server
- `migrations/` — Drizzle-generated database migrations
- `script/` — Build scripts

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router) with ProtectedRoute wrapper
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark luxury theme: midnight blue & gold)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Charts**: Recharts for admin dashboard statistics
- **i18n**: i18next with English and Arabic translations, full RTL support
- **Key Pages**:
  - `/` — Landing page with hero, stats, features grid, services, CTA (public)
  - `/shop` — Browse and purchase subscription plans (protected)
  - `/dashboard` — User dashboard with balance, subscriptions with countdown timer, top-up history (protected)
  - `/transactions` — Dedicated transactions page with filters (protected)
  - `/inbox` — News & announcements page (protected)
  - `/leaderboard` — Top 10 spenders with tier badges and progress bars (protected)
  - `/admin` — Admin dashboard with 6 tabs: Approvals, Subscriptions Management, Users, Announcements, Activity Logs, Analytics (admin only)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: tsx for development, esbuild for production bundling
- **API Pattern**: REST API with routes defined in `shared/routes.ts` using Zod schemas for validation
- **Auth**: Discord OAuth2 (`server/auth.ts`). Sessions stored in PostgreSQL using `connect-pg-simple`. Login redirects to Discord, callback handles token exchange and user upsert. Admin auto-detected by Discord ID.
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class
- **Dev Server**: Vite dev server is integrated as middleware in development mode (`server/vite.ts`), with static file serving in production (`server/static.ts`)
- **Error Handling**: All API routes wrapped in try-catch with proper HTTP status codes and Zod validation error responses
- **Security**: isAuthenticated middleware checks session and ban status. Admin routes verify role server-side. Self-role-change prevented. Duplicate topup processing prevented.

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` env var)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema** (`shared/schema.ts` and `shared/models/auth.ts`):
  - `sessions` — Session storage for Discord OAuth2 (mandatory, do not drop)
  - `users` — User accounts with role (`customer`/`admin`), balance (Halalas), username, profileImageUrl, isBanned, totalSpent
  - `products` — Subscription plans with name, description, price (Halalas), duration (days)
  - `subscriptions` — User subscriptions with status workflow: `pending_activation` → `active` → `expired`
  - `topups` — Balance top-up requests with status workflow: `pending` → `approved`/`rejected`
  - `announcements` — Admin announcements with priority levels: `normal`/`important`/`urgent`
  - `activity_logs` — Audit trail of all admin actions with actor, action, target, and metadata
- **Migrations**: Use `npm run db:push` (drizzle-kit push) to sync schema to database

### Admin API Endpoints
- `PATCH /api/users/:id/role` — Change user role (admin only, prevents self-change)
- `PATCH /api/users/:id/balance` — Adjust user balance with optional reason (admin only)
- `PATCH /api/users/:id/ban` — Ban/unban user (admin only, prevents self-ban)
- `DELETE /api/users/:id` — Delete user and all their data (admin only, prevents self-delete)
- `PATCH /api/subscriptions/:id/cancel` — Cancel active subscription (admin only)
- `PATCH /api/subscriptions/:id/dates` — Edit subscription start/end dates (admin only)
- `DELETE /api/subscriptions/:id` — Delete subscription (admin only)
- `GET /api/activity-logs` — Fetch admin activity log (admin only)
- `GET /api/export/:type` — Export data as CSV (users/subscriptions/topups, admin only)
- `GET /api/leaderboard` — Get top 10 spenders by totalSpent (public)

### Currency Handling
All monetary values are stored in **Halalas** (1/100 SAR). Divide by 100 for display. This avoids floating-point issues.

### Authentication & Authorization
- Discord OAuth2 handles login/logout via `/api/login` → Discord → `/api/callback`
- Sessions persisted in PostgreSQL `sessions` table
- Admin Discord IDs: 1125880459579109407, 1131700999250264135, 1061025903079063672
- User roles: `customer` (default) and `admin`
- Banned users receive 403 response from isAuthenticated middleware
- Admin-only routes check `user.role === 'admin'` server-side
- Client-side auth state managed via `/api/auth/user` endpoint and `useAuth` hook
- Protected routes redirect to `/` when not authenticated (ProtectedRoute component)

### Build System
- **Development**: `npm run dev` — runs tsx with Vite middleware for HMR
- **Production Build**: `npm run build` — Vite builds frontend to `dist/public/`, esbuild bundles server to `dist/index.cjs`
- **Production Start**: `npm run start` — runs the bundled server
- **Type Check**: `npm run check`

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable
- **Discord OAuth2**: Requires `DISCORD_CLIENT_ID` (env var) and `DISCORD_CLIENT_SECRET` (secret). Callback URL: `https://<domain>/api/callback`
- **Session Secret**: `SESSION_SECRET` environment secret for session encryption

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` + `express-session` — Web server and session management
- `connect-pg-simple` — PostgreSQL session store
- `zod` + `drizzle-zod` — Runtime validation and schema generation
- `@tanstack/react-query` — Client-side data fetching
- `wouter` — Client-side routing
- `i18next` + `react-i18next` — Internationalization
- `framer-motion` — Animations
- `recharts` — Charts for admin dashboard
- `shadcn/ui` components (Radix UI primitives) — UI component library
