import type { Profile } from '../types'
import { Reveal } from './Reveal'
import { openContactModal } from '../lib/contactModalBus'
import { GitHubIcon, LinkedInIcon, MediumIcon, GmailIcon, MessageIcon } from './BrandIcons'

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className="max-w-[1080px] mx-auto px-6 py-28 text-center">
      <Reveal>
        <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] mb-3">
          Contact
        </p>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Let's talk</h3>
        <p className="text-[color:var(--text-dim)] text-lg max-w-lg mx-auto mb-9">
          Open to conversations about AI data quality, multilingual speech data, and trustworthy
          systems in healthcare and biomedical applications.
        </p>
        <div className="flex justify-center mb-6">
          <button onClick={openContactModal} className="btn-primary font-semibold px-7 py-3.5 rounded-lg flex items-center gap-2.5">
            <MessageIcon className="w-5 h-5" />
            Send a message
          </button>
        </div>
        <p className="text-xs text-[color:var(--text-faint)] mb-4">or reach out directly</p>
        <div className="flex justify-center gap-3.5 flex-wrap">
          <a href={`mailto:${profile.email}`} className="btn-outline font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2.5">
            <GmailIcon className="w-5 h-5" />
            Email
          </a>
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noreferrer" className="btn-outline font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2.5">
              <GitHubIcon className="w-5 h-5" />
              GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="btn-outline font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2.5">
              <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />
              LinkedIn
            </a>
          )}
          {profile.medium_url && (
            <a href={profile.medium_url} target="_blank" rel="noreferrer" className="btn-outline font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2.5">
              <MediumIcon className="w-5 h-5" />
              Medium
            </a>
          )}
        </div>
      </Reveal>
    </section>
  )
}
