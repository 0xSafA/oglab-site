import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OG Lab - Perfect Cannabis from Thailand",
  description: "OG Lab is the largest cannabis dispensary on Koh Samui with farm tours, scientific area, and premium products. Growing Farm and Dispensary with the best prices from producer.",
  keywords: "OG Lab, cannabis manufacturer Thailand, papirosa Andaman, cannabis cigarettes, cannabis clones, buy weed, canna shop, Sunset indica, Double Sativa, ganja classic blend, marihuana, buds wholesale Samui Thailand, шишки, бошки, трава, каннабис, марихуана, папиросы Андаман, ผู้ผลิตกัญชา, ซื้อกัญชาราคาส่ง",
  authors: [{ name: "OG Lab" }],
  creator: "OG Lab",
  publisher: "OG Lab",
  robots: "index, follow",
  openGraph: {
    title: "OG Lab - Perfect Cannabis from Thailand. Growing Farm and Dispensary",
    description: "Growing Farm and Dispensary. Explore our cannabis weed, Andaman cannabis papirosas, premium flowers and plant clones.",
    url: "https://oglab.com",
    siteName: "OG Lab",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Lab - Perfect Cannabis from Thailand",
    description: "Growing Farm and Dispensary with scientific area and premium cannabis products on Koh Samui.",
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