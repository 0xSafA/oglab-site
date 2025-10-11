import Link from 'next/link';
import { Suspense } from 'react';
import { CreateThread } from '@/components/forum/CreateThread';
import { StatsChart } from '@/components/forum/StatsChart';

async function getThreads(q?: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/forum/threads${q ? `?q=${encodeURIComponent(q)}` : ''}`, { cache: 'no-store' });
  const data = await res.json();
  return data.threads || [];
}

export default async function ForumIndex({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q;
  const threads = await getThreads(q);
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Forum</h1>
      <form className="flex gap-2" method="get">
        <input name="q" className="border rounded px-3 py-2 w-full" placeholder="Search" defaultValue={q} />
        <button className="px-3 py-2 border rounded">Search</button>
      </form>

      <ul className="divide-y">
        {threads.map((t: any) => (
          <li key={t.id} className="py-3">
            <Link href={`./forum/${t.id}`} className="text-blue-600 hover:underline">{t.title}</Link>
          </li>
        ))}
      </ul>

      <Suspense>
        <StatsChart />
      </Suspense>

      <CreateThread />
    </div>
  );
}


