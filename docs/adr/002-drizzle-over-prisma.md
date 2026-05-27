# 002 — Drizzle ORM boven Prisma

**Context:** Twee dominante ORM-keuzes voor Next.js + Neon: Prisma en Drizzle.

**Beslissing:** Drizzle. Het heeft geen eigen query engine (geen Rust binary, geen WASM), werkt native op de Edge runtime, genereert SQL dat leesbaar is, en Neon's serverless driver werkt er direct mee. Schema is TypeScript-native zonder extra DSL. Prisma's Edge support vereist extra configuratie en de binaries maken de cold start trager op Vercel.

**Consequenties:** Iets meer verbose queries voor complexe joins. Geen Prisma Studio (wel `drizzle-kit studio`). Migrations via `drizzle-kit generate` + `drizzle-kit migrate`.
