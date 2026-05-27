import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await getSession()
  if (!authenticated) redirect('/login')
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <nav className="flex items-center gap-6 text-sm">
          <span className="font-medium text-[var(--color-accent)]">Admin</span>
          <a href="/admin/review" className="text-[var(--color-muted)] hover:text-[var(--color-text)]">Review</a>
          <a href="/feed" className="text-[var(--color-muted)] hover:text-[var(--color-text)]">← Feed</a>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">{children}</main>
    </div>
  )
}
