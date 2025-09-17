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
      el.style.width = '';
      el.style.margin = '0 auto';

      // Disable scaling on phones to avoid layout issues
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        return;
      }

      const avail = window.innerHeight - bottomSafePx;
      const total = el.scrollHeight;
      const scale = Math.max(minScale, Math.min(1, avail / total));

      if (scale < 1) {
        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = 'top center';
        // Compensate width shrink so it remains centered and fills horizontally
        el.style.width = `${100 / scale}%`;
      } else {
        el.style.transform = 'none';
        el.style.width = '';
      }
    };

    apply();
    const onResize = () => apply();
    window.addEventListener('resize', onResize);
    const id = window.setInterval(apply, 1000); // guard for TV browsers with delayed fonts/layout
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearInterval(id);
    };
  }, [targetId, minScale, bottomSafePx]);

  return null;
}


