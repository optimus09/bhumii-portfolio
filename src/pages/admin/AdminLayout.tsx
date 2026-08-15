import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-[color:var(--gold)]/20 text-[color:var(--gold)]' : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .then(({ count }) => setUnread(count || 0))
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] flex">
      <aside className="glass-bar w-56 shrink-0 p-5 flex flex-col border-r border-white/10">
        <a href="/" className="font-heading font-bold text-lg mb-8 text-white">
          BS<span className="text-[color:var(--gold)]">.</span> <span className="text-xs text-white/50 font-normal font-body">admin</span>
        </a>
        <nav className="space-y-1 flex-1">
          <NavLink to="/admin" end className={linkClass}>Profile</NavLink>
          <NavLink to="/admin/evidence" className={linkClass}>Evidence</NavLink>
          <NavLink to="/admin/projects" className={linkClass}>Projects</NavLink>
          <NavLink to="/admin/messages" className={linkClass}>
            <span>Messages</span>
            {unread > 0 && (
              <span className="text-[0.68rem] font-bold bg-[color:var(--gold)] text-[color:var(--navy)] px-1.5 py-0.5 rounded-full leading-none">
                {unread}
              </span>
            )}
          </NavLink>
        </nav>
        <div className="space-y-1">
          <a href="/" className="block px-4 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white">
            View site ↗
          </a>
          <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-400/10">
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 p-8 max-w-4xl">
        <Outlet />
      </div>
    </div>
  )
}
