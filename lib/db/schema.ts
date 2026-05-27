import { pgTable, uuid, text, timestamp, integer, smallint, real, jsonb, bigserial } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
})

export const concepts = pgTable('concepts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  canonicalDef: text('canonical_def').notNull(),
  domainId: uuid('domain_id').references(() => domains.id),
  topics: text('topics').array().notNull().default(sql`'{}'::text[]`),
  difficulty: smallint('difficulty').notNull().default(1),
  sources: jsonb('sources').default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  conceptId: uuid('concept_id').references(() => concepts.id),
  format: text('format').notNull(), // insight | story | contrast | quote | question | steelman
  hook: text('hook').notNull(),
  body: text('body').notNull(),
  keyInsight: text('key_insight').notNull(),
  difficulty: smallint('difficulty').notNull().default(1),
  qualityScore: real('quality_score'),
  sources: jsonb('sources').default(sql`'[]'::jsonb`),
  status: text('status').notNull().default('draft'), // draft | review | live | rejected
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  cardCount: integer('card_count').notNull().default(0),
  totalDwellMs: integer('total_dwell_ms').notNull().default(0),
})

export const interactions = pgTable('interactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  cardId: uuid('card_id').references(() => cards.id),
  eventType: text('event_type').notNull(), // view | swipe_up | swipe_down | save | depth_tap
  dwellMs: integer('dwell_ms'),
  positionInSession: integer('position_in_session'),
  sessionId: uuid('session_id').references(() => sessions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const savedCards = pgTable('saved_cards', {
  cardId: uuid('card_id').primaryKey().references(() => cards.id),
  savedAt: timestamp('saved_at').notNull().defaultNow(),
})
