import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Profile } from '../../types'

const inputCls = 'w-full bg-[color:var(--bg)] border border-[color:var(--border)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--border-hover)]'
const labelCls = 'block text-xs font-mono-ui text-[color:var(--text-dim)] mb-1.5'

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    supabase.from('profile').select('*').eq('id', 1).single().then(({ data }) => {
      setProfile(data as Profile)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-[color:var(--text-dim)] text-sm">Loading…</p>
  if (!profile) return <p className="text-red-400 text-sm">No profile row found. Run schema.sql first.</p>

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p))
  }

  function updateFact(index: number, field: 'label' | 'value', value: string) {
    if (!profile) return
    const facts = [...profile.quick_facts]
    facts[index] = { ...facts[index], [field]: value }
    update('quick_facts', facts)
  }

  function addFact() {
    if (!profile) return
    update('quick_facts', [...profile.quick_facts, { label: '', value: '' }])
  }

  function removeFact(index: number) {
    if (!profile) return
    update('quick_facts', profile.quick_facts.filter((_, i) => i !== index))
  }

  function updateStat(index: number, field: 'label' | 'value', value: string) {
    if (!profile) return
    const stats = [...profile.stats]
    stats[index] = { ...stats[index], [field]: field === 'value' ? Number(value) : value }
    update('stats', stats)
  }

  async function handlePhotoUpload(file: File) {
    if (!profile) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `profile-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true })
    if (uploadError) {
      setMessage(`Photo upload failed: ${uploadError.message}`)
      setUploadingPhoto(false)
      return
    }
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path)
    update('photo_url', data.publicUrl)
    setUploadingPhoto(false)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setMessage(null)
    const { id, ...rest } = profile
    const { error } = await supabase.from('profile').update(rest).eq('id', id)
    setSaving(false)
    setMessage(error ? `Save failed: ${error.message}` : 'Saved.')
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Profile</h1>

      <div className="glass-card p-6 mb-6">
        <label className={labelCls}>Photo</label>
        <div className="flex items-center gap-4">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="Profile" className="w-20 h-20 rounded-xl object-cover border border-[color:var(--border)]" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)]" />
          )}
          <label className="btn-outline text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer">
            {uploadingPhoto ? 'Uploading…' : 'Upload new photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingPhoto}
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <div className="glass-card p-6 mb-6 space-y-4">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={profile.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <input className={inputCls} value={profile.role} onChange={(e) => update('role', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Tagline (optional, shown under Role)</label>
          <input className={inputCls} value={profile.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={profile.location} onChange={(e) => update('location', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input className={inputCls} value={profile.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>GitHub URL</label>
          <input className={inputCls} value={profile.github_url} onChange={(e) => update('github_url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>LinkedIn URL</label>
          <input className={inputCls} value={profile.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Medium URL</label>
          <input className={inputCls} value={profile.medium_url} onChange={(e) => update('medium_url', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Hero thesis</label>
          <textarea className={inputCls} rows={3} value={profile.hero_thesis} onChange={(e) => update('hero_thesis', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>About — paragraph 1</label>
          <textarea className={inputCls} rows={3} value={profile.about_paragraph_1} onChange={(e) => update('about_paragraph_1', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>About — paragraph 2</label>
          <textarea className={inputCls} rows={3} value={profile.about_paragraph_2} onChange={(e) => update('about_paragraph_2', e.target.value)} />
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <label className={labelCls}>Quick facts</label>
        <div className="space-y-3">
          {profile.quick_facts.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="Label" value={f.label} onChange={(e) => updateFact(i, 'label', e.target.value)} />
              <input className={inputCls} placeholder="Value" value={f.value} onChange={(e) => updateFact(i, 'value', e.target.value)} />
              <button onClick={() => removeFact(i)} className="text-red-400 px-2">×</button>
            </div>
          ))}
        </div>
        <button onClick={addFact} className="text-sm text-[color:var(--accent)] mt-3 font-semibold">+ Add fact</button>
      </div>

      <div className="glass-card p-6 mb-6">
        <label className={labelCls}>Hero stats</label>
        <div className="space-y-3">
          {profile.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className={inputCls} placeholder="Label" value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} />
              <input className={`${inputCls} w-24`} type="number" placeholder="Value" value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="btn-primary font-semibold px-6 py-2.5 rounded-lg disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {message && <p className="text-sm text-[color:var(--text-dim)]">{message}</p>}
      </div>
    </div>
  )
}
