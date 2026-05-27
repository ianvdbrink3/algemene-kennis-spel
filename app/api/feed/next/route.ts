import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards, interactions } from '@/lib/db/schema'
import { eq, notInArray, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const seen = searchParams.get('seen')?.split(',').filter(Boolean) ?? []
  const limit = 10

  // Basic query: live cards not yet seen, weighted by quality_score
  const query = db
    .select()
    .from(cards)
    .where(
      seen.length > 0
        ? sql`${cards.status} = 'live' AND ${cards.id} NOT IN (${sql.join(seen.map(id => sql`${id}::uuid`), sql`, `)})`
        : eq(cards.status, 'live')
    )
    .orderBy(sql`COALESCE(${cards.qualityScore}, 5) DESC, RANDOM()`)
    .limit(limit)

  const result = await query
  return NextResponse.json(result)
}
