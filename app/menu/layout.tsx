// app/menu/layout.tsx
import type { ReactNode } from 'react';

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex flex-col items-center bg-white font-[Inter] text-[#222]">
      {/* top rule */}
      <div
        className="w-full max-w-6xl h-[3px]"
        style={{ backgroundColor: '#b0bf93' }}
      />

      {children}

      {/* bottom rule */}
      <div
        className="w-full max-w-6xl h-[3px] mt-4"
        style={{ backgroundColor: '#b0bf93' }}
      />
    </section>
  );
}