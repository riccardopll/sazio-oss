# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sazio is a fitness nutrition tracking app built as a pnpm monorepo with three packages:
- **apps/mobile** - React Native Expo app with NativeWind styling
- **apps/server** - Cloudflare Workers backend with Hono + D1 SQLite
- **packages/api** - Shared tRPC router and Drizzle schema

## Common Commands

### Root
```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm lint             # Lint all packages (runs on pre-commit)
```

### Mobile (apps/mobile)
```bash
pnpm start            # Start Expo dev server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
```

### Server (apps/server)
```bash
pnpm dev              # Start Wrangler dev server (localhost:8787)
pnpm test             # Run Vitest tests
pnpm db:generate      # Generate Drizzle migration after schema changes
pnpm db:migrate:local # Apply migrations to local D1
pnpm db:migrate       # Apply migrations to production D1
pnpm cf:deploy        # Deploy to Cloudflare Workers
```

### API Package (packages/api)
```bash
pnpm build            # Compile TypeScript to dist/
```

## Architecture

### Data Flow
1. Mobile app authenticates via Clerk (Google OAuth)
2. tRPC client sends requests with Bearer token to Hono server
3. Server validates JWT, runs Drizzle queries against D1 SQLite
4. Type-safe responses flow back through tRPC

### Key Files
- `packages/api/src/index.ts` - tRPC router with all endpoints
- `packages/api/src/schema.ts` - Drizzle database schema (foods, food_logs, goals, serving_units)
- `apps/server/src/index.ts` - Hono server with tRPC adapter and auth middleware
- `apps/mobile/lib/TRPCProvider.tsx` - tRPC client setup with Clerk token
- `apps/mobile/app/(tabs)/index.tsx` - Main dashboard screen

### Database Schema
- **foods** - Nutrition database (protein, carbs, fat per serving)
- **serving_units** - Custom serving sizes with gram equivalents
- **food_logs** - User consumption records with timestamps
- **goals** - Time-bounded nutrition targets (start_date, end_date nullable)

### Macro Calculations
```typescript
calories = (protein * 4) + (carbs * 4) + (fat * 9)
actualMacro = (quantity * gramsEquivalent / servingSize) * macroPerServing
```

### Timezone Handling
All date queries accept a timezone string from the client. Server uses Luxon to calculate date boundaries with `startOf("day")` in the user's timezone.

## Environment Setup

### Mobile (.env)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://127.0.0.1:8787
```

### Server (.dev.vars)
```
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_DATABASE_ID=...
CLOUDFLARE_D1_TOKEN=...
CLERK_SECRET_KEY=sk_test_...
```

## Code Patterns

- All tRPC procedures use `protectedProcedure` middleware that extracts `userId` from JWT
- Input validation uses Zod schemas (v4)
- Mobile uses file-based routing with Expo Router (tabs layout)
- NativeWind provides Tailwind CSS classes in React Native components
- Custom theme colors defined in `apps/mobile/tailwind.config.js` (nutrition colors, surface colors)
