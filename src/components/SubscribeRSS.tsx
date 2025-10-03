'use client'

import { useState } from 'react'

export default function SubscribeRSS() {
  const [email, setEmail] = useState('')
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOk(null); setErr(null)
    if (!email.includes('@')) { setErr('Enter valid email'); return }
    // mock
    setTimeout(() => setOk('Subscribed! Please confirm in your inbox.'), 400)
  }

  return (
    <section className="h-full rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-[#B0BF93]/50 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2F3A24]">Subscribe & RSS</h2>
        <a href="/en/rss.xml" className="rounded-full bg-[#536C4A] px-3 py-1 text-xs font-semibold text-white hover:opacity-90">RSS</a>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="rounded-xl border border-[#B0BF93]/60 bg-white/80 px-4 py-3 text-[#2F3A24] shadow-sm outline-none placeholder:text-[#2F3A24]/40 focus:border-[#536C4A]"
        />
        <button className="rounded-xl bg-gradient-to-r from-[#536C4A] to-[#B0BF93] px-5 py-3 font-semibold text-white shadow hover:opacity-95" type="submit">Subscribe</button>
      </form>
      {ok && <div className="mt-3 text-sm text-[#2F3A24]">{ok}</div>}
      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      <div className="mt-4 text-xs text-[#2F3A24]/60">В проде: double opt‑in, сегменты по языкам, auto‑UTM.</div>
      <div className="flex-1" />
    </section>
  )
}


