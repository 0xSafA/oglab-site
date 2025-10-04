import Link from 'next/link';
import { getFeaturedNews, getRecentNews } from '@/lib/news-data';
import { NewsCard } from '@/components/NewsCard';

export const metadata = {
  title: 'OG Lab Stories — Новости и блог',
  description:
    'Свежие новости OG Lab: репортажи с вечеринок, образовательные статьи о каннабисе, фото- и видео-контент прямо с фермы.',
};

export default function NewsPage() {
  const featured = getFeaturedNews();
  const recent = getRecentNews();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-6">
        <header className="relative overflow-hidden rounded-3xl bg-white/90 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#F4F8F0] opacity-90" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center rounded-full bg-[#536C4A]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#536C4A]">
                OG Lab Stories
              </span>
              <h1 className="text-3xl font-bold text-[#2F3A24] md:text-4xl">
                Новости, вечеринги и культура OG Lab
              </h1>
              <p className="text-lg text-[#2F3A24]/70">
                Здесь мы публикуем всё, что не пропускают соцсети: новые сорта, backstage с фермы, обзоры девайсов и честные разговоры о каннабисе.
              </p>
            </div>
            <div className="rounded-3xl bg-[#536C4A] p-6 text-white shadow-xl md:max-w-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Всегда на связи
              </p>
              <h2 className="mt-2 text-2xl font-bold">Подписывайтесь в соцсетях</h2>
              <p className="mt-3 text-white/80">
                Мы остаёмся в Instagram, Telegram и на YouTube — следите за обновлениями и дайте знать друзьям.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25"
              >
                Вернуться на главный экран
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NewsCard item={featured} highlight />
          {recent
            .filter((item) => item.id !== featured.id)
            .map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
        </section>

        <section className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-inner">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-[#2F3A24]">О чём будем рассказывать</h2>
              <p className="text-[#2F3A24]/70">
                OG Lab Stories — не очередной копипаст из Instagram. Мы делимся знаниями, показываем настоящую ферму и говорим о каннабисе без цензуры.
              </p>
            </div>
            <ul className="space-y-2 text-sm font-semibold text-[#536C4A]">
              <li>• Эксклюзивные афтемуви вечеринок OG Lab</li>
              <li>• Гайды по испарителям и культуре употребления</li>
              <li>• Закулисье теплицы и новые генетики</li>
              <li>• Образовательные материалы для новичков и гурманов</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}


