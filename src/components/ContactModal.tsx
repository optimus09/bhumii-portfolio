import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MessageIcon } from './BrandIcons'

interface ContactModalProps {
  onClose: () => void
}

const inputCls =
  'w-full bg-white/40 border border-white/60 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)] placeholder:text-[color:var(--text-faint)]'
const labelCls = 'block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5'

export function ContactModal({ onClose }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.from('contact_messages').insert({ name, email, reason, message })
    setBusy(false)
    if (error) setError('Something went wrong sending that — please try again, or email directly instead.')
    else setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: 'rgba(26, 58, 82, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto p-7"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold">Get in touch</h3>
          <button onClick={onClose} className="text-[color:var(--text-dim)] hover:text-[color:var(--gold)] text-xl leading-none px-1" aria-label="Close">
            ×
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold mb-2">Message sent — thank you.</p>
            <p className="text-sm text-[color:var(--text-dim)]">Bhumii will get back to you soon.</p>
            <button onClick={onClose} className="btn-primary text-sm font-semibold px-5 py-2 rounded-lg mt-6">
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[color:var(--text-dim)] mb-5">Tell Bhumii what's on your mind — she'll follow up by email.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Your name</label>
                <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Your email</label>
                <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Why are you getting in touch?</label>
                <input
                  required
                  className={inputCls}
                  placeholder="e.g. job opportunity, collaboration, a question"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Message</label>
                <textarea required rows={4} className={inputCls} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={busy} className="w-full btn-primary font-semibold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2.5">
                <MessageIcon className="w-4 h-4" />
                {busy ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
