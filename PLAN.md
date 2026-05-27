# Lumen MVP — Execution Plan

**Status:** Awaiting your "go" before Phase 1 starts.  
**Repo state:** Empty. No commits, no files.  
**Branch strategy:** Feature branches → `develop` → `main` (main only via your-approved PR).

---

## 1. Architecture Overview

```
Next.js 15 App Router (TypeScript strict)
  ├── /app                 — routes, pages, layouts
  ├── /components          — UI (server by default, client where needed)
  ├── /lib                 — shared: db, ai, auth, utils
  │   ├── /db              — Drizzle schema + client (Neon Postgres)
  │   ├── /ai              — prompts, pipeline helpers
  │   └── /inngest         — workflow functions
  ├── /inngest             — Inngest client + function registrations
  └── /public              — PWA manifest, icons, fonts

Infra:
  Neon Postgres (pgvector extension) ← Drizzle ORM
  Upstash Redis                      ← rate-limiting, session cache, feed queue
  Inngest                            ← AI generation pipeline orchestration
  Vercel                             ← hosting, OG images, edge functions
  Resend                             ← magic-link email
  PostHog                            ← analytics
  OpenAI API                         ← embeddings (text-embedding-3-small) + GPT-4.1 validation
  Anthropic API                      ← Claude Opus 4.7 (draft) + Sonnet 4.6 (quality score)
```

---

## 2. Subagent Strategy

