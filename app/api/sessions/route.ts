import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  const [session] = await db.insert(sessions).values({}).returning()
  return NextResponse.json({ sessionId: session!.id })
}

export async function PATCH(request: Request) {
  const { sessionId, cardCount, totalDwellMs } = await request.json() as {
    sessionId: string
    cardCount: number
    totalDwellMs: number
  }

  await db
    .update(sessions)
    .set({ endedAt: new Date(), cardCount, totalDwellMs })
    .where(eq(sessions.id, sessionId))

  return NextResponse.json({ ok: true })
}
