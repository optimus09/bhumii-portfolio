import type { Project } from '../types'
import { Reveal } from './Reveal'
import { CardBanner, type IconKind, type Tint } from './CardBanner'

function projectVisual(name: string): { icon: IconKind; tint: Tint } {
  const n = name.toLowerCase()
  if (n.includes('dashboard')) return { icon: 'chart', tint: 'blue' }
  if (n.includes('alzheimer')) return { icon: 'shield', tint: 'purple' }
  if (n.includes('alert') || n.includes('care')) return { icon: 'bell', tint: 'yellow' }
  return { icon: 'cpu', tint: 'green' }
}

function ProjectCard({ project }: { project: Project }) {
  const { icon, tint } = projectVisual(project.name)
  return (
    <div className="glass-card">
      <CardBanner imageUrl={project.image_url} icon={icon} tint={tint} alt={project.name} />
      <div className="p-7">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-mono-ui text-lg font-bold">{project.name}</h4>
        {project.is_live && (
          <span className="flex items-center gap-1.5 font-mono-ui text-[0.68rem] font-bold uppercase text-[color:var(--accent-3)]">
            <span className="status-dot" /> Live
          </span>
        )}
      </div>
      <p className="text-[color:var(--text-dim)] text-sm mb-1">{project.description}</p>
      {project.note && (
        <p className="font-accent text-[color:var(--text-faint)] mt-3 pt-3 border-t border-dashed border-[color:var(--border)]">
          {project.note}
        </p>
      )}
      {project.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-4">
          {project.tags.map((t) => (
            <span key={t} className="pill-glass font-mono-ui text-xs bg-[color:var(--border)] text-[color:var(--text-dim)] px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-5 mt-4">
        {project.live_demo_url && (
          <a href={project.live_demo_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[color:var(--accent)] hover:underline">
            Live demo →
          </a>
        )}
        {project.code_url && (
          <a href={project.code_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[color:var(--accent)] hover:underline">
            Code →
          </a>
        )}
      </div>
      </div>
    </div>
  )
}

export function BuildsSection({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section id="builds" className="max-w-[1080px] mx-auto px-6 py-16">
      <Reveal>
        <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] mb-3">
          Builds
        </p>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Technical projects</h3>
        <p className="text-[color:var(--text-dim)] max-w-xl mb-10">
          Live, documented, and open — grounded in the same review instincts as the peer review work.
        </p>
      </Reveal>

      <Reveal>
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {sorted.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="glass-card flex gap-5 items-start bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-transparent border-[color:var(--border-hover)]/50 p-7">
          <span className="text-xl text-[color:var(--gold)] leading-none mt-0.5">◆</span>
          <div>
            <h4 className="text-lg font-bold mb-2">Two times I distrusted a good result</h4>
            <p className="font-accent text-[color:var(--text-dim)] text-[1.05rem]">
              The dashboard's first model reported 100% accuracy — it turned out two of the input
              features were calculated directly from the answer. The Alzheimer's classifier's first
              version looked strong because a synthetic data generator was writing the class label
              into the features it produced. Both times, the fix was the same: throw out the result,
              rebuild on honest data, and accept a lower but real number. The synthetic branch stays
              in the repo so the correction is visible, not deleted.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