Work is split into 5 parallel tracks. Tracks have hard dependencies at phase boundaries (e.g., frontend can't build feed until backend `/feed/next` endpoint exists), but within each phase they work concurrently on separate feature branches.

| Agent | Responsibility | Branch prefix |
|-------|---------------|---------------|
| **infra** | Scaffold, CI, DB schema, Drizzle, env config, Vercel deploy | `feat/infra-*` |
| **frontend** | Feed UI, card components, swipe, PWA, design system | `feat/frontend-*` |
| **backend** | API routes, auth (magic-link), feed service, interaction logging | `feat/backend-*` |
| **content** | Inngest AI pipeline, prompts, seed cards, admin review UI | `feat/content-*` |
| **recommendation** | pgvector setup, embeddings, candidate generation, ranking | `feat/recommendation-*` |

All PRs target `develop`. `develop` → `main` only with your approval.

---

## 3. Phase Breakdown

### Phase 1 — Foundation (Week 1)
**Goal:** Deployed empty app + migrated schema on Neon.

**infra-agent:**
- [ ] `npx create-next-app` with TypeScript strict, Tailwind v4, App Router
- [ ] Drizzle ORM setup (`drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`)
- [ ] Full schema migration (all 7 tables + pgvector extension)
- [ ] Vitest + Playwright scaffolding
- [ ] GitHub Actions CI (typecheck → lint → test on every PR)
- [ ] Vercel project linked, preview deployments active
- [ ] `.env.example` with all required vars documented

**frontend-agent (parallel):**
- [ ] Tailwind v4 config with design system values (colors, typography, easing)
- [ ] next/font setup: Inter variable + Source Serif Pro (Tiempos fallback)
- [ ] JetBrains Mono for mono
- [ ] Dark mode with CSS custom properties (system preference + manual toggle)
- [ ] Base layout: mobile-first, full-viewport, safe-area insets

**Blockers for Phase 1:**
- Need `DATABASE_URL` (Neon) — you provide
- Vercel project must exist — check Vercel connector

**Phase 1 deliverable:** Preview URL shows a styled page with fonts + dark mode. Schema migrated in Neon.

---

### Phase 2 — Auth + Card Render (Week 2-3)
**Goal:** Log in + swipe 50 cards on iPhone.

**backend-agent:**
- [ ] Magic-link auth via Resend (`/api/auth/send-link`, `/api/auth/verify`)
- [ ] Session management (Upstash Redis for session store)
- [ ] Middleware for protected routes
- [ ] Basic user CRUD (upsert on first magic-link verify)
- [ ] `/api/feed/next` endpoint (returns next N cards for user, no personalization yet — just unread cards)

**frontend-agent (parallel):**
- [ ] `CardFeed` component: virtual DOM of max 5 cards, CSS `transform` for swipe
- [ ] Framer Motion swipe gesture handler (`useMotionValue`, `useTransform`)
- [ ] 3 card format renderers: `InsightCard`, `StoryCard`, `ContrastCard`
- [ ] Bottom progress line (thin, no pagination dots)
- [ ] Login page (magic-link email input)

**content-agent (parallel):**
- [ ] Seed script: 50 hand-crafted cards (via Claude, reviewed by you) across 3 domains
- [ ] Cards cover: History (15), Economics (15), Philosophy (20)
- [ ] Seeder script: `pnpm seed:cards` inserts directly to DB bypassing pipeline

**Blockers for Phase 2:**
- Need `RESEND_API_KEY` — you provide
- Need `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — you provide

**Phase 2 deliverable:** You can log in via magic link, swipe 50 cards, swipe registers interactions in DB.

---

### Phase 3 — AI Pipeline + Feed Logic (Week 4-6)
**Goal:** 500 AI-generated cards, basic personalization.

**content-agent:**
- [ ] Inngest client + app setup (`/inngest/client.ts`, `/app/api/inngest/route.ts`)
- [ ] `generateCards` seed function (manual/cron trigger)
- [ ] Draft step: Claude Opus 4.7 with prompt template
- [ ] Validate step: GPT-4.1 cross-checks claims
- [ ] Quality score step: Claude Sonnet 4.6 as judge
- [ ] Dedup step: pgvector cosine similarity check
- [ ] Review queue: cards land in `status='review'`
- [ ] Admin route `/admin/review`: list drafts, approve/reject with one tap
- [ ] PostHog events per pipeline step (pass rate, latency, token cost)
- [ ] Run first batch: 500 cards across 6 domains

**backend-agent (parallel):**
- [ ] Interaction logging middleware: `view`, `dwell_ms`, `swipe_direction`, `depth_tap`, `save`, `share`
- [ ] `/api/interactions` POST endpoint
- [ ] Session management: create/end sessions, track card_count + dwell_ms
- [ ] `/api/cards/[id]/save` and `/api/cards/[id]/share`
- [ ] OG image generation via `@vercel/og` for share cards

**recommendation-agent (parallel):**
- [ ] pgvector index on `cards.embedding` (ivfflat, lists=100)
- [ ] pgvector index on `users.embedding` + `concepts.embedding`
- [ ] Embedding generation on card publish (OpenAI text-embedding-3-small)
- [ ] User embedding: rolling average of last 20 seen cards
- [ ] `/api/feed/next` v2: candidate generation via cosine similarity, rerank by recency/quality
- [ ] Cold start: new users get top-quality cards across domains (no personalization)

**frontend-agent (parallel):**
- [ ] Admin review UI (mobile-friendly, approve/reject swipe or button)
- [ ] Save button + saved feed view
- [ ] Share sheet (native share API + copy link fallback)

**Blockers for Phase 3:**
- Need `INNGEST_SIGNING_KEY` + `INNGEST_EVENT_KEY` — you provide
- Need `OPENAI_API_KEY` — you provide
- Need `POSTHOG_API_KEY` — you provide
- Need `ANTHROPIC_API_KEY` — you already have this

**Phase 3 deliverable:** Pipeline running, 500 cards live, feed shows personalized content after ~10 interactions.

---

### Phase 4 — Polish + Scale (Week 7-10)
**Goal:** Closed alpha-ready. 3,000 cards. PWA offline mode.

**All agents:**
- [ ] PWA manifest + service worker (Workbox via `next-pwa`)
- [ ] Offline: cache last 50 cards in IndexedDB
- [ ] Performance audits: LCP <1.8s, JS bundle <120KB gzipped
- [ ] Swipe latency profiling: must stay <16ms (1 frame at 60fps)
- [ ] Scale content to 3,000 cards (automated pipeline batches)
- [ ] Full onboarding: 6 diagnostic cards, baseline from behavior
- [ ] 7 remaining card formats stubbed (ready for content, render-complete): `visual`, `timeline`, `quote`, `mini-sim`, `steelman`, `map`, `question`
- [ ] Error boundaries, loading skeletons, retry logic
- [ ] Accessibility: WCAG AA minimum, keyboard navigation for admin

**Phase 4 deliverable:** App passes Lighthouse PWA audit. 3,000 cards. Ready for 20 testers.

---

### Phase 5 — Closed Alpha (Week 11-12)
**Goal:** Real usage data. Go/no-go decision on V1.

- Invite 20 testers via magic-link
- Monitor PostHog: session length, swipe velocity, save rate, return rate
- Fix top issues from tester feedback
- Produce go/no-go report in `/STATUS.md`

---

## 4. External Accounts You Need to Create

I cannot create these — I need your API keys before the relevant phase starts:

| Service | Used for | When needed | Signup link |
|---------|---------|------------|------------|
| **Neon** | Postgres + pgvector | Phase 1 | https://neon.tech |
| **Upstash** | Redis (session cache, rate limiting) | Phase 2 | https://upstash.com |
| **Resend** | Magic-link emails | Phase 2 | https://resend.com |
| **Inngest** | AI pipeline orchestration | Phase 3 | https://inngest.com |
| **PostHog** | Analytics | Phase 3 | https://posthog.com |
| **OpenAI** | Embeddings + GPT-4.1 validation | Phase 3 | https://platform.openai.com |
| **Anthropic** | Claude Opus/Sonnet | Phase 3 | ✅ Already have |
| **Vercel** | Hosting | Phase 1 | ✅ Already connected |
| **Pinecone** | Vector search at scale | Post-MVP (>50k cards) | https://pinecone.io — wait |

**Env vars I'll need from you** (exact names, add to Vercel + local `.env.local`):
```
DATABASE_URL=                    # Neon connection string (pooler URL)
DATABASE_URL_DIRECT=             # Neon direct URL (for migrations)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
NEXTAUTH_SECRET=                 # any random 32-char string
NEXTAUTH_URL=                    # your Vercel preview URL initially
ADMIN_EMAIL=iandepian@gmail.com  # only this email can access /admin
```

---

## 5. ADRs to Write (as we go)

| # | Title | Phase |
|---|-------|-------|
| 001 | Use pgvector instead of Pinecone for MVP | 1 |
| 002 | Use Drizzle ORM over Prisma | 1 |
| 003 | Magic-link auth over OAuth/passwords | 1 |
| 004 | Inngest for pipeline orchestration over custom queue | 3 |
| 005 | GPT-4.1 as validator (not Claude) for provider diversity | 3 |
| 006 | Framer Motion for swipe over custom touch handlers | 2 |

---

## 6. Risks & Decisions Needed

**I will stop and ask you before:**
- Any service with >€50/month recurring cost
- DB schema changes after initial migration
- Creating external service accounts (I'll give you the signup link)
- Any naming/branding decision

**Known risks:**
1. **Neon free tier** (0.5 GB storage, 1 compute unit) may not hold 3,000 cards with embeddings. At ~10KB/card + vector, ~30MB total — should be fine on free tier. Will alert if approaching limit.
2. **Inngest free tier** limits: 50k function runs/month. At ~5 steps/card × 500 cards = 2,500 runs for Phase 3 batch — well within limits.
3. **OpenAI embedding costs**: 3,000 cards × 384 dimensions × text-embedding-3-small = ~$0.006 total. Negligible.
4. **Claude Opus 4.7 draft costs**: ~1,000 tokens/card × 3,000 cards = ~$45 total for full corpus. Well under €50 but I'll report this before running the full batch.

---

## 7. File Structure (planned)

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── verify/page.tsx
│   ├── (app)/
│   │   ├── feed/page.tsx
│   │   └── saved/page.tsx
│   ├── admin/
│   │   └── review/page.tsx
│   ├── api/
│   │   ├── auth/[...route]/route.ts
│   │   ├── feed/next/route.ts
│   │   ├── interactions/route.ts
│   │   ├── cards/[id]/
│   │   │   ├── save/route.ts
│   │   │   └── share/route.ts
│   │   ├── og/route.tsx
│   │   └── inngest/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── cards/
│   │   ├── CardFeed.tsx          (client)
│   │   ├── InsightCard.tsx
│   │   ├── StoryCard.tsx
│   │   └── ContrastCard.tsx
│   └── ui/
│       ├── ProgressLine.tsx
│       └── DarkModeToggle.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts             (Drizzle schema)
│   │   ├── index.ts              (Neon client)
│   │   └── queries/
│   ├── ai/
│   │   ├── prompts/
│   │   │   ├── draft.ts
│   │   │   ├── validate.ts
│   │   │   └── quality-score.ts
│   │   └── pipeline.ts
│   ├── auth/
│   │   └── session.ts
│   └── analytics/
│       └── posthog.ts
├── inngest/
│   ├── client.ts
│   └── functions/
│       ├── generate-cards.ts
│       ├── draft-card.ts
│       ├── validate-card.ts
│       ├── score-card.ts
│       └── dedup-card.ts
├── drizzle/
│   └── migrations/
├── docs/
│   └── adr/
├── public/
│   ├── manifest.json
│   └── icons/
├── tests/
│   ├── unit/
│   └── e2e/
├── PLAN.md
├── STATUS.md
├── drizzle.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## 8. What I'm NOT Doing (to stay in scope)

Explicitly out of scope per your spec:
- Voice / TTS
- Quizzes
- Curiosity Map
- Streaks
- Payments
- Native app
- Push notifications
- Multi-language
- Pinecone (unless >50k cards)

---

## Ready to Start

**Once you say "go":**
1. I create `develop` branch
2. infra-agent + frontend-agent start Phase 1 in parallel
3. First PR within ~2 hours

**Questions for you before I start:**

**A) Domain name** — do you have a custom domain ready, or should I configure Vercel with the default `*.vercel.app` URL for now?

**B) Neon project** — free tier should work for MVP. Do you want me to use Neon's Vercel integration (auto-injects `DATABASE_URL`) or will you add the connection string manually?

**C) Admin access** — I'll lock `/admin` to `iandepian@gmail.com` (from your session context). Confirm this is your intended admin email?

Awaiting your "go".
