import Image from 'next/image';
import Link from 'next/link';
import { NewsItem } from '@/lib/news-data';

const badgeColors: Record<NewsItem['type'], { bg: string; text: string }> = {
  video: { bg: 'bg-[#536C4A]', text: 'text-white' },
  article: { bg: 'bg-[#B0BF93]', text: 'text-[#2F3A24]' },
  gallery: { bg: 'bg-[#2F3A24]', text: 'text-white' },
};

type Props = {
  item: NewsItem;
  highlight?: boolean;
};

export function NewsCard({ item, highlight }: Props) {
  const badge = badgeColors[item.type];
  const statsLabel = getStatsLabel(item);

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-[#B0BF93]/40 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
        highlight
          ? 'bg-gradient-to-br from-white via-white to-[#F4F8F0] md:col-span-2 md:grid md:grid-cols-[2fr,3fr]'
          : 'bg-white'
      }`}
    >
      <div className="relative h-56 md:h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A]/10 via-transparent to-[#B0BF93]/10" />
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            className="object-cover opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#536C4A]/15 to-[#B0BF93]/25">
            <span className="text-sm font-semibold text-[#536C4A]/80 uppercase tracking-widest">
              {item.type.toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
            {getTypeLabel(item.type)}
          </span>
          {statsLabel && (
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[#536C4A]">
              {statsLabel}
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-4 p-6 ${highlight ? 'md:p-10' : ''}`}>
        <div className="flex items-center gap-3 text-sm text-[#536C4A]/80">
          <time dateTime={item.date} className="font-semibold uppercase tracking-wide">
            {formatDate(item.date)}
          </time>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {item.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-[#B0BF93]/30 px-3 py-1 text-xs font-semibold text-[#2F3A24]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className={`text-2xl font-bold text-[#2F3A24] ${highlight ? 'md:text-3xl' : ''}`}>
            {item.title}
          </h3>
          <p className="text-base text-[#2F3A24]/70">
            {item.excerpt}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <Link
            href={`/news/${item.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#536C4A] to-[#B0BF93] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Читать полностью
            <span aria-hidden>→</span>
          </Link>

          <span className="text-sm font-semibold uppercase tracking-wide text-[#536C4A]/70">
            OG Stories
          </span>
        </div>
      </div>
    </article>
  );
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

function getTypeLabel(type: NewsItem['type']) {
  switch (type) {
    case 'video':
      return 'Видео';
    case 'article':
      return 'Статья';
    case 'gallery':
      return 'Галерея';
    default:
      return 'Контент';
  }
}

function getStatsLabel(item: NewsItem) {
  if (item.type === 'video') return item.duration ? `⏱ ${item.duration}` : null;
  if (item.type === 'article') return item.readingTime ? `🕒 ${item.readingTime}` : null;
  if (item.type === 'gallery') return item.galleryCount ? `📸 ${item.galleryCount}` : null;
  return null;
}

