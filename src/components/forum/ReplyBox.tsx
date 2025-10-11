'use client';

import { useState } from 'react';

export function ReplyBox({ threadId, onPosted }: { threadId: string; onPosted?: () => void }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string>('');

  async function onPost() {
    if (!body.trim()) return;
    setLoading(true);
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, body_md: body })
    });
    setLoading(false);
    if (res.ok) {
      setBody('');
      setToast('Posted');
      setTimeout(() => setToast(''), 2000);
      onPosted?.();
    } else {
      setToast('Failed');
      setTimeout(() => setToast(''), 2000);
    }
  }

  return (
    <div className="border rounded p-3 space-y-2">
      <textarea className="border rounded px-3 py-2 w-full h-32" placeholder="Write your reply..." value={body} onChange={(e)=>setBody(e.target.value)} />
      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={onPost} disabled={loading}>{loading ? 'Posting...' : 'Post reply'}</button>
      </div>
      {toast && <div className="text-xs text-green-700">{toast}</div>}
    </div>
  );
}


