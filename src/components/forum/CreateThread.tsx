'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateThread() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [toast, setToast] = useState<string>('');

  async function onCreate() {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch('/api/forum/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    setLoading(false);
    const data = await res.json();
    if (data?.id) {
      setToast('Thread created');
      setTimeout(() => setToast(''), 2000);
      router.push(`/en/forum/${data.id}`);
    } else {
      setToast('Failed to create');
      setTimeout(() => setToast(''), 2000);
    }
  }

  return (
    <div className="border rounded p-4 space-y-2">
      <div className="text-sm font-medium">Create thread</div>
      <input className="border rounded px-3 py-2 w-full" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <button className="px-3 py-2 border rounded" onClick={onCreate} disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      {toast && <div className="text-xs text-green-700">{toast}</div>}
    </div>
  );
}


