import type { Card } from '@/lib/db/schema'

export default function StoryCard({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-6">
        <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">
          Verhaal
        </p>

        <h1
          className="text-[2rem] leading-[1.2] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.hook}
        </h1>

        <p className="text-[1.05rem] leading-[1.65] text-[var(--color-muted)]">
          {card.body}
        </p>

        <p className="text-[0.9rem] italic leading-[1.5] text-[var(--color-text)] opacity-70">
          {card.keyInsight}
        </p>
      </div>
    </div>
  )
}
