'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'

type SharePlatform = 'reddit' | 'medium' | 'twitter' | 'facebook' | 'instagram' | 'tripadvisor'
type ShareStatus = 'draft' | 'scheduled' | 'published' | 'failed'

interface PostShare {
  id: string
  post_translation_id: string
  platform: SharePlatform
  locale: string
  title_override: string | null
  content_md: string | null
  media_refs: string[] | null
  utm_source: string | null
  utm_campaign: string | null
  status: ShareStatus
  scheduled_at: string | null
  published_at: string | null
  external_post_id: string | null
  external_url: string | null
  moderation_notes: string | null
  created_at: string
  updated_at: string
}

interface ShareMetrics {
  impressions?: number | null
  likes?: number | null
  comments?: number | null
  shares?: number | null
  saves?: number | null
  fetched_at?: string
}

interface PostTranslationOption {
  id: string
  locale: string
  title: string
  slug: string
}

interface PostSharePayload {
  post_translation_id: string
  platform: SharePlatform
  locale: string
  title_override: string | null
  content_md: string | null
  utm_source: string | null
  utm_campaign: string | null
  status: ShareStatus
  scheduled_at: string | null
}

export default function BlogAdminPage() {
  const supabase = createClientComponentClient()
  const [items, setItems] = useState<PostShare[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<SharePlatform | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ShareStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [translations, setTranslations] = useState<PostTranslationOption[]>([])

  // form state
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTranslationId, setFormTranslationId] = useState<string>('')
  const [formPlatform, setFormPlatform] = useState<SharePlatform>('twitter')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formUtmSource, setFormUtmSource] = useState('')
  const [formUtmCampaign, setFormUtmCampaign] = useState('')
  const [formStatus, setFormStatus] = useState<ShareStatus>('draft')
  const [formScheduledAt, setFormScheduledAt] = useState<string>('')
  const [formSaving, setFormSaving] = useState(false)

  useEffect(() => {
    load()
    loadTranslations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('post_shares')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (err) throw err
      setItems(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load post shares')
    } finally {
      setLoading(false)
    }
  }

  const loadTranslations = async () => {
    try {
      const { data, error: err } = await supabase
        .from('post_translations')
        .select('id, locale, title, slug')
        .order('updated_at', { ascending: false })
        .limit(500)
      if (err) throw err
      setTranslations((data || []) as PostTranslationOption[])
    } catch (e) {
      // keep silent in UI, optionally log
      console.error(e)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormTranslationId('')
    setFormPlatform('twitter')
    setFormTitle('')
    setFormContent('')
    setFormUtmSource('')
    setFormUtmCampaign('')
    setFormStatus('draft')
    setFormScheduledAt('')
  }

  const onEdit = (share: PostShare) => {
    setFormOpen(true)
    setEditingId(share.id)
    setFormTranslationId(share.post_translation_id)
    setFormPlatform(share.platform)
    setFormTitle(share.title_override ?? '')
    setFormContent(share.content_md ?? '')
    setFormUtmSource(share.utm_source ?? '')
    setFormUtmCampaign(share.utm_campaign ?? '')
    setFormStatus(share.status)
    setFormScheduledAt(share.scheduled_at ? toLocalDateTime(share.scheduled_at) : '')
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this cross‑post?')) return
    const res = await fetch(`/api/post-shares/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const j = await res.json().catch(() => null)
      alert(j?.error || 'Delete failed')
      return
    }
    await load()
  }

  const toLocalDateTime = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  const toIsoFromLocal = (local: string) => {
    // local is in YYYY-MM-DDTHH:mm; treat as local time
    const dt = new Date(local)
    return dt.toISOString()
  }

  const sanitizeContent = () => {
    const banned = [
      'cannabis','marijuana','weed','ganja','hash','бошки','шишки','каннабис','марихуана','травка','конопля'
    ]
    const re = new RegExp(`\\b(${banned.join('|')})\\b`, 'gi')
    setFormContent((prev) => prev ? prev.replace(re, 'product') : prev)
    setFormTitle((prev) => prev ? prev.replace(re, 'Product') : prev)
  }

  const suggestUtm = () => {
    const tr = translations.find(t => t.id === formTranslationId)
    const src = formPlatform
    const camp = tr ? `${tr.slug}-${tr.locale}` : 'blog'
    setFormUtmSource(src)
    setFormUtmCampaign(camp)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formTranslationId) {
      alert('Select post translation')
      return
    }
    setFormSaving(true)
    try {
      const tr = translations.find(t => t.id === formTranslationId)
      if (!tr) throw new Error('Translation not found')
      const payload: PostSharePayload = {
        post_translation_id: formTranslationId,
        platform: formPlatform,
        locale: tr.locale,
        title_override: formTitle || null,
        content_md: formContent || null,
        utm_source: formUtmSource || null,
        utm_campaign: formUtmCampaign || null,
        status: formStatus,
        scheduled_at: formScheduledAt ? toIsoFromLocal(formScheduledAt) : null
      }
      let ok = false
      if (editingId) {
        const res = await fetch(`/api/post-shares/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        ok = res.ok
        if (!ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.error || 'Update failed')
        }
      } else {
        const res = await fetch('/api/post-shares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        ok = res.ok
        if (!ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.error || 'Create failed')
        }
      }
      resetForm()
      setFormOpen(false)
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }

  const filtered = useMemo(() => {
    const lowerQuery = search.toLowerCase()
    return items.filter((it) => {
      if (filterPlatform !== 'all' && it.platform !== filterPlatform) return false
      if (filterStatus !== 'all' && it.status !== filterStatus) return false
      if (lowerQuery && !(`${it.locale} ${it.platform} ${it.title_override ?? ''} ${it.external_url ?? ''}`.toLowerCase().includes(lowerQuery))) return false
      return true
    })
  }, [items, filterPlatform, filterStatus, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cross‑posts</h1>
        <button
          onClick={load}
          className="px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-black"
        >
          Refresh
        </button>
      </div>

      <div className="border rounded-md p-4 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{editingId ? 'Edit cross‑post' : 'New cross‑post'}</h2>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-md border"
              onClick={() => {
                if (formOpen) { resetForm() }
                setFormOpen((v) => !v)
              }}
            >
              {formOpen ? 'Close' : 'Open'}
            </button>
            {formOpen && (
              <button
                className="px-3 py-1 rounded-md border"
                onClick={() => { resetForm() }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {formOpen && (
          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Post translation</label>
              <select
                className="border rounded-md px-2 py-2"
                value={formTranslationId}
                onChange={(e) => setFormTranslationId(e.target.value)}
                required
              >
                <option value="">Select translation…</option>
                {translations.map(t => (
                  <option key={t.id} value={t.id}>{t.locale} • {t.title} • {t.slug}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Platform</label>
              <select
                className="border rounded-md px-2 py-2"
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value as SharePlatform)}
              >
                <option value="reddit">Reddit</option>
                <option value="medium">Medium</option>
                <option value="twitter">X/Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tripadvisor">Tripadvisor</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Title override</label>
              <input
                type="text"
                className="border rounded-md px-3 py-2"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Optional platform‑specific title"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Sanitized teaser (Markdown)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={sanitizeContent} className="px-2 py-1 border rounded-md">Sanitize</button>
                  <button type="button" onClick={suggestUtm} className="px-2 py-1 border rounded-md">Suggest UTM</button>
                </div>
              </div>
              <textarea
                className="border rounded-md px-3 py-2 min-h-[120px]"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Short teaser without restricted terms; include CTA to full article"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">UTM source</label>
              <input
                type="text"
                className="border rounded-md px-3 py-2"
                value={formUtmSource}
                onChange={(e) => setFormUtmSource(e.target.value)}
                placeholder="e.g. twitter"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">UTM campaign</label>
              <input
                type="text"
                className="border rounded-md px-3 py-2"
                value={formUtmCampaign}
                onChange={(e) => setFormUtmCampaign(e.target.value)}
                placeholder="e.g. my-post-slug-en"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Status</label>
              <select
                className="border rounded-md px-2 py-2"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ShareStatus)}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Scheduled at (local)</label>
              <input
                type="datetime-local"
                className="border rounded-md px-3 py-2"
                value={formScheduledAt}
                onChange={(e) => setFormScheduledAt(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={formSaving}
                className="px-4 py-2 rounded-md bg-[#536C4A] text-white hover:opacity-90 disabled:opacity-50"
              >
                {formSaving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); setFormOpen(false) }}
                  className="px-4 py-2 rounded-md border"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded-md px-2 py-1"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value as SharePlatform | 'all')}
        >
          <option value="all">All platforms</option>
          <option value="reddit">Reddit</option>
          <option value="medium">Medium</option>
          <option value="twitter">X/Twitter</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="tripadvisor">Tripadvisor</option>
        </select>
        <select
          className="border rounded-md px-2 py-1"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ShareStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-1 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2">Locale</th>
                <th className="p-2">Platform</th>
                <th className="p-2">Title</th>
                <th className="p-2">Status</th>
                <th className="p-2">Scheduled</th>
                <th className="p-2">Published</th>
                <th className="p-2">External</th>
                <th className="p-2">Actions</th>
                <th className="p-2">Metrics</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2 font-mono">{it.locale}</td>
                  <td className="p-2">{it.platform}</td>
                  <td className="p-2">{it.title_override || '—'}</td>
                  <td className="p-2">{it.status}</td>
                  <td className="p-2">{it.scheduled_at ? new Date(it.scheduled_at).toLocaleString() : '—'}</td>
                  <td className="p-2">{it.published_at ? new Date(it.published_at).toLocaleString() : '—'}</td>
                  <td className="p-2">
                    {it.external_url ? (
                      <a href={it.external_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open</a>
                    ) : '—'}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded-md" onClick={() => onEdit(it)}>Edit</button>
                      <button className="px-2 py-1 border rounded-md" onClick={() => onDelete(it.id)}>Delete</button>
                    </div>
                  </td>
                  <td className="p-2">
                    <ShareMetricsCell id={it.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ShareMetricsCell({ id }: { id: string }) {
  const [metrics, setMetrics] = useState<ShareMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [impressions, setImpressions] = useState<string>('')
  const [likes, setLikes] = useState<string>('')
  const [comments, setComments] = useState<string>('')
  const [shares, setShares] = useState<string>('')
  const [saves, setSaves] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/post-shares/${id}/metrics`)
      const j = await res.json()
      if (!res.ok) {
        throw new Error(j?.error || 'Failed to load metrics')
      }
      setMetrics(j.data as ShareMetrics)
      setErr(null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load error')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        impressions: impressions ? parseInt(impressions, 10) : null,
        likes: likes ? parseInt(likes, 10) : null,
        comments: comments ? parseInt(comments, 10) : null,
        shares: shares ? parseInt(shares, 10) : null,
        saves: saves ? parseInt(saves, 10) : null
      }
      const res = await fetch(`/api/post-shares/${id}/metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Save failed')
      }
      setFormOpen(false)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }

  const openForm = () => {
    setImpressions(metrics?.impressions?.toString() || '')
    setLikes(metrics?.likes?.toString() || '')
    setComments(metrics?.comments?.toString() || '')
    setShares(metrics?.shares?.toString() || '')
    setSaves(metrics?.saves?.toString() || '')
    setFormOpen(true)
  }

  if (loading) return <span className="text-gray-400">Loading...</span>
  if (err) return <span className="text-red-600">{err}</span>
  if (!metrics) return <span className="text-gray-400">No metrics</span>

  return (
    <div className="text-sm">
      {!formOpen ? (
        <div>
          <div className="mb-1">
            Impressions: {metrics.impressions ?? '—'}, Likes: {metrics.likes ?? '—'},
            Comments: {metrics.comments ?? '—'}, Shares: {metrics.shares ?? '—'}, Saves: {metrics.saves ?? '—'}
          </div>
          <button className="px-2 py-1 border rounded-md text-xs" onClick={openForm}>
            Edit Metrics
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Impressions"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          />
          <input
            type="number"
            placeholder="Likes"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          />
          <input
            type="number"
            placeholder="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          />
          <input
            type="number"
            placeholder="Shares"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          />
          <input
            type="number"
            placeholder="Saves"
            value={saves}
            onChange={(e) => setSaves(e.target.value)}
            className="w-full border rounded-md px-2 py-1"
          />
          <div className="flex gap-2">
            <button
              className="px-2 py-1 border rounded-md text-xs"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="px-2 py-1 border rounded-md text-xs"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}