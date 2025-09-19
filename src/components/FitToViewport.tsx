'use client';

import { useEffect } from 'react';

type Props = {
  /** id of the container to scale */
  targetId: string;
  /** minimal allowed scale to avoid unreadable UI */
  minScale?: number;
  /** additional pixels to reserve at bottom (e.g., for TV overscan) */
  bottomSafePx?: number;
};

export default function FitToViewport({ targetId, minScale = 0.85, bottomSafePx = 0 }: Props) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const apply = () => {
      // Reset to natural to measure correctly
      el.style.transform = 'none';
      el.style.margin = '0 auto';

      // Disable scaling on phones to avoid layout issues
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return;
      }

      // Use visual viewport if available (mobile/tablets with OS UI)
      const vh = (window.visualViewport?.height ?? window.innerHeight);
      const avail = vh - bottomSafePx;
      const total = el.scrollHeight;
      const scale = Math.max(minScale, Math.min(1, avail / total));

      if (scale < 1) {
        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = 'top center';
      } else {
        el.style.transform = 'none';
      }
    };

    apply();
    const onResize = () => apply();
    window.addEventListener('resize', onResize);

    // React to content size changes without polling
    const ro = new ResizeObserver(() => apply());
    ro.observe(el);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [targetId, minScale, bottomSafePx]);

  return null;
}


