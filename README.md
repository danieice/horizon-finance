# Horizon Finance

A modern digital wealth & neo-banking web application, built as a frontend-only technical assessment. All data is simulated locally — no backend, API, or database.

**Live demo:** https://YOUR-VERCEL-URL.vercel.app

## Run locally

Requires Node 18.18+ and pnpm.

    pnpm install
    pnpm dev

Open http://localhost:3000.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Recharts, Zustand, Zod, DOMPurify, Lucide icons.

## Design direction

A premium "metallic gold on near-black" identity inspired by Revolut and Wise: one accent colour (gold) used sparingly, a single typeface, generous spacing, and a mobile-first phone-frame layout. Dark and light themes share one set of design tokens.

## Modules

Four modules, each owned by one developer, built on a shared design system and global store.

- **Design System & Cards** — reusable UI kit (buttons, inputs, modals, toasts, sliders, switches), virtual card with brushed-metal styling, freeze/unfreeze, spending-limit slider, masked PAN with reveal, and a CVV that auto-hides after 5 seconds.
- **Transactions & Payments** — multi-currency transfer form with Zod validation, exchange-rate converter, searchable and paginated history, printable receipts, and payee management.
- **Analytics Dashboard** — wealth overview, financial health score, spending chart with period filters (7D/30D/90D), category breakdown, recent ledger activity, and a global Privacy Mode toggle that masks balances.
- **Security Center** — idle auto-lock after 2 minutes of inactivity, dynamic audit log of critical actions, 6-digit 2FA/OTP simulation, and XSS input sanitisation.

## Architecture

    src/
      app/
        page.tsx            splash + welcome (entry point)
        (app)/              app shell with bottom nav; home, cards, transfers, security
      components/
        shell/              phone frame, top bar, bottom nav, theme toggle
        ui/                 shared primitives (SectionHeader, button, dialog, etc.)
        cards/ transfers/ analytics/ security/ welcome/
      store/useStore.ts     global Zustand store (persisted to localStorage)
      lib/                  currency formatting, mock request helper, sanitize
      data/seed.ts          simulated accounts, cards, transactions, payees
      types/                shared TypeScript interfaces

- **Single source of truth:** one Zustand store holds the user, cards, transactions, payees, and the global `privacyMode` and `locked` flags. Every module reads and writes the same state, so a change on one screen is reflected everywhere.
- **Simulated async:** a `mockRequest` helper adds a 300–800ms delay so skeletons, loading states and toasts behave like real network calls.
- **Persistence:** store state is saved to localStorage via Zustand's persist middleware.

## Frontend security

- Free-text inputs (memos, payee names) are sanitised with DOMPurify before storage or display; no unescaped HTML injection is used.
- Card numbers are masked by default; CVV reveals on demand and auto-hides after 5 seconds.
- Global Privacy Mode masks balances instantly across the app.
- The session auto-locks after 2 minutes of inactivity.
- Money inputs are validated with Zod (no negatives, no NaN, limit checks).

## Collaboration

Four developers, one repository, protected `main`. Each module built on its own `feature/*` branch and integrated through pull requests with peer review. Conventional commit messages (`feat:`, `fix:`, `refactor:`, `chore:`).

## AI use

AI (Claude) was used as a guide for planning, design direction, and code assistance. All code was written, reviewed, and tested by the team, and each developer can explain and modify their module.