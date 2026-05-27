import { execSync } from 'child_process'

if (process.env.DATABASE_URL_DIRECT) {
  console.log('Running database migrations...')
  execSync('pnpm drizzle-kit migrate', { stdio: 'inherit' })
  console.log('Migrations complete.')
} else {
  console.log('DATABASE_URL_DIRECT not set, skipping migrations.')
}
