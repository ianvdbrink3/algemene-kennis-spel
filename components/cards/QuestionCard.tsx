import type { Card } from '@/lib/db/schema'

export default function QuestionCard({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          Vraag
        </p>

        <h1
          className="text-[2.2rem] leading-[1.25] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.hook}
        </h1>

        <div className="h-px w-12 bg-[var(--color-accent)]" />

        <p className="text-[1.05rem] leading-[1.65] text-[var(--color-muted)]">
          {card.body}
        </p>

        <p className="text-[0.9rem] leading-[1.5] text-[var(--color-text)] opacity-75">
          {card.keyInsight}
        </p>
      </div>
    </div>
  )
}
