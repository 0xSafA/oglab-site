'use client'

type AggregatedItem = {
  id: string
  source: string
  title: string
  url: string
  date: string
}

const mock: AggregatedItem[] = [
  { id: 'agg-1', source: 'High Times', title: 'New study on terpenes and mood', url: '#', date: '2025-08-30' },
  { id: 'agg-2', source: 'Leafly', title: 'Top strains this month', url: '#', date: '2025-08-28' },
  { id: 'agg-3', source: 'NORML', title: 'Policy update in Thailand', url: '#', date: '2025-08-25' },
]

export default function AggregatedNewsMock() {
  return (
    <section className="h-full rounded-3xl bg-white/75 p-6 shadow-xl ring-1 ring-[#B0BF93]/50 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2F3A24]">Cannabis News — Aggregated</h2>
        <span className="text-xs font-semibold text-[#536C4A]">auto‑translated by locale</span>
      </div>
      <ul className="divide-y divide-[#B0BF93]/40 flex-1">
        {mock.map((n) => (
          <li key={n.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#2F3A24]">{n.title}</div>
              <div className="text-xs text-[#2F3A24]/60">{n.source} • {new Date(n.date).toLocaleDateString()}</div>
            </div>
            <a href={n.url} className="shrink-0 rounded-full bg-[#536C4A] px-3 py-1 text-xs font-semibold text-white hover:opacity-90">Read</a>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-[#2F3A24]/60">В проде: парсер RSS/HTML, дедупликация, нормализация источников, авто‑перевод и кеш.</div>
    </section>
  )
}


