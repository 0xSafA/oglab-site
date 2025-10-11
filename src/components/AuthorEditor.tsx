'use client';

import { useState } from 'react';

type Author = {
  display_name?: string;
  bio?: string;
  credentials?: string;
  photo_url?: string;
  links?: Record<string, unknown>;
};

export function AuthorEditor({ userId, initial }: { userId: string; initial: Author }) {
  const [form, setForm] = useState<Author>({
    display_name: initial.display_name || '',
    bio: initial.bio || '',
    credentials: initial.credentials || '',
    photo_url: initial.photo_url || '',
    links: initial.links || {},
  });
  const [toast, setToast] = useState<string>('');

  async function save() {
    const res = await fetch('/api/authors/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...form })
    });
    setToast(res.ok ? 'Saved' : 'Save failed');
    setTimeout(() => setToast(''), 2000);
  }

  function set<K extends keyof Author>(key: K, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm">Display name</label>
        <input className="border rounded px-3 py-2 w-full" value={form.display_name as string} onChange={(e)=>set('display_name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Credentials</label>
        <input className="border rounded px-3 py-2 w-full" value={form.credentials as string} onChange={(e)=>set('credentials', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Photo URL</label>
        <input className="border rounded px-3 py-2 w-full" value={form.photo_url as string} onChange={(e)=>set('photo_url', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Bio</label>
        <textarea className="border rounded px-3 py-2 w-full h-40" value={form.bio as string} onChange={(e)=>set('bio', e.target.value)} />
      </div>
      <button className="px-3 py-2 border rounded" onClick={save}>Save</button>
      {toast && <div className="text-xs text-green-700">{toast}</div>}
    </div>
  );
}


