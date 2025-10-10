export type NewsItemType = 'video' | 'article' | 'gallery';

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  type: NewsItemType;
  date: string;
  tags: string[];
  coverImage?: string;
  duration?: string; // для видео
  readingTime?: string; // для статей
  galleryCount?: number; // для галерей
  featured?: boolean;
};

export const sampleNewsItems: NewsItem[] = [
  {
    id: 'first-party-recap',
    title: 'Aftermovie OG Lab Secret Garden Party',
    excerpt:
      'How we celebrated our OG Lab community gathering. Lights, neon, and vaporizers – welcome back to our secret garden.',
    type: 'video',
    date: '2024-09-18',
    tags: ['party', 'community', 'video'],
    duration: '4:12',
    coverImage: '/assets/bts/aftermovie.jpg',
    featured: true,
  },
  {
    id: 'cbd-education',
    title: 'CBD vs THC: When and What to Choose',
    excerpt:
      'Beginner-friendly guide to cannabinoids: how CBD relaxes without the high, and when THC is your best friend.',
    type: 'article',
    date: '2024-09-10',
    tags: ['education', 'guide'],
    readingTime: '6 min',
    coverImage: '/assets/bts/packaging.png',
  },
  {
    id: 'harvest-tour',
    title: 'Fresh Harvest: OG Lab Greenhouse Tour',
    excerpt:
      '18 photos from our indica harvest: trichomes, colors, and the real look of premium flowers.',
    type: 'gallery',
    date: '2024-08-27',
    tags: ['farm', 'behind the scenes'],
    galleryCount: 18,
    coverImage: '/assets/images/building-3-line.svg',
  },
  {
    id: 'vaporizer-masterclass',
    title: 'Vape Workshop: Making Terps Tastier',
    excerpt:
      'Temperature settings, grind consistency, and device care tips for Volcano, Pax, and Puffco lovers.',
    type: 'article',
    date: '2024-08-15',
    tags: ['education', 'vaporizing'],
    readingTime: '8 min',
    coverImage: '/assets/bts/testing.png',
  },
  {
    id: 'video-kaatrEtpai4',
    title: 'OG Lab — party highlights',
    excerpt:
      'Short clip from OG Lab party: lights, music, and vibes from our community.',
    type: 'video',
    date: '2025-10-03',
    tags: ['party', 'video', 'youtube'],
    coverImage: 'https://i.ytimg.com/vi/KAATrEtpai4/maxresdefault.jpg',
  },
  {
    id: 'video-jSbWDBR4SHQ',
    title: 'OG Lab — chill session teaser',
    excerpt:
      'Relaxed moments at OG Lab captured in a short teaser. Good people, good flowers.',
    type: 'video',
    date: '2025-10-03',
    tags: ['teaser', 'video', 'youtube'],
    coverImage: 'https://i.ytimg.com/vi/jSbWDBR4SHQ/maxresdefault.jpg',
  },
  {
    id: 'video-ERj25Bqet94',
    title: 'OG Lab — behind the scenes flash',
    excerpt:
      'A quick behind-the-scenes flash from our greenhouse and hangouts.',
    type: 'video',
    date: '2025-10-03',
    tags: ['bts', 'video', 'youtube'],
    coverImage: 'https://i.ytimg.com/vi/ERj25Bqet94/maxresdefault.jpg',
  },
];

export const getFeaturedNews = () => sampleNewsItems.find((item) => item.featured) ?? sampleNewsItems[0];

export const getRecentNews = (limit?: number) =>
  limit ? sampleNewsItems.slice(0, limit) : sampleNewsItems;

