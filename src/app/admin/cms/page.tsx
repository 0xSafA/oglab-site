'use client';

import { useState } from 'react';
import { CmsLocaleEditor } from '@/components/CmsLocaleEditor';
import { JobsPanel } from './JobsPanel';
import { useToast } from '@/components/Toast';
import { CrossPostTab } from './CrossPostTab';

async function checkUniqueness(locale: string, text: string) {
  const res = await fetch('/api/cms/uniqueness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale, text, limit: 5, threshold: 0.25 })
  });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return data.matches || [];
}

const LOCALES = ['en','ru','th','de','fr','it','he'];

export default function CMSAdminPage() {
  const toast = useToast();
  const [activeLocale, setActiveLocale] = useState<string>(LOCALES[0]);
  const [postId, setPostId] = useState<string>('');
  const [localeValues, setLocaleValues] = useState<Record<string, { title: string; slug: string; seoTitle: string; seoDescription: string; body: string }>>(
    Object.fromEntries(LOCALES.map(l => [l, { title: '', slug: '', seoTitle: '', seoDescription: '', body: '' }]))
  );
  const [translationIds, setTranslationIds] = useState<Record<string, string>>({});
  const [sourceLocale, setSourceLocale] = useState<string>(LOCALES[0]);
  const [targetLocales, setTargetLocales] = useState<string[]>(LOCALES);
  const [glossary, setGlossary] = useState<string>('{}');
  const [compliance, setCompliance] = useState<string>('{"banned":["weed","ganja","mj","cannabis"]}');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [noindex, setNoindex] = useState<boolean>(false);
  const [previewToken, setPreviewToken] = useState<string>('');
  const [shortAnswer, setShortAnswer] = useState<string>('');

  async function call(action: 'translate' | 'improve' | 'compliance' | 'uniqueness-check') {
    const res = await fetch(`/api/cms/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        locale: activeLocale,
        locales: LOCALES,
        sourceLocale,
        targetLocales,
        title: localeValues[activeLocale]?.title,
        slug: localeValues[activeLocale]?.slug,
        content: localeValues[activeLocale]?.body,
        seoTitle: localeValues[activeLocale]?.seoTitle,
        seoDescription: localeValues[activeLocale]?.seoDescription,
        glossary: safeParse(glossary),
        complianceRules: safeParse(compliance)
      })
    });
    if (!res.ok) {
      console.error(action, 'failed');
      toast.show(`${action} failed`);
    } else {
      toast.show(`${action} queued`);
    }
  }

  async function saveTranslation() {
    if (!postId) return;
    const v = localeValues[activeLocale];
    await fetch('/api/cms/upsert-translation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        locale: activeLocale,
        title: v.title || 'Draft title',
        slug: v.slug || 'draft-slug',
        body_md: v.body,
        seo_title: v.seoTitle,
        seo_description: v.seoDescription
      })
    });
    toast.show('Saved');
  }

  function updateLocale(lc: string, patch: Partial<typeof localeValues[string]>) {
    setLocaleValues(prev => ({ ...prev, [lc]: { ...prev[lc], ...patch } }));
  }

  function toggleTarget(lc: string) {
    setTargetLocales(prev => prev.includes(lc) ? prev.filter(x => x !== lc) : [...prev, lc]);
  }

  function safeParse(s: string) {
    try { return JSON.parse(s); } catch { return undefined; }
  }

  async function createPost() {
    const res = await fetch('/api/cms/create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data?.id) setPostId(data.id);
  }

  async function runExternalUniqueness() {
    const v = localeValues[activeLocale];
    const post_translation_id = translationIds[activeLocale];
    if (!post_translation_id) { toast.show('Load translations first'); return; }
    const res = await fetch('/api/cms/uniqueness/external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'copyleaks', post_translation_id, text: v.body })
    });
    toast.show(res.ok ? 'External uniqueness queued' : 'Uniqueness failed');
  }

  async function loadTranslations() {
    if (!postId) return;
    const res = await fetch(`/api/cms/translations?postId=${postId}`);
    const data = await res.json();
    if (data?.translations) {
      const map: Record<string, any> = { ...localeValues };
      const idMap: Record<string, string> = { ...translationIds };
      for (const t of data.translations as Array<any>) {
        map[t.locale] = {
          title: t.title || '',
          slug: t.slug || '',
          seoTitle: t.seo_title || '',
          seoDescription: t.seo_description || '',
          body: t.body_md || ''
        };
        if (t.id) idMap[t.locale] = t.id;
      }
      setLocaleValues(map);
      setTranslationIds(idMap);
    }
  }

  async function publishLocale() {
    if (!postId) return;
    await fetch('/api/cms/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, locale: activeLocale })
    });
    toast.show(`Published ${activeLocale}`);
    await fetch('/api/cms/sitemap/ping', { method: 'POST' });
    toast.show('Sitemap pinged');
  }

  async function unpublishLocale() {
    if (!postId) return;
    await fetch('/api/cms/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, locale: activeLocale })
    });
    toast.show(`Unpublished ${activeLocale}`);
  }

  async function scheduleLocale() {
    if (!postId || !scheduledAt) return;
    await fetch('/api/cms/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, locale: activeLocale, scheduled_at: scheduledAt })
    });
    toast.show(`Scheduled ${activeLocale}`);
  }

  async function toggleNoindex() {
    if (!postId) return;
    await fetch('/api/cms/upsert-translation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, locale: activeLocale, title: localeValues[activeLocale]?.title || 'Draft', slug: localeValues[activeLocale]?.slug || 'draft', noindex })
    });
    toast.show(noindex ? 'noindex ON' : 'noindex OFF');
  }

  async function createPreviewToken() {
    if (!postId) return;
    const res = await fetch('/api/cms/preview-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, locale: activeLocale })
    });
    const data = await res.json();
    if (data?.token) setPreviewToken(data.token);
  }

  async function checkAnswerBox() {
    const v = localeValues[activeLocale];
    const res = await fetch('/api/cms/answerbox/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ short_answer: shortAnswer, body_md: v.body })
    });
    const data = await res.json();
    if (data.ok) toast.show('Answer-box OK');
    else toast.show(`Issues: ${data.issues?.join('; ')}`);
  }

  async function exportTranslations() {
    if (!postId) return;
    const res = await fetch(`/api/cms/translations/export?postId=${postId}`);
    if (!res.ok) { toast.show('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-${postId}-translations.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importTranslations(file: File) {
    if (!postId || !file) return;
    const text = await file.text();
    let json: any;
    try { json = JSON.parse(text); } catch { toast.show('Invalid JSON'); return; }
    const translations = json.translations || json;
    const res = await fetch('/api/cms/translations/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, translations })
    });
    toast.show(res.ok ? 'Imported' : 'Import failed');
    if (res.ok) await loadTranslations();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">CMS — Multilingual Editor</h1>
      <div className="space-x-2">
        {LOCALES.map(lc => (
          <button
            key={lc}
            className={`px-3 py-1 rounded border ${lc===activeLocale ? 'bg-black text-white' : ''}`}
            onClick={() => setActiveLocale(lc)}
          >
            {lc.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Source locale</label>
          <select className="border rounded px-2 py-1 w-full" value={sourceLocale} onChange={(e)=>setSourceLocale(e.target.value)}>
            {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Target locales</label>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map(l => (
              <label key={l} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={targetLocales.includes(l)} onChange={()=>toggleTarget(l)} /> {l}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm">Glossary (JSON)</label>
          <textarea className="border rounded px-2 py-1 w-full h-20" value={glossary} onChange={(e)=>setGlossary(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm">Compliance rules (JSON)</label>
        <textarea className="border rounded px-2 py-1 w-full h-20" value={compliance} onChange={(e)=>setCompliance(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Post ID</label>
        <input
          className="border rounded px-3 py-2 w-full max-w-md"
          placeholder="uuid of post"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={createPost}>Create post</button>
          <button className="px-3 py-1 border rounded" onClick={loadTranslations} disabled={!postId}>Load translations</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 border rounded" onClick={() => call('translate')}>Translate all</button>
        <button className="px-4 py-2 border rounded" onClick={() => call('improve')}>Improve all</button>
        <button className="px-4 py-2 border rounded" onClick={() => call('compliance')}>Fit to compliance</button>
        <button className="px-4 py-2 border rounded" onClick={() => checkUniqueness(activeLocale, localeValues[activeLocale]?.body || '')}>Check uniqueness</button>
        <button className="px-4 py-2 border rounded" onClick={runExternalUniqueness}>External uniqueness</button>
        <button className="px-4 py-2 border rounded" onClick={saveTranslation}>Save translation</button>
        <button className="px-4 py-2 border rounded" onClick={publishLocale}>Publish locale</button>
        <button className="px-4 py-2 border rounded" onClick={unpublishLocale}>Unpublish</button>
      </div>

      <div className="border rounded p-4">
        <p className="text-sm text-gray-600">Editor area for locale: <b>{activeLocale}</b></p>
        <CmsLocaleEditor locale={activeLocale} value={localeValues[activeLocale]} onChange={(v)=>updateLocale(activeLocale, v)} />
      </div>

      {/* Cross-posting */}
      <div className="border rounded p-4">
        <p className="text-sm text-gray-600">Cross-post</p>
        <CrossPostTab postTranslationId={translationIds[activeLocale] || ''} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Schedule publish at</label>
          <input type="datetime-local" className="border rounded px-2 py-1 w-full" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} />
          <button className="mt-2 px-3 py-1 border rounded" onClick={scheduleLocale} disabled={!scheduledAt}>Schedule</button>
        </div>
        <div>
          <label className="block text-sm">noindex</label>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={noindex} onChange={(e)=>setNoindex(e.target.checked)} />
            <button className="px-3 py-1 border rounded" onClick={toggleNoindex}>Apply</button>
          </div>
        </div>
        <div>
          <label className="block text-sm">Preview token</label>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={createPreviewToken}>Generate</button>
            {previewToken && <span className="text-xs break-all">{previewToken}</span>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm">Short answer (for AEO check)</label>
          <input className="border rounded px-2 py-1 w-full" value={shortAnswer} onChange={(e)=>setShortAnswer(e.target.value)} />
          <button className="mt-2 px-3 py-1 border rounded" onClick={checkAnswerBox}>Answer‑box check</button>
        </div>
        <div>
          <label className="block text-sm">Export/Import</label>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={exportTranslations}>Export JSON</button>
            <label className="px-3 py-1 border rounded cursor-pointer">
              Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importTranslations(f); }} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm">Sitemap</label>
          <button className="px-3 py-1 border rounded" onClick={() => fetch('/api/cms/sitemap/ping', { method: 'POST' })}>Ping</button>
        </div>
      </div>

      <JobsPanel />
      {toast.node}
    </div>
  );
}


