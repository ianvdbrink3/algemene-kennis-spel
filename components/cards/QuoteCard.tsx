import type { Card } from '@/lib/db/schema'

export default function QuoteCard({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-6">
        <span
          className="text-6xl leading-none text-[var(--color-accent)] opacity-40"
          style={{ fontFamily: 'var(--font-display)' }}
          aria-hidden
        >
          "
        </span>

        <blockquote
          className="text-[1.5rem] leading-[1.4] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          {card.hook}
        </blockquote>

        <p className="text-sm text-[var(--color-accent)]">{card.body}</p>

        <p className="text-[0.9rem] leading-[1.55] text-[var(--color-muted)]">
          {card.keyInsight}
        </p>
      </div>
    </div>
  )
}
