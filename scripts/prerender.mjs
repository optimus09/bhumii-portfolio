// Build-time prerender: fetch public content from Supabase and inject a static
// HTML snapshot into dist/index.html as a <noscript> fallback. This makes the
// site's real content available to agents/crawlers that do not execute
// JavaScript, without affecting the client-rendered React experience.
//
// Fails soft: if Supabase is unreachable at build time, the build still
// succeeds — the snapshot is simply skipped rather than breaking the site.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const indexPath = join(__dirname, '..', 'dist', 'index.html')

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function main() {
  if (!url || !anonKey) {
    console.warn('[prerender] Supabase env vars missing — skipping snapshot.')
    return
  }

  const supabase = createClient(url, anonKey)
  const [{ data: profile }, { data: evidence }, { data: projects }] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).single(),
    supabase.from('evidence_items').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
  ])

  if (!profile) {
    console.warn('[prerender] No profile returned — skipping snapshot.')
    return
  }

  const parts = []
  parts.push('<header>')
  parts.push(`<h1>${esc(profile.name)}</h1>`)
  if (profile.role) parts.push(`<p>${esc(profile.role)}${profile.location ? ' — ' + esc(profile.location) : ''}</p>`)
  parts.push('</header>')

  if (profile.hero_thesis) parts.push(`<p>${esc(profile.hero_thesis)}</p>`)

  parts.push('<h2>About</h2>')
  if (profile.about_paragraph_1) parts.push(`<p>${esc(profile.about_paragraph_1)}</p>`)
  if (profile.about_paragraph_2) parts.push(`<p>${esc(profile.about_paragraph_2)}</p>`)

  if (Array.isArray(profile.quick_facts) && profile.quick_facts.length) {
    parts.push('<h2>Quick facts</h2><ul>')
    for (const f of profile.quick_facts) parts.push(`<li>${esc(f.label)}: ${esc(f.value)}</li>`)
    parts.push('</ul>')
  }

  if (Array.isArray(evidence) && evidence.length) {
    parts.push('<h2>Evidence</h2><ul>')
    for (const e of evidence) {
      const meta = Array.isArray(e.meta_lines) ? e.meta_lines.join(' · ') : ''
      parts.push(`<li><strong>${esc(e.title)}</strong>${e.tag_label ? ' (' + esc(e.tag_label) + ')' : ''}${meta ? ' — ' + esc(meta) : ''}${e.note ? '. ' + esc(e.note) : ''}</li>`)
    }
    parts.push('</ul>')
  }

  if (Array.isArray(projects) && projects.length) {
    parts.push('<h2>Builds</h2><ul>')
    for (const p of projects) {
      const links = []
      if (p.live_demo_url) links.push(`<a href="${esc(p.live_demo_url)}">Live demo</a>`)
      if (p.code_url) links.push(`<a href="${esc(p.code_url)}">Code</a>`)
      parts.push(`<li><strong>${esc(p.name)}</strong> — ${esc(p.description)}${p.note ? ' (' + esc(p.note) + ')' : ''}${links.length ? '. ' + links.join(' · ') : ''}</li>`)
    }
    parts.push('</ul>')
  }

  parts.push('<h2>Contact</h2><ul>')
  if (profile.email) parts.push(`<li>Email: <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>`)
  if (profile.github_url) parts.push(`<li><a href="${esc(profile.github_url)}">GitHub</a></li>`)
  if (profile.linkedin_url) parts.push(`<li><a href="${esc(profile.linkedin_url)}">LinkedIn</a></li>`)
  if (profile.medium_url) parts.push(`<li><a href="${esc(profile.medium_url)}">Medium</a></li>`)
  parts.push('</ul>')

  const snapshot = `<noscript>\n<div id="static-content">\n${parts.join('\n')}\n</div>\n</noscript>`

  let html = readFileSync(indexPath, 'utf8')
  if (html.includes('<noscript>')) {
    console.warn('[prerender] <noscript> already present — skipping.')
    return
  }
  html = html.replace('</body>', `${snapshot}\n</body>`)
  writeFileSync(indexPath, html)
  console.log('[prerender] Injected static content snapshot into dist/index.html')
}

main().catch((err) => {
  // Never fail the build over the snapshot.
  console.warn('[prerender] Skipped due to error:', err?.message ?? err)
})
