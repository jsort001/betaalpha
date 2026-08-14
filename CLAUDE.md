# Beta Alpha Project Manager

Task/project management web app for Beta Alpha chapter of La Unidad Latina,
Lambda Upsilon Lambda Fraternity, Incorporated. Built for ~5 undergrads and
~10 alumni.

## Stack

- Next.js 15 App Router + TypeScript, Tailwind + shadcn/ui (built on **Base
  UI**, not Radix — use the `render` prop, e.g. `<DialogTrigger render={trigger} />`,
  not `asChild`)
- Supabase: Postgres + Row Level Security, Google OAuth gated by an
  `allowlist` table, Edge Functions (Deno) for scheduled email/Slack
  notifications
- Vercel hosting. No test suite; verification is `npx tsc --noEmit` +
  `npm run lint` + checking the dev server compiles (and manually in the
  Browser pane when the change is visual).

## Data model essentials

- `public.users` only gets a row via the `handle_new_user()` trigger the
  first time someone signs in with an email that matches `allowlist`. Before
  that, a task can still be assigned to them via `tasks.pending_owner_email`
  (references `allowlist.email`), which auto-resolves to a real `owner_id`
  on first sign-in.
- Both `undergrad` and `alumni` roles have full board/task CRUD and
  reassignment permissions (opened up from alumni-only in migration 0020).
  Only allowlist/sign-in management (`allowlist_alumni_only` policy) remains
  alumni-only.
- Avoid PostgREST embedded-relation selects (`.select("*, other_table(*)")`)
  — the hand-written `Database` type in `lib/supabase/types.ts` doesn't
  model relationships. Do manual `Map` joins instead, as every existing page
  does.
- Migrations are sequentially numbered in `supabase/migrations/`, applied
  live with `supabase db push --yes`. **Before rewriting a trigger function
  or policy that appears in more than one migration, grep for every
  migration that touches it and read the latest one** — not the original
  `0001_init.sql`. A rewrite based on a stale version has silently
  reintroduced a previously-fixed bug at least twice in this project's
  history (see `0013`→`0018` regression, fixed in `0019`).

## Brand

- Colors (see comment in `app/globals.css`): Brown `#653819` (primary),
  Gold `#EEAA00` (accent). Red is ceremonial/crest-only, deliberately not
  used in everyday UI.
- Fonts: `Stellar` (`fonts/Stellar-*.otf`, self-hosted via `next/font/local`)
  for headings, Helvetica Neue for body text. Both are already wired up in
  `app/layout.tsx` / `app/globals.css` — reuse `font-heading` / default
  body font rather than reaching for a new typeface.
- Crest logo: `public/logo.png` (large, non-square, ~4032×4500 — pad to
  square rather than crop if it needs to go somewhere like a Slack icon).

## Conventions

- Mobile-responsive changes: add a sibling block gated by Tailwind
  breakpoints (`hidden sm:block` / `sm:hidden`), not conditional classes on
  one shared block. Desktop markup stays untouched. Tables with more than
  ~4-5 columns get a real stacked-card mobile layout, not just horizontal
  scroll.
- Commit only when explicitly asked ("commit and push"), after verifying
  (tsc/lint/dev server, or a Browser pane check for visual changes). Prefer
  one focused commit per feature/fix; split unrelated changes into separate
  commits.
- Public unauthenticated endpoints (e.g. the `/api/calendar/[token]/events.ics`
  iCal feed): add the path prefix to `PUBLIC_PREFIXES` in
  `lib/supabase/middleware.ts` or the session-check middleware redirects
  every request to `/`. Fetch data with `createServiceClient()`
  (`lib/supabase/service.ts`, needs `SUPABASE_SERVICE_ROLE_KEY` — server-only,
  bypasses RLS) since there's no user session to authenticate the request;
  gate access with an app-level secret instead (see
  `calendar_feed_settings`), and diff against `supabase/migrations/0022`
  before changing that gate.
- Notifications: `supabase/functions/send-task-notifications` (Resend email
  + Slack webhook, on a 15-min `pg_cron` poll) and `send-nudge` (manual,
  per-person allowlist reminder). Both need `supabase functions deploy
  <name>` after edits — they're Deno, excluded from the Next.js
  tsconfig/lint, so verify by deploying and checking `supabase db query`
  output rather than tsc.
