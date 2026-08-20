import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

const RATE_LIMIT = 8
const RATE_WINDOW_MS = 5 * 60 * 1000
const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  timestamps.push(now)
  requestLog.set(ip, timestamps)
  if (requestLog.size > 5000) requestLog.clear()
  return timestamps.length > RATE_LIMIT
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait a few minutes and try again.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { message, history } = (await req.json()) as { message: string; history?: ChatMessage[] }

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Assistant is not configured yet.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const [{ data: profile }, { data: evidence }, { data: projects }] = await Promise.all([
      supabase.from('profile').select('*').eq('id', 1).single(),
      supabase.from('evidence_items').select('*').order('sort_order'),
      supabase.from('projects').select('*').order('sort_order'),
    ])

    const context = buildContext(profile, evidence ?? [], projects ?? [])

    const rules = [
      "Your name is Aura, Bhumii Shah's personal AI assistant, embedded on her portfolio website.",
      'If asked your name, say you are Aura.',
      'You answer visitor questions ONLY using the facts provided below about Bhumii.',
      'This site supports a real UK Global Talent Visa application, so accuracy matters:',
      'never invent, exaggerate, or imply anything beyond what is stated here.',
      'Never call a registered design a patent. Never call the Indian patent application granted (it is a published application, not examined or granted).',
      'Never say a conference paper was published - say it was presented, proceedings are pending.',
      'If asked something not covered by these facts, say you do not have that information and suggest the visitor use the Send a message contact form instead.',
      'Keep answers concise, 2 to 4 sentences unless more detail is clearly needed. Speak about Bhumii in the third person. Be warm but professional.',
    ].join(' ')

    const systemInstruction = rules + '\n\nFACTS ABOUT BHUMII:\n' + context

    const contents = [
      ...(history ?? []).slice(-10).map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' + geminiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.4,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error', geminiRes.status, errText)
      return new Response(JSON.stringify({ error: 'The assistant had trouble answering that. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiData = await geminiRes.json()
    const reply =
      geminiData.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ??
      'Sorry, I could not come up with an answer to that.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildContext(profile: any, evidence: any[], projects: any[]): string {
  const lines: string[] = []

  if (profile) {
    lines.push('Name: ' + profile.name)
    if (profile.role) lines.push('Headline: ' + profile.role)
    if (profile.tagline) lines.push('Tagline: ' + profile.tagline)
    lines.push('Location: ' + profile.location)
    lines.push('Thesis: ' + profile.hero_thesis)
    lines.push('About: ' + profile.about_paragraph_1 + ' ' + profile.about_paragraph_2)
    if (Array.isArray(profile.quick_facts)) {
      lines.push('Quick facts:')
      for (const f of profile.quick_facts) lines.push('- ' + f.label + ': ' + f.value)
    }
    lines.push('Contact: ' + profile.email + ', GitHub ' + profile.github_url + ', LinkedIn ' + profile.linkedin_url + ', Medium ' + profile.medium_url)
  }

  if (evidence.length) {
    lines.push('Evidence items:')
    for (const e of evidence) {
      lines.push('- [' + e.category + '] ' + e.title + ' - ' + (e.meta_lines ?? []).join(' | ') + (e.note ? ' (Note: ' + e.note + ')' : ''))
    }
  }

  if (projects.length) {
    lines.push('Projects:')
    for (const p of projects) {
      lines.push('- ' + p.name + ': ' + p.description + (p.note ? ' (Note: ' + p.note + ')' : '') + ' [tags: ' + (p.tags ?? []).join(', ') + ']')
    }
  }

  return lines.join('\n')
}
