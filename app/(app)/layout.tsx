import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await getSession()
  if (!authenticated) redirect('/login')
  return <>{children}</>
}
