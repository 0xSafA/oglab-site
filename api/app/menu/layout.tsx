// ───────────────────────────────────────────────────────────────
// File: app/menu/layout.tsx
// Top-level layout exclusively for the /menu route.
// Adds horizontal green lines, centers the content and sets the base font.
// ───────────────────────────────────────────────────────────────
import type { ReactNode } from 'react';

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-[Inter] text-[#222] flex flex-col items-center">
        {/* top rule */}
        <div className="w-full max-w-6xl h-[3px]" style={{ backgroundColor: '#b0bf93' }} />

        {children}

        {/* bottom rule */}
        <div className="w-full max-w-6xl h-[3px] mt-4" style={{ backgroundColor: '#b0bf93' }} />
      </body>
    </html>
  );
}
