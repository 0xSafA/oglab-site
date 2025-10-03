import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal config for stable debugging
  reactStrictMode: false,
  
  // Image configuration for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
    ],
  },
  
  // Оптимизация кэширования для ТВ и медленных устройств
  async headers() {
    return [
      {
        // Кэширование главной страницы меню
        source: '/menu',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=900, stale-while-revalidate=86400'
          }
        ]
      },
      {
        // Кэширование статических изображений
        source: '/assets/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        // Кэширование других статических ресурсов
        source: '/:path*\\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
