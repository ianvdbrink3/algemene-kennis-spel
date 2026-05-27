import { db } from '@/lib/db'
import { cards, concepts, domains } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import ReviewCard from './ReviewCard'

export default async function ReviewPage() {
  const drafts = await db
    .select({
      card: cards,
      concept: concepts,
      domain: domains,
    })
    .from(cards)
    .leftJoin(concepts, eq(cards.conceptId, concepts.id))
    .leftJoin(domains, eq(concepts.domainId, domains.id))
    .where(eq(cards.status, 'review'))
    .orderBy(cards.createdAt)
    .limit(50)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium">Review queue ({drafts.length})</h1>
        <SeedButton />
      </div>

      {drafts.length === 0 ? (
        <p className="text-[var(--color-muted)]">Queue is leeg.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map(({ card, concept, domain }) => (
            <ReviewCard key={card.id} card={card} concept={concept} domain={domain} />
          ))}
        </div>
      )}
    </div>
  )
}

function SeedButton() {
  return (
    <form action="/api/admin/seed" method="POST">
      <button
        type="submit"
        className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        Seed 50 kaarten
      </button>
    </form>
  )
}
