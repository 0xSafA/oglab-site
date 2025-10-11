'use client';

import { useEffect, useState } from 'react';
import { ReplyBox } from './ReplyBox';
import { PostActions } from './PostActions';

export function ThreadClient({ threadId, bestPostId, initialPosts }:
  { threadId: string; bestPostId?: string | null; initialPosts: Array<any> }) {
  const [posts, setPosts] = useState(initialPosts);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [role, setRole] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch(`/api/forum/posts?threadId=${threadId}`, { cache: 'no-store' });
    const data = await res.json();
    setPosts(data.posts || []);
    const sr = await fetch(`/api/forum/scores?threadId=${threadId}`);
    const sd = await sr.json();
    const m: Record<string, number> = {};
    (sd.scores || []).forEach((s: any) => { m[s.post_id] = s.score; });
    setScores(m);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [threadId]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setRole(data?.user?.role || null);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {posts.map((p: any) => (
          <li key={p.id} className={`border rounded p-3 ${bestPostId === p.id ? 'border-green-600' : ''}`}>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>{new Date(p.created_at).toLocaleString()}</span>
              <span className="text-gray-400">score: {scores[p.id] ?? 0}</span>
            </div>
            <div className="whitespace-pre-wrap mt-1">{p.body_md}</div>
            <div className="mt-2">
              <PostActions postId={p.id} threadId={threadId} isBest={bestPostId === p.id} isShadowed={p.is_shadowed} canModerate={role === 'moderator' || role === 'admin'} onChanged={refresh} />
            </div>
          </li>
        ))}
      </ul>

      <ReplyBox threadId={threadId} onPosted={refresh} />
    </div>
  );
}


