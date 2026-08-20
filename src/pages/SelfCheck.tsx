import { useEffect, useState } from 'react'
import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { ContactModal } from '../components/ContactModal'
import { onOpenContactModal } from '../lib/contactModalBus'
import { supabase } from '../lib/supabaseClient'

interface Option {
  label: string
  value: 'strong' | 'mid' | 'weak'
}

interface Question {
  id: string
  prompt: string
  helper?: string
  options: Option[]
  scored: boolean
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    prompt: 'How would you describe your work?',
    options: [
      { label: 'I founded or co-founded a tech company', value: 'mid' },
      { label: 'I’m a technical specialist — engineering, data, AI/ML, security, product, design', value: 'mid' },
      { label: 'I’m on the commercial/business side of a tech company', value: 'mid' },
      { label: 'None of these quite fit', value: 'weak' },
    ],
    scored: false,
  },
  {
    id: 'specialism',
    prompt: 'Does your day-to-day work sit inside a recognised digital technology specialism?',
    helper: 'The Tech Nation route covers specific technical and business disciplines — things like AI/ML, engineering, cybersecurity, product, data, and senior commercial roles in high-growth tech businesses.',
    options: [
      { label: 'Yes, clearly', value: 'strong' },
      { label: 'Probably, but I’m not certain', value: 'mid' },
      { label: 'Not really', value: 'weak' },
    ],
    scored: false,
  },
  {
    id: 'experience',
    prompt: 'How many years have you worked at this level of expertise?',
    options: [
      { label: '5+ years', value: 'strong' },
      { label: 'Under 5 years', value: 'mid' },
    ],
    scored: false,
  },
  {
    id: 'recognition',
    prompt: 'Has your work been recognised publicly — through press coverage, conference talks, awards, or being asked to judge or advise?',
    options: [
      { label: 'Yes, more than once', value: 'strong' },
      { label: 'Yes, once', value: 'mid' },
      { label: 'Not yet', value: 'weak' },
    ],
    scored: true,
  },
  {
    id: 'trajectory',
    prompt: 'How would you describe your career trajectory?',
    options: [
      { label: 'Rapid — dramatic salary growth, equity, or fast promotion because of my impact', value: 'strong' },
      { label: 'Steady and solid, but not dramatic', value: 'mid' },
      { label: 'Early stage, hard to say yet', value: 'weak' },
    ],
    scored: true,
  },
  {
    id: 'innovation',
    prompt: 'Have you built or contributed to something genuinely new — not just an improvement, but something that didn’t really exist before you worked on it?',
    options: [
      { label: 'Yes, and I can prove it formally — a granted patent, or a live product with real users or revenue', value: 'strong' },
      { label: 'Yes, but my proof is informal — case studies, internal recognition, an application in progress', value: 'mid' },
      { label: 'Not really', value: 'weak' },
    ],
    scored: true,
  },
  {
    id: 'community',
    prompt: 'Outside your paid job, have you contributed to the wider tech community — mentoring, open source, speaking, organising, or advising?',
    options: [
      { label: 'Yes, consistently, and I can evidence it', value: 'strong' },
      { label: 'A little, informally', value: 'mid' },
      { label: 'Not really', value: 'weak' },
    ],
    scored: true,
  },
  {
    id: 'impact',
    prompt: 'Can you point to a specific outcome — a feature, product, metric, or decision — and say clearly, “that happened because of me”?',
    options: [
      { label: 'Yes, with concrete evidence', value: 'strong' },
      { label: 'Yes, but mostly anecdotal or via colleagues’ word', value: 'mid' },
      { label: 'Not really', value: 'weak' },
    ],
    scored: true,
  },
  {
    id: 'academic',
    prompt: 'Have you published research, presented at a peer-reviewed conference, or taken part in an academic or expert review process in the past few years?',
    options: [
      { label: 'Yes', value: 'strong' },
      { label: 'No', value: 'weak' },
    ],
    scored: true,
  },
]

type Answers = Record<string, Option['value']>

function scoreResult(answers: Answers) {
  const strongCount = QUESTIONS.filter((q) => q.scored && answers[q.id] === 'strong').length
  if (strongCount >= 3) {
    return {
      tier: 'Looks like a genuine starting point',
      body: 'Based on what you’ve selected, several of the areas the route rewards are already in place. The next job is turning that into evidence a caseworker can’t argue with — named, dated, and specific.',
    }
  }
  if (strongCount >= 1) {
    return {
      tier: 'Real building blocks, worth strengthening',
      body: 'You’ve got a foundation here. Usually the gap isn’t talent, it’s that the strongest work hasn’t been written down and evidenced yet. A few of these areas are worth deliberately building out before you apply.',
    }
  }
  return {
    tier: 'Early days for this specific route',
    body: 'That’s a useful thing to know now rather than later. This route asks for quite specific, formal evidence — recognition, documented impact, proof of innovation — not just general seniority. Worth revisiting once a couple of these areas are further along.',
  }
}

