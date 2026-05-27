import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { interactions, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface InteractionPayload {
  cardId: string
  eventType: 'view' | 'swipe_up' | 'swipe_down' | 'save' | 'depth_tap'
  dwellMs?: number
  positionInSession?: number
  sessionId?: string
}

export async function POST(request: Request) {
  const body = await request.json() as InteractionPayload

  await db.insert(interactions).values({
    cardId: body.cardId,
    eventType: body.eventType,
    dwellMs: body.dwellMs ?? null,
    positionInSession: body.positionInSession ?? null,
    sessionId: body.sessionId ?? null,
  })

  return NextResponse.json({ ok: true })
}
