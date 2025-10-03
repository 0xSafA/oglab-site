'use client'

import { useState } from 'react'

export default function AIStrainAssistantMock() {
  const [question, setQuestion] = useState('Подбери что‑нибудь расслабляющее для вечернего сериала')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // mock response
    setTimeout(() => {
      setAnswer(
        'Рекомендация: Sunset Indica (evening • chill • berry). Под настроение: расслабление и сон. Альтернатива: Double Sativa для креативного чила без перегруза.'
      )
      setLoading(false)
    }, 600)
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-[#B0BF93]/50">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#2F3A24]">AI Strain Assistant</h2>
        <span className="rounded-full bg-[#536C4A]/10 px-3 py-1 text-xs font-semibold text-[#536C4A]">beta</span>
      </div>
      <p className="mb-4 text-[#2F3A24]/70">
        Спроси про настроение, формат, формы (цветы/вейп/преролл) — ассистент подберёт из наличия и даст советы по терпенам.
      </p>
      <form onSubmit={ask} className="flex flex-col gap-3 md:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Например: что взять для прогулки днём без сонливости"
          className="flex-1 rounded-xl border border-[#B0BF93]/60 bg-white/80 px-4 py-3 text-[#2F3A24] shadow-sm outline-none placeholder:text-[#2F3A24]/40 focus:border-[#536C4A]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-[#536C4A] to-[#B0BF93] px-5 py-3 font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
        >
          {loading ? 'Подбираю…' : 'Спросить у ИИ'}
        </button>
      </form>
      {answer && (
        <div className="mt-4 rounded-2xl bg-[#F4F8F0] p-4 text-[#2F3A24]">
          <div className="text-sm font-semibold uppercase tracking-wide text-[#536C4A]">Предварительный ответ</div>
          <p className="mt-1">{answer}</p>
          <div className="mt-3 text-xs text-[#2F3A24]/60">В прод будет подключен live‑инвентарь и вкусовые профили.</div>
        </div>
      )}
    </section>
  )
}