export function SelfCheck() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [contactOpen, setContactOpen] = useState(false)
  const [name, setName] = useState('Bhumii Shah')
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => onOpenContactModal(() => setContactOpen(true)), [])

  useEffect(() => {
    supabase
      .from('profile')
      .select('name, self_check_enabled')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.name) setName(data.name)
        setEnabled(Boolean(data?.self_check_enabled))
      })
  }, [])

  const total = QUESTIONS.length
  const done = step >= total
  const question = QUESTIONS[step]
  const progress = Math.round((Math.min(step, total) / total) * 100)

  function choose(value: Option['value']) {
    if (!question) return
    setAnswers((a) => ({ ...a, [question.id]: value }))
    setStep((s) => s + 1)
  }

  function restart() {
    setAnswers({})
    setStep(0)
  }

  const result = done ? scoreResult(answers) : null

  if (enabled === null) {
    return (
      <>
        <div className="grid-bg" aria-hidden="true" />
        <Nav />
        <main className="max-w-[720px] mx-auto px-6 py-20 min-h-[70vh]" />
        <Footer name={name} />
      </>
    )
  }

  if (enabled === false) {
    return (
      <>
        <div className="grid-bg" aria-hidden="true" />
        <Nav />
        <main className="max-w-[720px] mx-auto px-6 py-20 min-h-[70vh]">
          <div className="glass-card p-7 md:p-9 text-center">
            <h1 className="text-2xl font-bold mb-3">This page isn’t available right now</h1>
            <p className="text-[color:var(--text-dim)]">
              Head back to the <a href="/" className="text-[color:var(--accent)] font-semibold">homepage</a>.
            </p>
          </div>
        </main>
        <Footer name={name} />
      </>
    )
  }

  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <Nav />
      <main className="max-w-[720px] mx-auto px-6 py-20 min-h-[70vh]">
        <p className="font-mono-ui text-sm font-semibold tracking-widest uppercase text-[color:var(--accent)] mb-3">
          Self-check
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Tech route quick self-check
        </h1>
        <p className="text-[color:var(--text-dim)] text-[1.04rem] mb-10 max-w-xl">
          I built this while working through my own Global Talent Visa evidence, based on the
          publicly available Tech Nation criteria for the digital technology route. Sharing it in
          case it’s useful to anyone else navigating the same process. Takes about two minutes.
        </p>

        {!done && (
          <div className="glass-card p-7 md:p-9">
            <div className="w-full h-1.5 rounded-full bg-[color:var(--border)] overflow-hidden mb-8">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--gold)' }}
              />
            </div>

            <p className="font-mono-ui text-xs uppercase tracking-wider text-[color:var(--text-faint)] mb-2">
              Question {step + 1} of {total}
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-3">{question.prompt}</h2>
            {question.helper && (
              <p className="text-sm text-[color:var(--text-dim)] mb-6">{question.helper}</p>
            )}

            <div className="space-y-3 mt-6">
              {question.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => choose(opt.value)}
                  className="btn-outline w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-6 text-xs text-[color:var(--text-faint)] hover:text-[color:var(--accent)] transition-colors"
              >
                &larr; Back
              </button>
            )}
          </div>
        )}

        {done && result && (
          <div className="glass-card p-7 md:p-9">
            <p className="font-mono-ui text-xs uppercase tracking-wider text-[color:var(--accent)] mb-2">
              Where this points
            </p>
            <h2 className="text-2xl font-bold mb-4">{result.tier}</h2>
            <p className="text-[color:var(--text-dim)] text-[1.02rem] mb-8">{result.body}</p>

            <div className="flex flex-wrap gap-3">
              <a href="/#evidence" className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-lg">
                See how {name} evidenced hers
              </a>
              <button
                onClick={() => setContactOpen(true)}
                className="btn-outline text-sm font-semibold px-5 py-2.5 rounded-lg"
              >
                Get in touch
              </button>
              <button
                onClick={restart}
                className="text-sm text-[color:var(--text-faint)] hover:text-[color:var(--accent)] transition-colors px-2"
              >
                Start again
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-[color:var(--text-faint)] mt-8 max-w-xl">
          This is an informal self-assessment based on publicly available Global Talent Visa
          guidance. It isn’t immigration advice, doesn’t predict an endorsement outcome, and
          isn’t affiliated with Tech Nation or the Home Office.
        </p>
      </main>
      <Footer name={name} />
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
    </>
  )
}
