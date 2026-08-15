import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseConfigured } from '../../lib/supabaseClient'

export function AdminLogin() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setError(error)
    else navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)] px-6">
      <div className="w-full max-w-sm glass-card p-8">
        <h1 className="font-heading text-lg font-bold mb-1">Admin login</h1>
        <p className="text-sm text-[color:var(--text-dim)] mb-6">Sign in to edit the site.</p>

        {!supabaseConfigured && (
          <p className="text-xs text-yellow-400 mb-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
            Supabase isn't connected yet — add your project URL and anon key to .env first.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)]"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || !supabaseConfigured}
            className="w-full btn-primary font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="block text-center text-xs text-[color:var(--text-faint)] mt-6 hover:text-[color:var(--text-dim)]">
          ← Back to site
        </a>
      </div>
    </div>
  )
}
