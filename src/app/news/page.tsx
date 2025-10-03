import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import VideoTile from '@/components/VideoTile';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getFeaturedNews, getRecentNews } from '@/lib/news-data';
import { NewsCard } from '@/components/NewsCard';

export const metadata = {
  title: 'OG Lab Stories — Cannabis News & Blog from Koh Samui',
  description:
    'OG Lab Stories: party aftermovies, cannabis education articles, farm photo galleries, and uncensored content from the best cannabis dispensary Samui.',
};

export default function NewsPage() {
  const featured = getFeaturedNews();
  const recent = getRecentNews();

  // Schema.org markup for Organization and ItemList
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'OG Lab Stories',
    description: 'Cannabis news, party aftermovies, and educational content from OG Lab – the best cannabis dispensary on Koh Samui.',
    url: 'https://oglab.com/news',
    publisher: {
      '@type': 'Organization',
      name: 'OG Lab',
      url: 'https://oglab.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://oglab.com/assets/images/oglab_logo.png',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: recent.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': item.type === 'video' ? 'VideoObject' : item.type === 'article' ? 'Article' : 'ImageGallery',
          name: item.title,
          description: item.excerpt,
          datePublished: item.date,
          ...(item.type === 'video' && { duration: item.duration }),
          ...(item.coverImage && { image: `https://oglab.com${item.coverImage}` }),
        },
      })),
    },
  };

  return (
    <>
      <Script
        id="news-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-6">
        <header className="relative overflow-hidden rounded-3xl bg-white/90 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_10%_10%,#ffffff_0%,#F7FBF3_40%,#EEF6E6_100%)]" />
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
            <div className="md:max-w-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src="/assets/images/oglab_logo.jpg"
                    alt="OG Lab visual"
                    width={640}
                    height={480}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                    priority
                  />
                </div>
                <div className="overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src="/globe.svg"
                    alt="Globe illustration"
                    width={320}
                    height={240}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src="/window.svg"
                    alt="Window illustration"
                    width={320}
                    height={240}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                  />
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#536C4A] p-4 text-white shadow-xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                  Всегда на связи
                </p>
                <p className="mt-2 text-white/80">
                  Instagram, Telegram, YouTube — свежие анонсы и aftermovie.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25"
                >
                  На главную
                </Link>
                <div className="mt-3 flex justify-end">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Video hero */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-3">
            <VideoTile
              url="https://youtu.be/xoU9RksCdX0?si=cc39IO6ZNCmT9arr"
              title="OG Lab — party aftermovie"
              duration="4:12"
              large
            />
          </div>
          <VideoTile
            url="https://youtu.be/CGT-Dnvyl9I?si=nHdbcPFr60CWA3nx"
            title="OG Lab — farm vibes"
          />
          <VideoTile
            url="https://youtu.be/Uxk00Y6UeMk?si=HVP9VoYNmKOZccty"
            title="OG Lab — lifestyle teaser"
          />
        </section>

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
    </>
  );
}


