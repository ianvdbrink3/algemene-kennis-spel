import CardFeed from '@/components/cards/CardFeed'
import { db } from '@/lib/db'
import { cards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function FeedPage() {
  const liveCards = await db
    .select()
    .from(cards)
    .where(eq(cards.status, 'live'))
    .limit(20)

  return <CardFeed initialCards={liveCards} />
}
