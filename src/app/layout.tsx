import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://oglab.com"),
  title: "OG Lab – Best Cannabis Dispensary and Farm on Koh Samui, Thailand",
  description: "OG Lab is the best cannabis dispensary Samui with farm tours, scientific area, and premium cannabis products. Largest dispensary on Koh Samui with the best prices directly from our farm.",
  keywords: "cannabis dispensary Samui, cannabis dispensary Koh Samui, best cannabis Samui, OG Lab, cannabis farm Samui, weed dispensary Samui, cannabis shop Thailand, buy weed Samui, cannabis manufacturer Thailand, papirosa Andaman, cannabis cigarettes, cannabis clones, canna shop, Sunset indica, Double Sativa, ganja classic blend, marihuana, buds wholesale Samui Thailand, шишки, бошки, трава, каннабис, марихуана, папиросы Андаман, ผู้ผลิตกัญชา, ซื้อกัญชาราคาส่ง",
  authors: [{ name: "OG Lab" }],
  creator: "OG Lab",
  publisher: "OG Lab",
  robots: "index, follow",
  openGraph: {
    title: "OG Lab – Best Cannabis Dispensary and Farm on Koh Samui",
    description: "Premium cannabis dispensary Samui with farm tours and scientific area. Explore our cannabis flowers, Andaman papirosas, and plant clones – directly from our farm.",
    url: "https://oglab.com",
    siteName: "OG Lab",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/assets/images/oglab_logo.png",
        width: 1200,
        height: 630,
        alt: "OG Lab – Best Cannabis Dispensary Samui",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Lab – Best Cannabis Dispensary Samui",
    description: "Premium cannabis dispensary on Koh Samui with farm tours, scientific area, and the best prices from producer.",
    images: [
      "/assets/images/oglab_logo.png",
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload критических ресурсов для быстрой загрузки на ТВ */}
        <link rel="preload" href="/assets/images/oglab_logo_round.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/oglab_logo.png" as="image" />
        <link rel="preload" href="/assets/images/plant-line.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/hand-coin-line.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/building-3-line.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/shake-hands-line.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/compass-line.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/assets/images/map-pin-2.svg" as="image" type="image/svg+xml" />
        
        {/* DNS prefetch для внешних ресурсов */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SF3PJN87G9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SF3PJN87G9');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}