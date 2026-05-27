# Lumen MVP — Execution Plan (v2, simplified)

**Status:** Awaiting your "go".  
**Repo state:** Empty. No commits besides this file.  
**Doel:** Jij scrolt door AI-gegenereerde kenniskaarten. Vermakelijk, verslavend, leerzaam.

---

## 1. Wat het is (simpel gezegd)

Een full-screen swipeable tekst-feed voor één gebruiker (jij). Geen plaatjes, geen social features, geen accounts voor anderen. Voelt als TikTok, gevuld met interessante dingen om te leren.

**Core loop:** open app → swipe omhoog → leer iets → swipe → leer iets → 20 minuten later besef je dat je al laat bent.

---

## 2. Stack (zo min mogelijk)

```
Next.js 15 (App Router, TypeScript strict)
Neon Postgres          ← database, alles in één
Inngest                ← AI pipeline orchestration
Anthropic API          ← Claude Opus 4.7 (draft) + Sonnet 4.6 (score)
Tailwind v4            ← styling
Framer Motion          ← swipe animaties
```

**Geen:** Redis, Resend, OpenAI, Pinecone, image hosting, OG images, vector embeddings (in MVP).

**Auth:** één env var `ADMIN_PASSWORD`. Simpel wachtwoordveldje, cookie na login. Jij bent de enige gebruiker.

---

## 3. Card formats (allemaal puur tekst)

| Format | Structuur |
|--------|-----------|
| `insight` | Hook (≤12 woorden) + uitleg (50-80 woorden) + key takeaway |
| `story` | Mini-verhaal met twist — altijd een concrete situatie |
| `contrast` | "Je denkt X. Maar eigenlijk Y." — twee frames tegenover elkaar |
| `quote` | Sterke quote + 2 zinnen context over wie/waarom het raak is |
| `question` | Eén vraag die blijft hangen + kort antwoord dat weer vragen oproept |
| `steelman` | Beste argument voor een onpopulair of tegendraads standpunt |

---

## 4. Database schema (lean)

```sql
-- pgvector extension niet nodig in MVP
-- Drizzle ORM voor type-safe queries

domains (id, slug, name)
-- history, economics, philosophy, psychology, science, geopolitics

concepts (id uuid pk, slug unique, title, canonical_def, domain_id,
          topics text[], difficulty smallint, sources jsonb, created_at)

cards (id uuid pk, concept_id fk, format, hook, body, key_insight,
       difficulty smallint, quality_score real, sources jsonb,
       status,  -- 'draft' | 'review' | 'live' | 'rejected'
       metadata jsonb, created_at, published_at)

interactions (id bigserial pk, card_id, event_type, dwell_ms,
              position_in_session, session_id, created_at)
-- event_type: 'view' | 'swipe_up' | 'swipe_down' | 'save' | 'depth_tap'

sessions (id uuid pk, started_at, ended_at, card_count, total_dwell_ms)

saved_cards (card_id pk, saved_at)
```

**Recommendation logica (geen ML):** track welke domains + topics je het langst bekijkt (dwell_ms). Feed = gewogen random op die scores, gecorrigeerd voor recency (al geziene kaarten eruit).

---

## 5. Subagent aanpak

Twee parallelle tracks in Phase 1, daarna convergeren ze.

| Track | Wat |
|-------|-----|
| **infra + backend** | Scaffold, DB, auth, API routes, feed logic |
| **frontend** | Design system, card components, swipe mechanic |

Content (AI pipeline) start pas in Phase 3 — eerst zorgen dat de feed werkt met handgeschreven seed cards.

---

## 6. Fases

### Phase 1 — Foundation (Week 1)
**Deliverable:** Deployed app op Vercel preview URL. Schema gemigreerd. Fonts + dark mode werken.

- [ ] `create-next-app` + TypeScript strict + Tailwind v4 + App Router
- [ ] Drizzle setup + Neon connectie + alle tabellen gemigreerd
- [ ] Design system: kleuren, Inter + Source Serif Pro (Tiempos fallback), JetBrains Mono
- [ ] Dark mode (CSS custom properties, system preference)
- [ ] Simpele auth: wachtwoord → signed cookie → protected routes
- [ ] Vitest scaffolding
- [ ] Vercel deploy (preview URL)

**Externe accounts nodig:** alleen **Neon** (gratis tier is prima voor MVP).

---

### Phase 2 — Feed werkt (Week 2-3)
**Deliverable:** Jij swipt door 50 handgeschreven kaarten op je telefoon.

