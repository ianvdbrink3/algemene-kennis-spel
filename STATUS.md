# Lumen — Status

**Laatste update:** Phase 2 klaar, deployment bezig

---

## Klaar

### Phase 1 — Foundation ✅
- Next.js 15 + TypeScript strict + Tailwind v4
- Design system: `#0E0E0E` bg, `#E89B7B` accent, Inter + Source Serif 4
- Password auth (ADMIN_PASSWORD env var + JWT cookie)
- Middleware beschermt alle routes behalve `/login`
- Drizzle ORM schema: 6 tabellen (domains, concepts, cards, sessions, interactions, saved_cards)
- Vercel deployed en READY
- Neon integratie: migrations draaien automatisch bij elke deploy

### Phase 2 — Feed UI ✅ (deployment bezig)
- `CardFeed`: virtualized swipe feed, max 5 in DOM
- Framer Motion swipe (80px drempel + velocity), easing `cubic-bezier(0.32, 0.72, 0.24, 1)`
- 6 card formats gerenderd: insight, story, contrast, quote, question, steelman
- Progress line onderaan
- `/api/feed/next`: kaarten ophalen, quality-gewogen, geziene kaarten uitgesloten
- `/api/interactions`: logging van view/swipe/dwell
- `/api/sessions`: sessie tracking

---

## Geblokkeerd / Openstaand

- **Seed cards**: DB is leeg. Feed toont "Geen kaarten beschikbaar." totdat er content is.
  → Volgende stap: 50 seed cards genereren via Claude en in DB laden

---

## Volgende stap

**Phase 2 afronden:** 50 seed cards schrijven en seeden zodat de feed echt werkt op je telefoon.

Zodra je "go" geeft (of "begin met seed cards"), genereer ik:
- 50 kaarten verspreid over 3 domeinen (Geschichte, Economie, Filosofie)
- Mix van alle 6 formats
- Direct als `status='live'` in de DB via een seed script

Daarna: Phase 3 (Inngest AI pipeline) zodat je kaarten kunt blijven genereren zonder handmatig werk.
