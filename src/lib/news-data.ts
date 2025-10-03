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
      'How we celebrated another OG Lab community gathering. Lights, neon, and vaporizers – welcome back to our secret garden.',
    type: 'video',
    date: '2024-09-18',
    tags: ['party', 'community', 'video'],
    duration: '4:12',
    coverImage: '/assets/images/plant-line.svg',
    featured: true,
  },
  {
    id: 'cbd-education',
    title: 'CBD vs THC: When and What to Choose',
    excerpt:
      'Explaining in simple terms how to pick the right strain for your mood. Sharing expertise from our cultivators.',
    type: 'article',
    date: '2024-09-10',
    tags: ['education', 'guide'],
    readingTime: '6 min',
    coverImage: '/assets/images/shake-hands-line.svg',
  },
  {
    id: 'harvest-tour',
    title: 'Fresh Harvest: OG Lab Greenhouse Tour',
    excerpt:
      'A photo walk through our new indica batch. Fluffy buds, resinous flowers, and that beloved scent – showing it all as it is.',
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
      'Showing our techniques for perfect vapor from Volcano, Pax, and Puffco. Temperature and freshness secrets.',
    type: 'article',
    date: '2024-08-15',
    tags: ['education', 'vaporizing'],
    readingTime: '8 min',
    coverImage: '/assets/images/compass-line.svg',
  },
];

export const getFeaturedNews = () => sampleNewsItems.find((item) => item.featured) ?? sampleNewsItems[0];

export const getRecentNews = (limit?: number) =>
  limit ? sampleNewsItems.slice(0, limit) : sampleNewsItems;

