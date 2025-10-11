'use client';

export function PostActions({ postId, threadId, isBest, isShadowed, canModerate, onChanged }:
  { postId: string; threadId: string; isBest?: boolean; isShadowed?: boolean; canModerate?: boolean; onChanged?: () => void }) {
  const [toast, setToast] = useState<string>('');
  async function vote(v: 1 | -1) {
    const res = await fetch('/api/forum/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, value: v }) });
    setToast(res.ok ? 'Voted' : 'Vote failed');
    setTimeout(()=>setToast(''), 1500);
    onChanged?.();
  }
  async function markBest() {
    const res = await fetch('/api/forum/best-answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thread_id: threadId, post_id: postId }) });
    setToast(res.ok ? 'Marked' : 'Action failed');
    setTimeout(()=>setToast(''), 1500);
    onChanged?.();
  }
  async function toggleShadow() {
    const res = await fetch('/api/forum/moderate/shadow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId, shadow: !isShadowed }) });
    setToast(res.ok ? (!isShadowed ? 'Shadowed' : 'Unshadowed') : 'Action failed');
    setTimeout(()=>setToast(''), 1500);
    onChanged?.();
  }
  async function removePost() {
    const res = await fetch('/api/forum/posts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: postId }) });
    setToast(res.ok ? 'Deleted' : 'Delete failed');
    setTimeout(()=>setToast(''), 1500);
    onChanged?.();
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <button className="px-2 py-1 border rounded" onClick={()=>vote(1)}>▲</button>
      <button className="px-2 py-1 border rounded" onClick={()=>vote(-1)}>▼</button>
      <button className={`px-2 py-1 border rounded ${isBest ? 'bg-green-600 text-white' : ''}`} onClick={markBest} disabled={!!isBest}>
        {isBest ? 'Best answer' : 'Mark best'}
      </button>
      {canModerate && (
        <>
          <button className={`px-2 py-1 border rounded ${isShadowed ? 'bg-yellow-600 text-white' : ''}`} onClick={toggleShadow}>
            {isShadowed ? 'Unshadow' : 'Shadow'}
          </button>
          <button className="px-2 py-1 border rounded text-red-700" onClick={removePost}>Delete</button>
        </>
      )}
      {toast && <span className="text-xs text-green-700">{toast}</span>}
    </div>
  );
}


