'use client';

import { useEffect, useState } from 'react';

type Share = { id: string; platform: string; status: string; scheduled_at?: string; external_url?: string };

export function CrossPostTab({ postTranslationId }: { postTranslationId: string }) {
  const [shares, setShares] = useState<Share[]>([]);
  const [platform, setPlatform] = useState('medium');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [connectedReddit, setConnectedReddit] = useState<boolean>(false);
  const [checks, setChecks] = useState<Array<{ id: string; provider: string; status: string; score?: number }>>([]);

  async function load() {
    const res = await fetch(`/api/cms/shares?postTranslationId=${postTranslationId}`);
    const data = await res.json();
    setShares(data.shares || []);
    const ur = await fetch(`/api/cms/uniqueness/list?postTranslationId=${postTranslationId}`);
    const ud = await ur.json();
    setChecks(ud.checks || []);
  }

  async function save() {
    await fetch('/api/cms/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_translation_id: postTranslationId, platform, content_md: content, scheduled_at: scheduledAt || null })
    });
    await load();
  }

  async function publishReddit() {
    if (!postTranslationId || !subreddit) return;
    await fetch('/api/cms/reddit/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_translation_id: postTranslationId, subreddit, title: content.slice(0, 280), content_md: content })
    });
    await load();
  }

  async function checkRedditConn() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return;
    const me = await res.json();
    setConnectedReddit(!!me?.user);
  }

  useEffect(() => { checkRedditConn(); }, []);
  useEffect(() => { if (postTranslationId) load(); }, [postTranslationId]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Platform</label>
          <select className="border rounded px-2 py-1 w-full" value={platform} onChange={(e)=>setPlatform(e.target.value)}>
            <option value="medium">Medium</option>
            <option value="reddit">Reddit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Schedule at</label>
          <input type="datetime-local" className="border rounded px-2 py-1 w-full" value={scheduledAt} onChange={(e)=>setScheduledAt(e.target.value)} />
        </div>
        {platform === 'reddit' && (
          <div>
            <label className="block text-sm">Subreddit</label>
            <input className="border rounded px-2 py-1 w-full" value={subreddit} onChange={(e)=>setSubreddit(e.target.value)} placeholder="r/your_subreddit" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm">Content</label>
        <textarea className="border rounded px-2 py-1 w-full h-40" value={content} onChange={(e)=>setContent(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={save}>Save share</button>
        {platform === 'reddit' && (
          connectedReddit ? (
            <button className="px-3 py-1 border rounded" onClick={publishReddit}>Publish Reddit</button>
          ) : (
            <a className="px-3 py-1 border rounded" href="/api/cms/oauth/reddit/start">Connect Reddit</a>
          )
        )}
      </div>

      <div>
        <h3 className="font-medium mt-4">Shares</h3>
        <ul className="list-disc ml-6">
          {shares.map(s => (
            <li key={s.id}>[{s.platform}] {s.status} {s.scheduled_at ? `→ ${s.scheduled_at}` : ''} {s.external_url ? `— ${s.external_url}` : ''}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium mt-4">Uniqueness checks</h3>
        <ul className="list-disc ml-6">
          {checks.map(c => (
            <li key={c.id}>[{c.provider}] {c.status}{typeof c.score === 'number' ? ` — score: ${c.score}` : ''}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


