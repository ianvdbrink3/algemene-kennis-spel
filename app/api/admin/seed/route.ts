import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { domains, concepts, cards } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import SEED_CARDS from '@/lib/seed/cards'

const DOMAINS = [
  { slug: 'history', name: 'Geschiedenis' },
  { slug: 'economics', name: 'Economie' },
  { slug: 'philosophy', name: 'Filosofie' },
]

export async function POST(request: Request) {
  const authenticated = await getSession()
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Upsert domains
  const domainMap = new Map<string, string>()
  for (const d of DOMAINS) {
    const [row] = await db
      .insert(domains)
      .values(d)
      .onConflictDoUpdate({ target: domains.slug, set: { name: d.name } })
      .returning()
    domainMap.set(d.slug, row!.id)
  }

  // Insert cards (create a stub concept per card for simplicity)
  let inserted = 0
  for (const card of SEED_CARDS) {
    const domainId = domainMap.get(card.domain)!

    // Stub concept: one per card, slug derived from hook
    const conceptSlug = card.hook
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 6)

    const [concept] = await db
      .insert(concepts)
      .values({
        slug: conceptSlug,
        title: card.hook.slice(0, 80),
        canonicalDef: card.keyInsight,
        domainId,
        topics: card.topics,
        difficulty: 2,
      })
      .returning()

    await db.insert(cards).values({
      conceptId: concept!.id,
      format: card.format,
      hook: card.hook,
      body: card.body,
      keyInsight: card.keyInsight,
      difficulty: 2,
      qualityScore: 8.0,
      status: 'live',
      publishedAt: new Date(),
    })

    inserted++
  }

  return NextResponse.json({ ok: true, inserted })
}
