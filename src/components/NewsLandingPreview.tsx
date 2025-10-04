'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedNews } from '@/lib/news-data';

const STREAM_GRADIENT = 'bg-[linear-gradient(180deg,rgba(253,236,168,0)_0%,rgba(226,165,63,0.65)_45%,rgba(184,109,28,0.95)_100%)]';

const buildStreamStyle = (active: boolean): CSSProperties | undefined =>
  active
    ? {
        animation: 'rosinStreamOnce 1.8s ease-in-out forwards',
        transformOrigin: 'top center',
      }
    : undefined;

const buildDropStyle = (active: boolean, delay: string): CSSProperties | undefined =>
  active
    ? {
        animation: 'rosinDropOnce 1.8s ease-in-out forwards',
        animationDelay: delay,
        animationFillMode: 'forwards',
      }
    : undefined;

export default function NewsLandingPreview() {
  const featured = getFeaturedNews();
  const [waterfall, setWaterfall] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const enableWaterfall = () => {
    setWaterfall(true);
    setAnimationKey(prev => prev + 1);
  };

  const disableWaterfall = () => {
    setWaterfall(false);
  };

  const wrapperOpacity = waterfall ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#B0BF93]/40 bg-gradient-to-br from-white/95 via-white to-[#F4F8F0] p-6 shadow-2xl">
      <div className="pointer-events-none absolute -inset-[2px] rounded-[28px] bg-[conic-gradient(from_0deg_at_50%_50%,#FFD166_0deg,#FF6B6B_120deg,#7CFFCB_240deg,#FFD166_360deg)] opacity-50 blur-xl animate-[newsNeonSweep_15s_linear_infinite]" />
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(255,247,189,0.35),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(124,255,203,0.25),transparent_55%)] animate-[newsNeonPulse_5s_ease-in-out_infinite]" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="space-y-4 md:flex-[0.45]">
          <span className="inline-flex items-center rounded-full bg-[#B0BF93]/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#2F3A24]">
            What&apos;s New
          </span>
          <h2 className="text-2xl font-bold text-[#2F3A24] md:text-3xl">OG Lab Stories: Uncensored Blog</h2>
          <p className="text-base text-[#2F3A24]/70">
            We&apos;re launching a news feed right on our website. Aftermovie videos, farm photo galleries, and educational cannabis articles — all in one place, without blocks or restrictions. Ganja, cannabis, Marihuana, weed - ha-ha-ha, we'll show you everything here!
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl bg-[#536C4A] p-6 text-white shadow-xl md:flex-[0.55]">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Latest Drop</p>
          <h3 className="text-xl font-bold">{featured.title}</h3>
          <div className="-mx-2 overflow-hidden rounded-2xl">
            <Image 
              src="/assets/bts/events.png" 
              alt="OG Lab Secret Garden Party" 
              width={400} 
              height={200} 
              className="h-48 md:h-56 w-full object-cover"
            />
          </div>
          <p className="text-sm text-white/80">{featured.excerpt}</p>
          <Link
            href="/feed"
            onMouseEnter={enableWaterfall}
            onMouseLeave={disableWaterfall}
            onFocus={enableWaterfall}
            onBlur={disableWaterfall}
            onTouchStart={enableWaterfall}
            className="group relative inline-flex items-center justify-center self-start overflow-visible rounded-full bg-gradient-to-br from-[#C8B568] via-[#8B9862] to-[#536C4A] px-6 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(83,108,74,0.42)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(83,108,74,0.55)] animate-[rosinHover_4s_ease-in-out_infinite]"
          >
            <span
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-white/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90 animate-[rosinGlow_3.6s_ease-in-out_infinite]"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-85"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,245,214,0.5) 0%, rgba(255,245,214,0) 55%), radial-gradient(circle at 70% 60%, rgba(255,136,0,0.35) 0%, rgba(255,136,0,0) 60%)',
              }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-35 mix-blend-plus-lighter transition-opacity duration-500 group-hover:opacity-60"
              style={{
                background:
                  'linear-gradient(140deg, rgba(255,90,0,0.25) 0%, rgba(255,90,0,0) 35%, rgba(143,0,34,0.4) 62%, rgba(102,0,0,0) 100%)',
              }}
              aria-hidden
            />
            <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/25 opacity-50" aria-hidden />
            <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] opacity-0 transition-opacity duration-300 group-hover:opacity-40" aria-hidden />

            <span
              key={`waterfall-${animationKey}`}
              className={`pointer-events-none absolute left-1/2 top-full z-0 -translate-x-1/2 -translate-y-[2px] flex w-full max-w-[90%] flex-col items-center gap-[4px] transition-opacity duration-300 ${wrapperOpacity}`}
              aria-hidden
            >
              <span
                className={`h-6 w-full origin-top rounded-b-[24px] ${STREAM_GRADIENT} blur-[0.45px]`}
                style={buildStreamStyle(waterfall)}
              />
              <span className="relative flex h-16 w-full items-start justify-center overflow-visible">
                <span className="pointer-events-none absolute left-1/2 top-0 flex w-full -translate-x-1/2 items-start justify-center gap-4" aria-hidden>
                  <span className="relative">
                    <span
                      className="block h-4.5 w-4.5 rounded-full bg-[#E2A53F]/92 blur-[0.65px] opacity-0"
                      style={buildDropStyle(waterfall, '0s')}
                    />
                  </span>
                  <span className="relative left-1">
                    <span
                      className="block h-3.5 w-3.5 rounded-full bg-[#E2A53F]/85 blur-[0.55px] opacity-0"
                      style={buildDropStyle(waterfall, '0.18s')}
                    />
                  </span>
                  <span className="relative left-4">
                    <span
                      className="block h-4 w-4 rounded-full bg-[#E2A53F]/80 blur-[0.5px] opacity-0"
                      style={buildDropStyle(waterfall, '0.35s')}
                    />
                  </span>
                </span>
              </span>
            </span>

            <span className="relative z-10 flex items-center gap-2 px-1 py-[1px] text-white drop-shadow-sm transition-all duration-300 group-hover:scale-105">
              <span>Open OG Lab</span>
              <span aria-hidden className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}


