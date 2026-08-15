import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Project } from '../../types'

const inputCls = 'w-full bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)]'
const labelCls = 'block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5'

function blankProject(): Project {
  return {
    id: `new-${Date.now()}`,
    name: '',
    description: '',
    note: '',
    tags: [],
    live_demo_url: '',
    code_url: '',
    is_live: false,
    image_url: null,
    sort_order: 99,
  }
}

function ProjectRow({
  project,
  onSaved,
  onDeleted,
}: {
  project: Project
  onSaved: (p: Project) => void
  onDeleted: (id: string) => void
}) {
  const [draft, setDraft] = useState(project)
  const [tagsText, setTagsText] = useState(project.tags.join(', '))
  const [saving, setSaving] = useState(false)
  const isNew = project.id.startsWith('new-')

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...draft, tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean) }
    if (isNew) {
      const { id, ...rest } = payload
      const { data, error } = await supabase.from('projects').insert(rest).select().single()
      if (!error && data) onSaved(data as Project)
    } else {
      const { id, ...rest } = payload
      const { error } = await supabase.from('projects').update(rest).eq('id', id)
      if (!error) onSaved(payload)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (isNew) {
      onDeleted(project.id)
      return
    }
    if (!confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (!error) onDeleted(project.id)
  }

  return (
    <div className="glass-card p-6 mb-4 space-y-3">
      <div>
        <label className={labelCls}>Name</label>
        <input className={`${inputCls} font-mono-ui`} value={draft.name} onChange={(e) => update('name', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={3} value={draft.description} onChange={(e) => update('description', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Note (optional, italic)</label>
        <textarea className={inputCls} rows={2} value={draft.note || ''} onChange={(e) => update('note', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Tags (comma-separated)</label>
        <input className={inputCls} value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Live demo URL</label>
          <input className={inputCls} value={draft.live_demo_url || ''} onChange={(e) => update('live_demo_url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Code URL</label>
          <input className={inputCls} value={draft.code_url || ''} onChange={(e) => update('code_url', e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
        <input type="checkbox" checked={draft.is_live} onChange={(e) => update('is_live', e.target.checked)} />
        Show "Live" badge
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50">
          {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
        </button>
        <button onClick={handleDelete} className="text-sm text-red-400 font-semibold px-3">
          Delete
        </button>
      </div>
    </div>
  )
}

export function AdminProjects() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('projects').select('*').order('sort_order').then(({ data }) => {
      setItems((data as Project[]) || [])
      setLoading(false)
    })
  }, [])

  function handleSaved(saved: Project) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id)
      const withoutTemp = prev.filter((i) => !i.id.startsWith('new-') || i.id === saved.id)
      return exists ? withoutTemp.map((i) => (i.id === saved.id ? saved : i)) : [...withoutTemp, saved]
    })
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) return <p className="text-[color:var(--text-dim)] text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Projects</h1>
        <button
          onClick={() => setItems((prev) => [...prev, blankProject()])}
          className="btn-primary text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add project
        </button>
      </div>
      {items.length === 0 && <p className="text-[color:var(--text-dim)] text-sm">No projects yet.</p>}
      {items.map((p) => (
        <ProjectRow key={p.id} project={p} onSaved={handleSaved} onDeleted={handleDeleted} />
      ))}
    </div>
  )
}
