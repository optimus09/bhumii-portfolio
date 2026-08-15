import { useEffect, useRef, useState } from 'react'
import type { Profile } from '../types'
import { Reveal } from './Reveal'
import { useReveal } from '../hooks/useReveal'
import { openContactModal } from '../lib/contactModalBus'
import { MessageIcon } from './BrandIcons'

function StatCounter({ label, value }: { label: string; value: number }) {
  const ref = useReveal<HTMLDivElement>()
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let current = 0
          const stepTime = Math.max(Math.floor(900 / Math.max(value, 1)), 60)
          const timer = setInterval(() => {
            current += 1
            setCount(current)
            if (current >= value) clearInterval(timer)
          }, stepTime)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div ref={ref} className="reveal is-visible p-6 text-center border-r border-[color:var(--border)] last:border-r-0">
      <span className="block font-mono-ui text-3xl font-bold text-[color:var(--accent)]">{count}</span>
      <span className="block text-sm text-[color:var(--text-dim)] mt-1.5">{label}</span>
    </div>
  )
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="home" className="max-w-[1080px] mx-auto px-6 pt-24 pb-16">
      <div className="grid md:grid-cols-[1.3fr_0.9fr] gap-12 items-center">
        <Reveal>
          <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] flex items-center gap-2 mb-4">
            <span className="status-dot" /> Open to opportunities — {profile.location}
          </p>
          <h1 className="gradient-text text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.02]">
            {profile.name}
          </h1>
          {profile.role && (
            <h2 className="font-mono-ui text-lg font-semibold text-[color:var(--accent)] mt-3">
              {profile.role}
            </h2>
          )}
          {profile.tagline && (
            <p className="font-accent text-[color:var(--text-dim)] text-lg mt-1.5">{profile.tagline}</p>
          )}
          <p className="max-w-lg mt-6 text-[color:var(--text-dim)] text-lg">{profile.hero_thesis}</p>
          <div className="flex gap-4 mt-9 flex-wrap">
            <a href="#evidence" className="btn-primary font-semibold px-6 py-3.5 rounded-lg">
              View Evidence
            </a>
            <button onClick={openContactModal} className="btn-outline font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2.5">
              <MessageIcon className="w-5 h-5" />
              Get in Touch
            </button>
          </div>
        </Reveal>

        <Reveal className="flex justify-center">
          <div
            className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden border border-white/70"
            style={{
              boxShadow:
                'inset 0 1.5px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(26,58,82,0.08), 0 24px 48px -16px rgba(26,58,82,0.3), 0 0 60px rgba(212,175,55,0.2)',
            }}
          >
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={`Portrait of ${profile.name}`}
                className="w-full h-full object-cover contrast-[1.04] saturate-[0.9]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[color:var(--text-faint)] font-mono-ui text-sm">
                No photo set
              </div>
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 22%, rgba(255,255,255,0) 42%)' }}
            />
            <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-[color:var(--accent)] rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-[color:var(--accent)] rounded-br-2xl" />
          </div>
        </Reveal>
      </div>

      {profile.stats?.length > 0 && (
        <div className="mt-20 grid grid-cols-2 md:grid-cols-5 glass-card overflow-hidden">
          {profile.stats.map((s) => (
            <StatCounter key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}
    </section>
  )
}
