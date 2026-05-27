import type { Card } from '@/lib/db/schema'

export default function ContrastCard({ card }: { card: Card }) {
  // body format: "Stelling A || Stelling B" — split on ||
  const parts = card.body.split('||').map((s: string) => s.trim())
  const [before, after] = parts.length === 2 ? parts : [card.body, '']

  return (
    <div className="flex h-full flex-col justify-center px-6" style={{ paddingTop: '15%' }}>
      <div className="flex flex-col gap-5">
        <h1
          className="text-[2rem] leading-[1.2] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {card.hook}
        </h1>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-[var(--color-surface)] p-4">
            <p className="text-[0.85rem] uppercase tracking-wider text-[var(--color-muted)] mb-2">
              Je denkt
            </p>
            <p className="text-[1rem] leading-[1.55] text-[var(--color-text)] opacity-70">
              {before}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-accent)] border-opacity-40 p-4">
            <p className="text-[0.85rem] uppercase tracking-wider text-[var(--color-accent)] mb-2">
              Maar eigenlijk
            </p>
            <p className="text-[1rem] leading-[1.55] text-[var(--color-text)]">
              {after || card.keyInsight}
            </p>
          </div>
        </div>

        {after && (
          <p className="text-[0.85rem] leading-[1.5] text-[var(--color-muted)]">
            {card.keyInsight}
          </p>
        )}
      </div>
    </div>
  )
}
