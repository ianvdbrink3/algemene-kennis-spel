import type { Card } from '@/lib/db/schema'
import InsightCard from './InsightCard'
import StoryCard from './StoryCard'
import ContrastCard from './ContrastCard'
import QuoteCard from './QuoteCard'
import QuestionCard from './QuestionCard'
import SteelmanCard from './SteelmanCard'

interface Props {
  card: Card
}

export default function CardRenderer({ card }: Props) {
  switch (card.format) {
    case 'insight':   return <InsightCard card={card} />
    case 'story':     return <StoryCard card={card} />
    case 'contrast':  return <ContrastCard card={card} />
    case 'quote':     return <QuoteCard card={card} />
    case 'question':  return <QuestionCard card={card} />
    case 'steelman':  return <SteelmanCard card={card} />
    default:          return <InsightCard card={card} />
  }
}
