import type { Profile } from '../types'
import { Reveal } from './Reveal'

export function About({ profile }: { profile: Profile }) {
  return (
    <section id="about" className="max-w-[1080px] mx-auto px-6 py-28">
      <Reveal>
        <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] mb-3">
          About
        </p>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mb-10">
          Systems built to notice the individual, not the average.
        </h3>
      </Reveal>

      <div className="grid md:grid-cols-[1.3fr_1fr] gap-10">
        <Reveal>
          <p className="text-[color:var(--text-dim)] text-[1.04rem] mb-4">{profile.about_paragraph_1}</p>
          <p className="text-[color:var(--text-dim)] text-[1.04rem]">{profile.about_paragraph_2}</p>
        </Reveal>

        <Reveal className="glass-card p-7">
          <ul className="space-y-5">
            {profile.quick_facts?.map((f, i) => (
              <li key={i}>
                <span className="block font-mono-ui text-[0.7rem] uppercase tracking-wider text-[color:var(--accent)] mb-1">
                  {f.label}
                </span>
                <span className="text-sm leading-relaxed">{f.value}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
