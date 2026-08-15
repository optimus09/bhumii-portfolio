import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { ContactMessage } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MessageRow({ msg, onChange }: { msg: ContactMessage; onChange: () => void }) {
  const [busy, setBusy] = useState(false)

  async function toggleRead() {
    setBusy(true)
    await supabase.from('contact_messages').update({ is_read: !msg.is_read }).eq('id', msg.id)
    setBusy(false)
    onChange()
  }

  async function handleDelete() {
    if (!confirm('Delete this message?')) return
    setBusy(true)
    await supabase.from('contact_messages').delete().eq('id', msg.id)
    setBusy(false)
    onChange()
  }

  return (
    <div className={`glass-card p-6 mb-4 ${!msg.is_read ? 'border-[color:var(--border-hover)]' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            {!msg.is_read && <span className="w-2 h-2 rounded-full bg-[color:var(--gold)]" />}
            <h4 className="font-bold">{msg.name}</h4>
            <span className="text-xs text-[color:var(--text-faint)]">· {formatDate(msg.created_at)}</span>
          </div>
          <a href={`mailto:${msg.email}`} className="text-sm text-[color:var(--accent)] hover:underline">
            {msg.email}
          </a>
        </div>
      </div>
      <p className="text-xs font-mono-ui uppercase tracking-wide text-[color:var(--text-faint)] mb-1">Reason</p>
      <p className="text-sm mb-3">{msg.reason}</p>
      <p className="text-xs font-mono-ui uppercase tracking-wide text-[color:var(--text-faint)] mb-1">Message</p>
      <p className="text-sm text-[color:var(--text-dim)] whitespace-pre-wrap mb-4">{msg.message}</p>
      <div className="flex gap-3">
        <button onClick={toggleRead} disabled={busy} className="btn-outline text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
          Mark as {msg.is_read ? 'unread' : 'read'}
        </button>
        <button onClick={handleDelete} disabled={busy} className="text-xs text-red-500 font-semibold px-2">
          Delete
        </button>
      </div>
    </div>
  )
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages((data as ContactMessage[]) || [])
        setLoading(false)
      })
  }

  useEffect(load, [])

  if (loading) return <p className="text-[color:var(--text-dim)] text-sm">Loading…</p>

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold">Messages</h1>
        {unreadCount > 0 && (
          <span className="text-xs font-mono-ui font-bold bg-[color:var(--gold)]/20 text-[color:var(--gold)] px-2.5 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>
      {messages.length === 0 && <p className="text-[color:var(--text-dim)] text-sm">No messages yet.</p>}
      {messages.map((m) => (
        <MessageRow key={m.id} msg={m} onChange={load} />
      ))}
    </div>
  )
}
