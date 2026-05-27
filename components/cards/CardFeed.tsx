'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import type { Card } from '@/lib/db/schema'
import CardRenderer from './CardRenderer'

interface Props {
  initialCards: Card[]
}

const SWIPE_THRESHOLD = 80
const VISIBLE_WINDOW = 5

export default function CardFeed({ initialCards }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [index, setIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [cardCount, setCardCount] = useState(0)
  const [totalDwell, setTotalDwell] = useState(0)
  const viewStartRef = useRef<number>(Date.now())
  const seenIds = useRef<Set<string>>(new Set())

  // Start session on mount
  useEffect(() => {
    fetch('/api/sessions', { method: 'POST' })
      .then(r => r.json())
      .then(({ sessionId }) => setSessionId(sessionId))

    return () => {
      // End session on unmount
      if (sessionId) {
        navigator.sendBeacon(
          '/api/sessions',
          JSON.stringify({ sessionId, cardCount, totalDwellMs: totalDwell })
        )
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Log view when card changes
  useEffect(() => {
    const card = cards[index]
    if (!card) return

    viewStartRef.current = Date.now()

    if (!seenIds.current.has(card.id)) {
      seenIds.current.add(card.id)
      logInteraction(card.id, 'view', 0)
    }
  }, [index, cards])

  // Fetch more cards when approaching the end
  useEffect(() => {
    if (index >= cards.length - 3) {
      const seen = [...seenIds.current].join(',')
      fetch(`/api/feed/next?seen=${seen}`)
        .then(r => r.json())
        .then((newCards: Card[]) => {
          if (newCards.length > 0) {
            setCards(prev => [...prev, ...newCards])
          }
        })
    }
  }, [index, cards.length])

  function logInteraction(
    cardId: string,
    eventType: string,
    dwellMs: number
  ) {
    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId,
        eventType,
        dwellMs,
        positionInSession: cardCount,
        sessionId,
      }),
    })
  }

  const goNext = useCallback(() => {
    const card = cards[index]
    if (!card) return
    const dwell = Date.now() - viewStartRef.current
    logInteraction(card.id, 'swipe_up', dwell)
    setTotalDwell(t => t + dwell)
    setCardCount(c => c + 1)
    setIndex(i => i + 1)
  }, [index, cards, cardCount, sessionId])

  const goPrev = useCallback(() => {
    if (index === 0) return
    const card = cards[index]
    if (card) logInteraction(card.id, 'swipe_down', 0)
    setIndex(i => i - 1)
  }, [index, cards, sessionId])

  if (cards.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-[var(--color-muted)]">Geen kaarten beschikbaar.</p>
      </div>
    )
  }

  const visibleCards = cards.slice(
    Math.max(0, index - 1),
    Math.min(cards.length, index + VISIBLE_WINDOW)
  )

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--color-bg)]">
      <AnimatePresence initial={false} mode="sync">
        {visibleCards.map((card, i) => {
          const absoluteIndex = Math.max(0, index - 1) + i
          const isActive = absoluteIndex === index

          if (absoluteIndex < index - 1 || absoluteIndex > index + 2) return null

          return (
            <SwipeableCard
              key={card.id}
              card={card}
              isActive={isActive}
              stackOffset={absoluteIndex - index}
              onSwipeUp={goNext}
              onSwipeDown={goPrev}
            />
          )
        })}
      </AnimatePresence>

      <ProgressLine current={index} total={cards.length} />
    </div>
  )
}

interface SwipeableCardProps {
  card: Card
  isActive: boolean
  stackOffset: number
  onSwipeUp: () => void
  onSwipeDown: () => void
}

function SwipeableCard({ card, isActive, stackOffset, onSwipeUp, onSwipeDown }: SwipeableCardProps) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [-200, 0, 200], [0, 1, 0])

  if (!isActive) {
    return (
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${stackOffset * 8}px) scale(${1 - Math.abs(stackOffset) * 0.02})`,
          zIndex: 10 - Math.abs(stackOffset),
          pointerEvents: 'none',
          opacity: stackOffset === 1 ? 0.4 : 0,
        }}
      >
        <CardRenderer card={card} />
      </div>
    )
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ y, opacity, zIndex: 20 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80 || info.velocity.y < -400) {
          onSwipeUp()
        } else if (info.offset.y > 80 || info.velocity.y > 400) {
          onSwipeDown()
        }
      }}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-110%', opacity: 0 }}
      transition={{ ease: [0.32, 0.72, 0.24, 1], duration: 0.28 }}
    >
      <CardRenderer card={card} />
    </motion.div>
  )
}

function ProgressLine({ current, total }: { current: number; total: number }) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-border)]">
      <div
        className="h-full bg-[var(--color-accent)] transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  )
}
