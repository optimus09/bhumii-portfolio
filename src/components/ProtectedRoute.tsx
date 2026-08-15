import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg)] text-[color:var(--text-dim)] font-mono-ui text-sm">
        Checking session…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