- [ ] `CardFeed` component: max 5 cards in DOM (virtualized), CSS transform
- [ ] Framer Motion swipe gesture (omhoog = volgende, omlaag = vorige)
- [ ] 6 card format renderers (allemaal tekst)
- [ ] Progress line onderaan (dun, geen dots)
- [ ] 50 seed cards handmatig geschreven (via Claude, door mij reviewed) — 3 domeinen
- [ ] `/api/feed/next` endpoint: geeft volgende batch cards terug (nog niet gepersonaliseerd)
- [ ] Interaction logging: view + dwell_ms registreren bij elke kaart
- [ ] Session tracking: start/einde, card count

---

### Phase 3 — AI Pipeline (Week 4-6)
**Deliverable:** 500 AI-gegenereerde kaarten live. Pipeline draait automatisch.

- [ ] Inngest client + `/api/inngest` route
- [ ] `generateCards` function (handmatig te triggeren + cron)
- [ ] Draft step: Claude Opus 4.7 met prompt templates per format
- [ ] Quality score step: Claude Sonnet 4.6 als judge (curiosity_gap, clarity, originality, payoff — elk 1-10, drempel ≥7)
- [ ] Dedup step: simpele tekst-similarity check (geen vectors — Jaccard op woorden is goed genoeg voor MVP)
- [ ] Admin route `/admin/review`: lijst drafts, approve/reject
- [ ] Eerste batch: 500 kaarten, 6 domeinen

**Externe accounts nodig:** **Inngest** (gratis tier: 50k runs/maand, ruim voldoende).

---

### Phase 4 — Personalisatie + Polish (Week 7-9)
**Deliverable:** Feed voelt persoonlijk. App is PWA. Klaar voor dagelijks gebruik.

- [ ] Recommendation v1: dwell_ms per domain/topic → gewogen feed
- [ ] Swipe down = "minder hiervan" signaal
- [ ] Save functie (simpele lijst van opgeslagen kaarten)
- [ ] PWA manifest + service worker (offline: laatste 50 kaarten leesbaar)
- [ ] Performance: LCP <1.8s, swipe <16ms latency
- [ ] Schaal content naar 3.000 kaarten via pipeline batches

---

### Phase 5 — Dagelijks gebruik (Week 10-12)
**Deliverable:** Jij gebruikt het elke dag. Eventueel 1-2 vrienden erbij.

- [ ] Monitoring: query performance, pipeline kosten bijhouden
- [ ] Eventueel: uitbreiden naar meer gebruikers als je het wil delen
- [ ] Beslissen of pgvector embeddings de moeite waard zijn (alleen als recommendation te grof aanvoelt)

---

## 7. Externe accounts (alles wat je nodig hebt)

| Service | Waarvoor | Wanneer | Link |
|---------|---------|---------|------|
| **Neon** | Postgres database | Phase 1 | https://neon.tech |
| **Inngest** | AI pipeline | Phase 3 | https://inngest.com |
| **Anthropic** | Claude API | Phase 3 | ✅ Heb je al |
| **Vercel** | Hosting | Phase 1 | ✅ Al verbonden |

Dat is het. Vier diensten totaal, twee heb je al.

---

## 8. Env vars

```
DATABASE_URL=           # Neon pooler connection string
DATABASE_URL_DIRECT=    # Neon direct connection string (voor migrations)
ADMIN_PASSWORD=         # jouw wachtwoord voor de app
ANTHROPIC_API_KEY=      # heb je al
INNGEST_SIGNING_KEY=    # van Inngest dashboard
INNGEST_EVENT_KEY=      # van Inngest dashboard
```

---

## 9. Design

- **Achtergrond:** `#0E0E0E` (dark, altijd — geen light mode nodig voor solo gebruik tenzij je dat wil)
- **Tekst:** `#F0F0F0` primair, `#999999` secundair
- **Accent:** `#E89B7B` (voor hooks, highlights)
- **Hook font:** Source Serif Pro (serif, groot, trekt aandacht)
- **Body font:** Inter variable
- **Padding:** 24px horizontaal
- **Swipe easing:** `cubic-bezier(0.32, 0.72, 0.24, 1)`, 120-350ms

---

## 10. Wat ik niet bouw

- Plaatjes / visuele kaartformaten
- Share functie / OG images
- Meerdere gebruikers / auth systeem
- Push notificaties
- Streaks / gamification
- Betalingen
- Native app
- Quizzes
- Vector embeddings (tenzij recommendation te grof aanvoelt in Phase 5)

---

## Klaar om te starten

Zeg "go" en ik begin met Phase 1. Maak eerst een Neon account aan en geef me:
- `DATABASE_URL` (pooler)
- `DATABASE_URL_DIRECT` (direct)
- `ADMIN_PASSWORD` (wat je wil)

Verder heb ik niets nodig voor Phase 1 en 2.
