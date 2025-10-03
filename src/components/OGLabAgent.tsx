'use client'

import { useState } from 'react'

export default function OGLabAgent() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [useStock, setUseStock] = useState(true)

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // mock response: in prod, call an API that merges company KB + inventory + trusted sources
    setTimeout(() => {
      const base = useStock
        ? 'Based on current stock (EN): Sunset Indica — evening • calm • berry; alt: Double Sativa — bright & creative.'
        : 'General guidance: For evening relaxation, look for myrcene‑forward indica‑leaning strains; keep temperature lower for terp profile.'
      setAnswer(`${base} I can place a hold for pickup or forward your request to a senior budtender.`)
      setLoading(false)
    }, 600)
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-[#B0BF93]/50 overflow-hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#2F3A24]">Agent</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F0] px-3 py-1 text-[#2F3A24] ring-1 ring-[#B0BF93]/60">
            <input
              type="checkbox"
              checked={useStock}
              onChange={(e) => setUseStock(e.target.checked)}
              className="h-4 w-4 accent-[#536C4A]"
            />
            <span>Suggest from stock</span>
          </label>
          <span className="rounded-full bg-[#536C4A]/10 px-2 py-1 text-xs font-semibold text-[#536C4A]">beta</span>
        </div>
      </div>

      <p className="mb-4 text-[#2F3A24]/70">
        OG Lab Agent uses internal knowledge, network, product inventory, and cross‑checks trusted sources. Can assist with ordering or forward a message to senior staff.
      </p>

      <form onSubmit={ask} className="w-full">
        <div className="flex items-center gap-2 rounded-2xl border border-[#B0BF93]/60 bg-white/80 px-2 py-1 shadow-sm focus-within:border-[#536C4A] w-full overflow-hidden">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything: mood, format, potency, flavor…"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[#2F3A24] outline-none placeholder:text-[#2F3A24]/40"
          />
          <button
            type="button"
            aria-label="Voice input"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#2F3A24] ring-1 ring-[#B0BF93]/60 shadow-sm transition-colors hover:bg-[#F4F8F0]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10a7 7 0 0 1-14 0" />
              <path d="M12 19v4" />
            </svg>
          </button>
          <button
            type="submit"
            aria-label="Send"
            disabled={loading}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>

      {answer && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-[#F4F8F0] p-4 text-[#2F3A24] ring-1 ring-[#B0BF93]/50">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#536C4A]">Agent</div>
            <p className="mt-1">{answer}</p>
          </div>
          <div className="text-xs text-[#2F3A24]/60">Preview dialogue. In production, responses are grounded on company KB + live stock + sources; actions: reserve item, place order, escalate.</div>
        </div>
      )}
    </section>
  )
}


