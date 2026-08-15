export type EvidenceCategory = 'ip' | 'peer_review' | 'conference' | 'other'

export interface Profile {
  id: number
  name: string
  role: string
  tagline: string | null
  location: string
  email: string
  github_url: string
  linkedin_url: string
  medium_url: string
  hero_thesis: string
  about_paragraph_1: string
  about_paragraph_2: string
  quick_facts: { label: string; value: string }[]
  stats: { label: string; value: number }[]
  photo_url: string | null
}

export interface EvidenceItem {
  id: string
  category: EvidenceCategory
  tag_label: string
  tag_color: 'blue' | 'purple' | 'green' | 'yellow'
  title: string
  meta_lines: string[]
  note: string | null
  pdf_url: string | null
  external_url: string | null
  image_url: string | null
  sort_order: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  reason: string
  message: string
  is_read: boolean
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  note: string | null
  tags: string[]
  live_demo_url: string | null
  code_url: string | null
  is_live: boolean
  image_url: string | null
  sort_order: number
}
