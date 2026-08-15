import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { EvidenceItem } from '../../types'

const inputCls = 'w-full bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)]'
const labelCls = 'block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5'

function blankItem(): EvidenceItem {
  return {
    id: `new-${Date.now()}`,
    category: 'ip',
    tag_label: '',
    tag_color: 'blue',
    title: '',
    meta_lines: [],
    note: '',
    pdf_url: null,
    external_url: null,
    image_url: null,
    sort_order: 99,
  }
}

function EvidenceRow({
  item,
  onSaved,
  onDeleted,
}: {
  item: EvidenceItem
  onSaved: (item: EvidenceItem) => void
  onDeleted: (id: string) => void
}) {
  const [draft, setDraft] = useState(item)
  const [metaText, setMetaText] = useState(item.meta_lines.join('\n'))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const isNew = item.id.startsWith('new-')

  function update<K extends keyof EvidenceItem>(key: K, value: EvidenceItem[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const path = `evidence-${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { error } = await supabase.storage.from('evidence-pdfs').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('evidence-pdfs').getPublicUrl(path)
      update('pdf_url', data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...draft, meta_lines: metaText.split('\n').map((l) => l.trim()).filter(Boolean) }
    if (isNew) {
      const { id, ...rest } = payload
      const { data, error } = await supabase.from('evidence_items').insert(rest).select().single()
      if (!error && data) onSaved(data as EvidenceItem)
    } else {
      const { id, ...rest } = payload
      const { error } = await supabase.from('evidence_items').update(rest).eq('id', id)
      if (!error) onSaved(payload)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (isNew) {
      onDeleted(item.id)
      return
    }
    if (!confirm('Delete this evidence item?')) return
    const { error } = await supabase.from('evidence_items').delete().eq('id', item.id)
    if (!error) onDeleted(item.id)
  }

  return (
    <div className="glass-card p-6 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={draft.category} onChange={(e) => update('category', e.target.value as EvidenceItem['category'])}>
            <option value="ip">Intellectual Property</option>
            <option value="peer_review">Peer Review</option>
            <option value="conference">Conference</option>
            <option value="other">Other Publications (tucked under "See more")</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Tag color</label>
          <select className={inputCls} value={draft.tag_color} onChange={(e) => update('tag_color', e.target.value as EvidenceItem['tag_color'])}>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="gray">Gray</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Tag label</label>
        <input className={inputCls} value={draft.tag_label} onChange={(e) => update('tag_label', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Title</label>
        <input className={inputCls} value={draft.title} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Meta lines (one per line)</label>
        <textarea className={inputCls} rows={3} value={metaText} onChange={(e) => setMetaText(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Note (optional, italic)</label>
        <textarea className={inputCls} rows={2} value={draft.note || ''} onChange={(e) => update('note', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Certificate PDF (opens in the no-download viewer)</label>
        <div className="flex items-center gap-3">
          {draft.pdf_url && <span className="text-xs text-[color:var(--accent-3)]">File attached</span>}
          <label className="btn-outline text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            {uploading ? 'Uploading…' : draft.pdf_url ? 'Replace PDF' : 'Upload PDF'}
            <input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
          {draft.pdf_url && (
            <button type="button" onClick={() => update('pdf_url', null)} className="text-xs text-red-400">
              Remove
            </button>
          )}
        </div>
      </div>
      <div>
        <label className={labelCls}>External link (used only if no PDF is attached — opens in a new tab, e.g. a published paper hosted elsewhere)</label>
        <input className={inputCls} value={draft.external_url || ''} onChange={(e) => update('external_url', e.target.value)} placeholder="https://..." />
      </div>
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

export function AdminEvidence() {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('evidence_items').select('*').order('sort_order').then(({ data }) => {
      setItems((data as EvidenceItem[]) || [])
      setLoading(false)
    })
  }, [])

  function handleSaved(saved: EvidenceItem) {
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
        <h1 className="text-xl font-bold">Evidence</h1>
        <button
          onClick={() => setItems((prev) => [...prev, blankItem()])}
          className="btn-primary text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add evidence item
        </button>
      </div>
      {items.length === 0 && <p className="text-[color:var(--text-dim)] text-sm">No evidence items yet.</p>}
      {items.map((item) => (
        <EvidenceRow key={item.id} item={item} onSaved={handleSaved} onDeleted={handleDeleted} />
      ))}
    </div>
  )
}
