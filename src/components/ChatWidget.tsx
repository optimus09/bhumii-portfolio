import { useEffect, useRef, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Message {
  role: 'user' | 'model'
  text: string
}

function ChatIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  )
}

const SUGGESTIONS = [
  'What patents or designs does Bhumii hold?',
  "What's Bhumii's peer review experience?",
  'Tell me about her technical projects',
]

const AVATAR_SRC = '/images/assistant-avatar.webp'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [avatarOk, setAvatarOk] = useState(true)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  async function sendMessage(text: string) {
    if (!text.trim() || busy) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)

    const { data, error } = await supabase.functions.invoke('ask-assistant', {
      body: { message: userMsg.text, history: messages },
    })

    setBusy(false)

    if (error || data?.error) {
      setMessages((m) => [...m, { role: 'model', text: "Sorry, I'm having trouble answering right now. Try the contact form instead." }])
      return
    }

    setMessages((m) => [...m, { role: 'model', text: data.reply }])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {!open && avatarOk && (
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
          style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', left: 'auto', top: 'auto', zIndex: 150 }}
          aria-label="Ask me"
        >
          <img
            src={AVATAR_SRC}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-32 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform"
            onError={() => setAvatarOk(false)}
          />
          <span className="glass-card px-3 py-1 text-sm font-semibold text-[color:var(--text)] shadow-lg -mt-2">
            Ask me
          </span>
        </button>
      )}

      {(open || !avatarOk) && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', left: 'auto', top: 'auto', zIndex: 150 }}
          aria-label={open ? 'Close chat' : 'Ask me'}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <ChatIcon className="w-6 h-6" />
          )}
        </button>
      )}

      {open && (
        <div
          className="glass-card w-[calc(100vw-3rem)] max-w-sm h-[70vh] max-h-[520px] flex flex-col overflow-hidden"
          style={{ position: 'fixed', bottom: '6rem', right: '1.5rem', left: 'auto', top: 'auto', zIndex: 150 }}
        >
          <div className="glass-bar px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
            {avatarOk ? (
              <img
                src={AVATAR_SRC}
                alt=""
                className="w-8 h-8 rounded-full object-cover object-top border border-white/20"
                onError={() => setAvatarOk(false)}
              />
            ) : (
              <ChatIcon className="w-5 h-5 text-[color:var(--gold)]" />
            )}
            <div>
              <p className="text-sm font-bold text-white">Aura</p>
              <p className="text-[0.7rem] text-white/60">Bhumii's AI assistant — answers grounded in her actual evidence</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div>
                <p className="text-sm text-[color:var(--text-dim)] mb-3">
                  Hey, I'm Aura — Bhumii's personal assistant. Ask me anything about her.
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="block w-full text-left text-xs pill-glass bg-[color:var(--border)] text-[color:var(--text-dim)] px-3 py-2 rounded-lg hover:text-[color:var(--accent)] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-[color:var(--gold)] text-[color:var(--navy)] font-medium'
                      : 'bg-white/60 text-[color:var(--text)]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white/60 rounded-2xl px-3.5 py-2.5 text-sm text-[color:var(--text-faint)]">…</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-[color:var(--border)] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 bg-white/40 border border-white/60 rounded-lg px-3 py-2 text-sm outline-none focus:border-[color:var(--border-hover)] placeholder:text-[color:var(--text-faint)]"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}
