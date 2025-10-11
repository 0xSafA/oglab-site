'use client';

import { useEffect, useState } from 'react';

type Stat = { day: string; threads: number; posts: number };

export function StatsChart() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/forum/stats', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setStats((data.stats || []).map((s: any) => ({
        day: s.day,
        threads: Number(s.threads || 0),
        posts: Number(s.posts || 0)
      })));
    })();
  }, []);

  if (!stats.length) return null;

  const width = 600;
  const height = 180;
  const pad = 24;
  const maxY = Math.max(1, ...stats.map(s => Math.max(s.threads, s.posts)));
  const stepX = (width - pad * 2) / Math.max(1, stats.length - 1);

  const toX = (i: number) => pad + i * stepX;
  const toY = (v: number) => height - pad - (v / maxY) * (height - pad * 2);

  const path = (key: 'threads' | 'posts') =>
    stats.map((s, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(s[key])}`).join(' ');

  return (
    <div className="border rounded p-3">
      <div className="text-sm font-medium mb-2">Activity (30 days)</div>
      <svg width={width} height={height} className="max-w-full h-auto">
        <rect x={0} y={0} width={width} height={height} fill="white" />
        <path d={path('threads')} stroke="#3b82f6" fill="none" strokeWidth={2} />
        <path d={path('posts')} stroke="#16a34a" fill="none" strokeWidth={2} />
        <text x={pad} y={pad} fontSize="10" fill="#3b82f6">threads</text>
        <text x={pad + 60} y={pad} fontSize="10" fill="#16a34a">posts</text>
      </svg>
    </div>
  );
}


