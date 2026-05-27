'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/feed')
    } else {
      setError(true)
      setLoading(false)
      setPassword('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1
          className="mb-10 text-4xl text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Lumen
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Wachtwoord"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
          />

          {error && (
            <p className="text-sm text-[var(--color-accent-warm)]">
              Verkeerd wachtwoord.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-3 font-medium text-[var(--color-bg)] transition-opacity disabled:opacity-40"
          >
            {loading ? 'Even geduld…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
