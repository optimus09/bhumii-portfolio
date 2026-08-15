import type { ReactElement } from 'react'

export type IconKind = 'shield' | 'fileCheck' | 'search' | 'presentation' | 'book' | 'chart' | 'bell' | 'cpu'
export type Tint = 'blue' | 'purple' | 'green' | 'yellow' | 'gray'

const tintBg: Record<Tint, string> = {
  blue: 'bg-gradient-to-br from-[rgba(26,58,82,0.14)] to-[rgba(26,58,82,0.02)]',
  purple: 'bg-gradient-to-br from-[rgba(124,92,191,0.18)] to-[rgba(124,92,191,0.03)]',
  green: 'bg-gradient-to-br from-[rgba(74,124,89,0.18)] to-[rgba(74,124,89,0.02)]',
  yellow: 'bg-gradient-to-br from-[rgba(193,120,23,0.18)] to-[rgba(193,120,23,0.02)]',
  gray: 'bg-gradient-to-br from-[rgba(26,58,82,0.07)] to-transparent',
}

const tintText: Record<Tint, string> = {
  blue: 'text-[color:var(--navy)]',
  purple: 'text-[color:var(--accent-purple)]',
  green: 'text-[color:var(--accent-3)]',
  yellow: 'text-[color:var(--accent-yellow)]',
  gray: 'text-[color:var(--text-dim)]',
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const icons: Record<IconKind, ReactElement> = {
  shield: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  fileCheck: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  search: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M21 21l-5-5" />
      <path d="M8 10.5h5" />
    </svg>
  ),
  presentation: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v4M8 20h8" />
      <path d="M7 11l3-3 2.5 2.5L17 6" />
    </svg>
  ),
  book: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15.5A1.5 1.5 0 0118.5 20H6.5A2.5 2.5 0 014 17.5v-12z" />
      <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
    </svg>
  ),
  chart: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  ),
  bell: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <path d="M6 10a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  ),
  cpu: (
    <svg width="44" height="44" viewBox="0 0 24 24" {...strokeProps}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </svg>
  ),
}

interface CardBannerProps {
  imageUrl?: string | null
  icon: IconKind
  tint: Tint
  alt: string
}

export function CardBanner({ imageUrl, icon, tint, alt }: CardBannerProps) {
  if (imageUrl) {
    return (
      <div className="h-44 bg-white flex items-center justify-center border-b border-[color:var(--border)] overflow-hidden">
        <img src={imageUrl} alt={alt} className="max-h-full max-w-full object-contain p-5" />
      </div>
    )
  }

  return (
    <div className={`h-28 flex items-center justify-center border-b border-[color:var(--border)] ${tintBg[tint]}`}>
      <div className={tintText[tint]}>{icons[icon]}</div>
    </div>
  )
}
