# NWWW - The New World Wide Web (Beta) Development Context

## Project Overview
This is a modern BBS application inspired by 2ch, but designed as a "Knowledge Crossroads" for the AI era.
It features anonymous posting, thread-based discussions, and AI-powered features.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma)
- **Styling**: Vanilla CSS (CSS Modules) - No Tailwind.
- **Icons**: Lucide React

## Design System
- **Colors**: Defined in `src/app/globals.css` (CSS Variables).
  - `--background`, `--foreground`: Base colors (Theme-aware).
  - `--accent`: Subtle gray/hover.
  - `--primary`: #0f172a (Slate).
- **Fonts**: Inter (Google Fonts).
- **Aesthetic**: Minimalist, News-site style (e.g., Quartz, Wired). High contrast, ample whitespace.

## Core Features Implemented
1.  **AI Thread Generation (Beta)**:
    - URL-based thread creation (`/api/thread/generate`).
    - Uses Gemini API to fetch content, sumamrize, select a Board, and generate an initial post.
    - Unified UI on Top Page and Board Page (Modal + Pill Button).

2.  **Thread Recommendations**:
    - **PICK UP**: Momentum algorithm (`postCount / hoursElapsed`).
    - **Discover**: History-based affinity (`localStorage`).

3.  **Components**:
    - `TopSparkCTA`: The main AI generator CTA (Top Page).
    - `NewThreadForm`: Board-specific thread creation (Manual + AI).
    - `ThreadInteractiveView`: Thread display with anonymous posting.

## Development Rules
- **CSS**: Use CSS Modules (`*.module.css`). Do NOT use inline styles unless dynamic.
- **Server Actions**: Use `src/app/actions.ts` for form handling.
- **Data Fetching**: Use `sys/data/db-actions.ts` (Prisma calls).
- **Prisma**: Run `npx prisma db push` after schema changes.

## Current Tasks
- [x] Top Page AI Generator (Done)
- [x] Recommendation Algorithms (Done)
- [ ] Implement Search functionality (Pending)
- [ ] Implement Tag system (Pending)

## Commands
- **Dev Server**: `npm run dev`
- **Lint**: `npm run lint`
- **Build**: `npm run build`
