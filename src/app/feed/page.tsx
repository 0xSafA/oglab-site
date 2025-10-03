'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useState } from 'react';
import VideoTile from '@/components/VideoTile';
import OGLabAgent from '@/components/OGLabAgent';
import AggregatedNewsMock from '@/components/AggregatedNewsMock';
import SubscribeRSS from '@/components/SubscribeRSS';
import { getRecentNews } from '@/lib/news-data';
import { NewsCard } from '@/components/NewsCard';

export default function NewsPage() {
  const recent = getRecentNews();
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllArticles, setShowAllArticles] = useState(false);
  
  const videos = [
    { url: 'https://youtu.be/CGT-Dnvyl9I?si=nHdbcPFr60CWA3nx', title: 'OG Lab — farm vibes' },
    { url: 'https://youtu.be/Uxk00Y6UeMk?si=HVP9VoYNmKOZccty', title: 'OG Lab — lifestyle teaser' },
    { url: 'https://youtu.be/KAATrEtpai4?si=njD1boS47BC9M_Lf', title: 'OG Lab — party highlights' },
    { url: 'https://youtu.be/jSbWDBR4SHQ?si=09SJy2864rMl9L72', title: 'OG Lab — chill session teaser' },
    { url: 'https://youtu.be/ERj25Bqet94?si=ZSOTR7AOoYS55X0j', title: 'OG Lab — behind the scenes flash' },
  ];
  
  const visibleVideos = showAllVideos ? videos : videos.slice(0, 3);
  const visibleArticles = showAllArticles ? recent : recent.slice(0, 3);

  // Schema.org markup for Organization and ItemList
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'OG Lab Stories',
    description: 'Cannabis news, party aftermovies, and educational content from OG Lab – the best cannabis dispensary on Koh Samui.',
    url: 'https://oglab.com/feed',
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
                {/* Large YouTube thumbnail */}
                <a href="https://youtu.be/xoU9RksCdX0?si=cc39IO6ZNCmT9arr" target="_blank" rel="noreferrer" className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src={`https://i.ytimg.com/vi/xoU9RksCdX0/maxresdefault.jpg`}
                    alt="OG Lab aftermovie"
                    width={640}
                    height={480}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                    priority
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#000]/40 via-transparent to-[#000]/10" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#2F3A24] shadow-xl">▶</span>
                  </div>
                </a>
                {/* Small thumbnails */}
                <a href="https://youtu.be/CGT-Dnvyl9I?si=nHdbcPFr60CWA3nx" target="_blank" rel="noreferrer" className="relative overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src={`https://i.ytimg.com/vi/CGT-Dnvyl9I/hqdefault.jpg`}
                    alt="Farm vibes"
                    width={320}
                    height={240}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#000]/30 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2F3A24] shadow">▶</span>
                  </div>
                </a>
                <a href="https://youtu.be/Uxk00Y6UeMk?si=HVP9VoYNmKOZccty" target="_blank" rel="noreferrer" className="relative overflow-hidden rounded-2xl ring-1 ring-[#536C4A]/10">
                  <Image
                    src={`https://i.ytimg.com/vi/Uxk00Y6UeMk/hqdefault.jpg`}
                    alt="Lifestyle teaser"
                    width={320}
                    height={240}
                    className="h-full w-full object-cover bg-[#F4F8F0]"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000]/25 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2F3A24] shadow">▶</span>
                  </div>
                </a>
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
              </div>
            </div>
          </div>
        </header>

        {/* Videos section */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVideos.map((video, index) => (
              <VideoTile key={index} url={video.url} title={video.title} />
            ))}
          </div>
          
          {videos.length > 3 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#536C4A] to-[#B0BF93] px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {showAllVideos ? 'Скрыть видео' : `Показать ещё видео (${videos.length - 3})`}
                <span className="text-lg">{showAllVideos ? '↑' : '↓'}</span>
              </button>
            </div>
          )}
        </section>

        {/* Articles and galleries section */}
        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleArticles.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
          
          {recent.length > 3 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAllArticles(!showAllArticles)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#536C4A] to-[#B0BF93] px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {showAllArticles ? 'Скрыть статьи' : `Показать ещё статьи (${recent.length - 3})`}
                <span className="text-lg">{showAllArticles ? '↑' : '↓'}</span>
              </button>
            </div>
          )}
        </section>

        {/* OG Lab Agent */}
        <OGLabAgent />

        {/* Aggregated news + Subscribe side-by-side on desktop */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <AggregatedNewsMock />
          </div>
          <div className="md:col-span-1">
            <SubscribeRSS />
          </div>
        </div>

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


