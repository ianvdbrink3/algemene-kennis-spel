import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await getSession()
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action } = await request.json() as { action: 'approve' | 'reject' }

  if (action === 'approve') {
    await db
      .update(cards)
      .set({ status: 'live', publishedAt: new Date() })
      .where(eq(cards.id, id))
  } else {
    await db
      .update(cards)
      .set({ status: 'rejected' })
      .where(eq(cards.id, id))
  }

  return NextResponse.json({ ok: true })
}
