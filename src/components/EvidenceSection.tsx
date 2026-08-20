import { lazy, Suspense, useState } from 'react'
import type { EvidenceCategory, EvidenceItem } from '../types'
import { Reveal } from './Reveal'
import { CardBanner, type IconKind, type Tint } from './CardBanner'

const PdfViewerModal = lazy(() =>
  import('./PdfViewerModal').then((m) => ({ default: m.PdfViewerModal })),
)

const tagColorClass: Record<string, string> = {
  blue: 'bg-[rgba(26,58,82,0.1)] text-[color:var(--navy)]',
  purple: 'bg-[rgba(124,92,191,0.14)] text-[color:var(--accent-purple)]',
  green: 'bg-[rgba(74,124,89,0.14)] text-[color:var(--accent-3)]',
  yellow: 'bg-[rgba(193,120,23,0.16)] text-[color:var(--accent-yellow)]',
  gray: 'bg-[color:var(--border)] text-[color:var(--text-dim)]',
}

const tagIcon: Record<string, IconKind> = {
  blue: 'shield',
  purple: 'fileCheck',
  green: 'search',
  yellow: 'presentation',
  gray: 'book',
}

const groupMeta: Record<Exclude<EvidenceCategory, 'other'>, { title: string; sub: string }> = {
  ip: {
    title: 'Intellectual property',
    sub: 'Two designs registered with the UK Intellectual Property Office, and one published patent application in India.',
  },
  peer_review: {
    title: 'Peer review & editorial service',
    sub: "Reviewing other people's work is where rigour actually gets tested.",
  },
  conference: {
    title: 'Conference presentations',
    sub: '8th Parul University International Conference on Engineering & Technology (PiCET 2026). Publication partner: IET Conference Proceedings, Scopus-indexed — proceedings pending.',
  },
}

function EvidenceCard({ item, onView }: { item: EvidenceItem; onView: (item: EvidenceItem) => void }) {
  return (
    <div className="glass-card">
      <CardBanner imageUrl={item.image_url} icon={tagIcon[item.tag_color]} tint={item.tag_color as Tint} alt={item.title} />
      <div className="p-7">
        <span className={`pill-glass inline-block font-mono-ui text-[0.68rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4 ${tagColorClass[item.tag_color]}`}>
          {item.tag_label}
        </span>
        <h4 className="text-[1.05rem] font-bold leading-snug mb-3">{item.title}</h4>
        {item.meta_lines.map((line, i) => (
          <p key={i} className="text-sm text-[color:var(--text-dim)] mb-1">{line}</p>
        ))}
        {item.note && (
          <p className="font-accent text-[color:var(--text-faint)] mt-3 pt-3 border-t border-dashed border-[color:var(--border)]">
            {item.note}
          </p>
        )}
        {item.pdf_url && (
          <button
            onClick={() => onView(item)}
            className="inline-block mt-4 text-sm font-semibold text-[color:var(--accent)] hover:underline"
          >
            View certificate →
          </button>
        )}
        {!item.pdf_url && item.external_url && (
          <a
            href={item.external_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-sm font-semibold text-[color:var(--accent)] hover:underline"
          >
            View paper →
          </a>
        )}
      </div>
    </div>
  )
}

function OtherPublicationsRow({ item }: { item: EvidenceItem }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 border-b border-[color:var(--border)] last:border-b-0">
      <div className="flex items-center gap-3">
        {item.image_url && (
          <img src={item.image_url} alt="" loading="lazy" decoding="async" className="w-9 h-9 rounded-md object-cover border border-[color:var(--border)] shrink-0 bg-white" />
        )}
        <div>
          <span className="font-medium">{item.title}</span>
          {item.meta_lines[0] && (
            <span className="text-[color:var(--text-faint)] text-sm"> — {item.meta_lines[0]}</span>
          )}
        </div>
      </div>
      {item.external_url && (
        <a
          href={item.external_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[color:var(--text-dim)] hover:text-[color:var(--accent)] shrink-0"
        >
          View →
        </a>
      )}
    </div>
  )
}

export function EvidenceSection({ items }: { items: EvidenceItem[] }) {
  const [viewing, setViewing] = useState<EvidenceItem | null>(null)
  const [showMore, setShowMore] = useState(false)
  const categories: Exclude<EvidenceCategory, 'other'>[] = ['ip', 'peer_review', 'conference']
  const otherItems = items.filter((i) => i.category === 'other').sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section id="evidence" className="max-w-[1080px] mx-auto px-6 py-16">
      <Reveal>
        <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] mb-3">
          Evidence
        </p>
      </Reveal>

      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat).sort((a, b) => a.sort_order - b.sort_order)
        if (catItems.length === 0) return null
        return (
          <div key={cat} className="mb-4">
            <Reveal>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mt-16 mb-2">{groupMeta[cat].title}</h3>
              <p className="text-[color:var(--text-dim)] max-w-xl mb-8">{groupMeta[cat].sub}</p>
            </Reveal>
            <Reveal className="grid gap-5" >
              <div className="grid sm:grid-cols-2 gap-5">
                {catItems.map((item) => (
                  <EvidenceCard key={item.id} item={item} onView={setViewing} />
                ))}
              </div>
            </Reveal>
          </div>
        )
      })}

      {otherItems.length > 0 && (
        <div className="mt-16">
          <button
            onClick={() => setShowMore((s) => !s)}
            className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dim)] hover:text-[color:var(--accent)] transition-colors"
          >
            <span className={`inline-block transition-transform ${showMore ? 'rotate-90' : ''}`}>›</span>
            {showMore ? 'Hide other publications' : `See more (${otherItems.length} other publication${otherItems.length > 1 ? 's' : ''})`}
          </button>

          {showMore && (
            <div className="mt-6">
              <p className="text-xs text-[color:var(--text-faint)] mb-3">
                Additional published work, not included above.
              </p>
              <div className="glass-card px-6 py-2">
                {otherItems.map((item) => (
                  <OtherPublicationsRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewing && viewing.pdf_url && (
        <Suspense fallback={null}>
          <PdfViewerModal url={viewing.pdf_url} title={viewing.title} onClose={() => setViewing(null)} />
        </Suspense>
      )}
    </section>
  )
}
