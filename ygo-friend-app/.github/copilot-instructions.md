# Copilot Instructions for YGO Friend App

## Project Overview
This is a **Next.js 14** application for managing Yu-Gi-Oh! tournament scheduling and regulation databases. Two main features:
1. **Card Database** (`/`): Static tables showing banned/limited cards from YGO STANDARD format
2. **Tournament Manager** (`/tournament`): Admin interface for generating and managing multi-player tournament schedules

## Architecture & Key Patterns

### Data Flow
- **Client-side rendering**: Tournament admin page uses `'use client'` with React hooks for form state management
- **Server-side rendering**: Tournament viewing page uses async `kv.get()` in server components with `revalidate: 0`
- **Persistent storage**: Vercel KV (Redis) stores Season data at key `tournament:season`
- **API routes**: `/api/tournament/*` handle GET/POST/PATCH operations with admin PIN authentication

### Critical Components

**Tournament Data Structure** (`app/tournament/types.ts`):
- `Season`: Container with `id`, `name`, list of `players` and `sessions`, `createdAt`
- `Session`: Represents one round with `id`, `date`, `label`, `firstPlayerCounts` (dict tracking player first-player turns), and `matches`
- `Match`: Matchup with `matchNumber`, player IDs, deck info, and optional `winnerId`

**Generator Logic** (`lib/tournament/generator.ts`):
- Uses **Latin Square** algorithm to ensure balanced first-player turns across sessions
- `makeLatinSquare(n)`: Creates n×n matrix where each player gets different turn counts per session
- `makeMatches()`: Pairs players so those with more first-player turns go first (to balance)
- Returns complete Season with all matches auto-shuffled

### Database & API Authentication
- Vercel KV (Upstash Redis) accessed via custom `kv` wrapper (`lib/kv.ts`)
- Admin operations require `x-admin-pin` header matching `process.env.ADMIN_PIN`
- GET `/api/tournament` fetches current Season (public)
- POST `/api/tournament` creates/overwrites Season (admin only)
- PATCH `/api/tournament/session/[sessionId]` updates matches or date (admin only)

### UI Components
- **SessionTabs** (`app/tournament/components/SessionTabs.tsx`): Tabbed interface showing sessions with first-player badges (color-coded by count 0-3)
- **MatchTable** (`app/tournament/components/MatchTable.tsx`): Displays/edits individual matches within a session
- **CardTable** (`app/components/CardTable.tsx`): Collapsible tables with 4 card type columns (Monster/Spell/Trap/Extra)

## Developer Workflows

### Local Development
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # ESLint checks
```

### Admin Operations
1. Navigate to `/tournament/admin`
2. Enter PIN (from `ADMIN_PIN` env var)
3. Fill form: Season name, 4 player names, 4 event dates
4. Click "生成" to create Season and save to KV
5. Edit matches/dates inline; changes auto-save via API

### Environment Variables Required
```
UPSTASH_REDIS_REST_URL      # Vercel KV endpoint
UPSTASH_REDIS_REST_TOKEN    # Vercel KV auth token
ADMIN_PIN                    # PIN for tournament admin access
```

## Project-Specific Conventions

### Styling
- **Tailwind + inline styles**: Mix of Tailwind classes and direct style objects in JSX
- **Custom fonts**: `HOTReisho` and `gothic` classes defined in `globals.css` for Japanese typography
- **Color patterns**: Use semantic names (`#1e293b`, `#64748b`) throughout; badge colors defined in `BADGE_COLORS` constant

### Error Handling
- Silent fallbacks: KV connection errors catch and return `null`, not thrown
- Admin PIN errors: Return `401` from API; UI clears form and shows `"PINが正しくありません"`
- Gen errors: Validation messages displayed above form before API call

### Japanese Language
- Code comments and UI labels are in Japanese (tournament context)
- Dates format as `YYYY/M/D` for display (parse from ISO `YYYY-MM-DD`)
- Use `・` as player separator in display strings

### Code Organization
- Route handlers in `app/api/tournament/route.ts` and `app/api/tournament/session/[sessionId]/route.ts`
- Business logic in `lib/tournament/` (generator, algorithms)
- Page layouts separate from components (`app/tournament/layout.tsx` vs. components in subdirectory)
- Type definitions co-located in `app/tournament/types.ts` (centralized for cross-component use)

## Common Development Tasks

**Adding a tournament feature**:
- Define types in `app/tournament/types.ts`
- Extend API route if data persistence needed
- Use `adminFetch()` wrapper from admin page for auth headers

**Editing match results**:
- Changes in `MatchTable` trigger `onSessionSave()` callback
- Admin page PATCH to `/api/tournament/session/[sessionId]`
- Update local state: map sessions and update matches for matching sessionId

**Fixing layout issues**:
- Use `maxWidth: '960px'` + `margin: '0 auto'` pattern for consistent page width
- SessionTabs manages tab state; MatchTable handles match-level UI

## Dependencies Worth Knowing
- `@vercel/kv`: Redis client (configured via env vars)
- `html-to-image`: Possible future feature for screenshot/export
- `uuid`: Generate IDs for players/sessions
- `@emotion/styled`: Installed but minimal usage (mostly inline styles + Tailwind)
