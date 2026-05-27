import type { Card } from '@/lib/db/schema'

export default function SteelmanCard({ card }: { card: Card }) {
  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Steelman
          </p>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <h1
          className="text-[1.9rem] leading-[1.25] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.hook}
        </h1>

        <p className="text-[1.05rem] leading-[1.65] text-[var(--color-muted)]">
          {card.body}
        </p>

        <p className="text-[0.85rem] leading-[1.5] text-[var(--color-text)] opacity-60">
          {card.keyInsight}
        </p>
      </div>
    </div>
  )
}
