import { useState } from 'react'
import { openContactModal } from '../lib/contactModalBus'
import { MessageIcon } from './BrandIcons'

const links = [
  { href: '#about', label: 'About' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#builds', label: 'Builds' },
  { href: '#contact', label: 'Contact' },
  { href: '/self-check', label: 'Self-Check' },
]

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="glass-bar sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-[1080px] mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-heading font-bold text-lg tracking-wide text-white">
          BS<span className="text-[color:var(--gold)]">.</span>
        </a>

        <nav className="hidden md:flex gap-8 text-sm text-white/75">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-[color:var(--gold)] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={openContactModal} className="hidden sm:flex items-center gap-2 btn-primary text-sm font-semibold px-4 py-2 rounded-lg">
            <MessageIcon className="w-4 h-4" />
            Get in Touch
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden text-white p-2 -mr-2"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden glass-bar border-t border-white/10 px-6 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/85 hover:text-[color:var(--gold)] transition-colors py-2.5 text-sm font-medium"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false)
              openContactModal()
            }}
            className="flex items-center justify-center gap-2 btn-primary text-sm font-semibold px-4 py-2.5 rounded-lg mt-2 sm:hidden"
          >
            <MessageIcon className="w-4 h-4" />
            Get in Touch
          </button>
        </div>
      )}
    </header>
  )
}
