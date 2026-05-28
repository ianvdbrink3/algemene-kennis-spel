'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import type { Card } from '@/lib/db/schema'
import CardRenderer from './CardRenderer'

interface Props {
  initialCards: Card[]
}

export default function CardFeed({ initialCards }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [totalDwell, setTotalDwell] = useState(0)
  const viewStartRef = useRef<number>(Date.now())
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/sessions', { method: 'POST' })
      .then(r => r.json())
      .then(({ sessionId: id }: { sessionId: string }) => setSessionId(id))
  }, [])

  useEffect(() => {
    const card = cards[index]
    if (!card) return
    viewStartRef.current = Date.now()
    if (!seenIds.current.has(card.id)) {
      seenIds.current.add(card.id)
      logInteraction(card.id, 'view', 0)
    }
  }, [index]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (index >= cards.length - 3) {
      const seen = [...seenIds.current].join(',')
      fetch(`/api/feed/next?seen=${seen}`)
        .then(r => r.json())
        .then((next: Card[]) => {
          if (next.length > 0) setCards(prev => [...prev, ...next])
        })
    }
  }, [index, cards.length])

  function logInteraction(cardId: string, eventType: string, dwellMs: number) {
    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, eventType, dwellMs, positionInSession: cardCount, sessionId }),
    })
  }

  const goNext = useCallback(() => {
    const card = cards[index]
    if (!card) return
    const dwell = Date.now() - viewStartRef.current
    logInteraction(card.id, 'swipe_up', dwell)
    setTotalDwell(t => t + dwell)
    setCardCount(c => c + 1)
    setDirection('up')
    setIndex(i => i + 1)
  }, [index, cards, cardCount, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const goPrev = useCallback(() => {
    if (index === 0) return
    const card = cards[index]
    if (card) logInteraction(card.id, 'swipe_down', 0)
    setDirection('down')
    setIndex(i => i - 1)
  }, [index, cards, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentCard = cards[index]

  if (!currentCard) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[var(--color-muted)]">Geen kaarten meer.</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <SwipeableCard
          key={currentCard.id}
          card={currentCard}
          direction={direction}
          onSwipeUp={goNext}
          onSwipeDown={index > 0 ? goPrev : undefined}
        />
      </AnimatePresence>
      <ProgressLine current={index} total={cards.length} />
    </div>
  )
}

interface SwipeableCardProps {
  card: Card
  direction: 'up' | 'down'
  onSwipeUp: () => void
  onSwipeDown?: () => void
}

function SwipeableCard({ card, direction, onSwipeUp, onSwipeDown }: SwipeableCardProps) {
  const y = useMotionValue(0)
  // Fade out slightly when dragging far
  const opacity = useTransform(y, [-150, -60, 0, 60, 150], [0.4, 1, 1, 1, 0.4])

  return (
    <motion.div
      className="absolute inset-0 bg-[var(--color-bg)]"
      style={{ y, opacity }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80 || info.velocity.y < -500) {
          onSwipeUp()
        } else if (onSwipeDown && (info.offset.y > 80 || info.velocity.y > 500)) {
          onSwipeDown()
        }
      }}
      custom={direction}
      initial={{ y: direction === 'up' ? '100%' : '-100%' }}
      animate={{ y: 0 }}
      exit={{ y: direction === 'up' ? '-100%' : '100%' }}
      transition={{ ease: [0.32, 0.72, 0.24, 1], duration: 0.3 }}
    >
      <CardRenderer card={card} />
    </motion.div>
  )
}

function ProgressLine({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? Math.min(((current + 1) / total) * 100, 100) : 0
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-border)]">
      <div
        className="h-full bg-[var(--color-accent)] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
