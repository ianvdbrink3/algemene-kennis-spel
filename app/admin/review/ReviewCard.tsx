'use client'

import { useState } from 'react'
import type { Card, Concept, Domain } from '@/lib/db/schema'

interface Props {
  card: Card
  concept: Concept | null
  domain: Domain | null
}

export default function ReviewCard({ card, concept, domain }: Props) {
  const [status, setStatus] = useState<'idle' | 'approving' | 'rejecting' | 'done'>('idle')

  async function act(action: 'approve' | 'reject') {
    setStatus(action === 'approve' ? 'approving' : 'rejecting')
    await fetch(`/api/admin/cards/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setStatus('done')
  }

  if (status === 'done') return null

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-5">
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <span className="rounded bg-[var(--color-surface)] px-2 py-0.5">{card.format}</span>
        {domain && <span>{domain.name}</span>}
        {concept && <span>· {concept.title}</span>}
        {card.qualityScore && <span>· score {card.qualityScore.toFixed(1)}</span>}
      </div>

      <h2 className="mb-2 text-[1.1rem] font-medium" style={{ fontFamily: 'var(--font-display)' }}>
        {card.hook}
      </h2>
      <p className="mb-2 text-sm leading-relaxed text-[var(--color-muted)]">{card.body}</p>
      <p className="mb-4 text-xs text-[var(--color-text)] opacity-60 italic">{card.keyInsight}</p>

      <div className="flex gap-2">
        <button
          onClick={() => act('approve')}
          disabled={status !== 'idle'}
          className="flex-1 rounded-lg bg-[var(--color-accent)] py-2 text-sm font-medium text-[var(--color-bg)] disabled:opacity-50"
        >
          {status === 'approving' ? '…' : 'Publiceer'}
        </button>
        <button
          onClick={() => act('reject')}
          disabled={status !== 'idle'}
          className="flex-1 rounded-lg border border-[var(--color-border)] py-2 text-sm text-[var(--color-muted)] disabled:opacity-50"
        >
          {status === 'rejecting' ? '…' : 'Afwijzen'}
        </button>
      </div>
    </div>
  )
}
