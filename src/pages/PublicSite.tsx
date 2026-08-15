import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'
import type { EvidenceItem, Profile, Project } from '../types'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { EvidenceSection } from '../components/EvidenceSection'
import { BuildsSection } from '../components/BuildsSection'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { ContactModal } from '../components/ContactModal'
import { onOpenContactModal } from '../lib/contactModalBus'
import { ChatWidget } from '../components/ChatWidget'

export function PublicSite() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [evidence, setEvidence] = useState<EvidenceItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => onOpenContactModal(() => setContactOpen(true)), [])

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    async function load() {
      const [profileRes, evidenceRes, projectsRes] = await Promise.all([
        supabase.from('profile').select('*').eq('id', 1).single(),
        supabase.from('evidence_items').select('*'),
        supabase.from('projects').select('*'),
      ])

      if (profileRes.error) setError(profileRes.error.message)
      else setProfile(profileRes.data as Profile)

      if (!evidenceRes.error) setEvidence(evidenceRes.data as EvidenceItem[])
      if (!projectsRes.error) setProjects(projectsRes.data as Project[])

      setLoading(false)
    }

    load()
  }, [])

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold mb-3">Not connected to Supabase yet</h1>
          <p className="text-[color:var(--text-dim)] text-sm">
            Add <code className="font-mono-ui">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono-ui">VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file
            at the project root, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--text-dim)] font-mono-ui text-sm">Loading…</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-bold mb-3">Couldn't load site content</h1>
          <p className="text-[color:var(--text-dim)] text-sm">{error || 'No profile row found. Run the schema.sql seed data in your Supabase project.'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <Nav />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <EvidenceSection items={evidence} />
        <BuildsSection projects={projects} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      <ChatWidget />
    </>
  )
}
