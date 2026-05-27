import { execSync } from 'child_process'

// Neon's Vercel integration injects DATABASE_URL_UNPOOLED (direct connection).
// Support both that name and DATABASE_URL_DIRECT for manual setups.
const directUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL_DIRECT ??
  process.env.POSTGRES_URL_NON_POOLING

if (directUrl) {
  console.log('Running database migrations...')
  process.env.DATABASE_URL_DIRECT = directUrl
  execSync('pnpm drizzle-kit migrate', { stdio: 'inherit' })
  console.log('Migrations complete.')
} else {
  console.log('No direct DB URL found, skipping migrations.')
}
