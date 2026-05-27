import type { Card } from '@/lib/db/schema'

export default function InsightCard({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-6">
        <h1
          className="text-[2rem] leading-[1.2] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.hook}
        </h1>

        <p className="text-[1.05rem] leading-[1.65] text-[var(--color-muted)]">
          {card.body}
        </p>

        <div className="border-l-2 border-[var(--color-accent)] pl-4">
          <p className="text-[0.9rem] leading-[1.5] text-[var(--color-text)] opacity-80">
            {card.keyInsight}
          </p>
        </div>
      </div>
    </div>
  )
}
