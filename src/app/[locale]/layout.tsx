import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Noto_Sans_Thai, Rubik } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const inter = Inter({ 
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai", "latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-thai',
  display: 'swap',
});

const rubik = Rubik({ 
  subsets: ["hebrew", "latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
  display: 'swap',
});

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ru' },
    { locale: 'th' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'he' },
    { locale: 'it' }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const titles = {
    en: "OG Lab – Best Cannabis Dispensary and Farm on Koh Samui, Thailand",
    ru: "OG Lab – Лучшая Диспенсария и Ферма Каннабиса на Самуи, Таиланд",
    th: "OG Lab – ดิสเพนซารีและฟาร์มกัญชาที่ดีที่สุดในเกาะสมุย ประเทศไทย",
    fr: "OG Lab – Meilleur Dispensaire et Ferme Cannabis à Koh Samui, Thaïlande",
  };
  
  const descriptions = {
    en: "OG Lab is the best cannabis dispensary Samui with farm tours, scientific area, and premium cannabis products. Largest dispensary on Koh Samui with the best prices directly from our farm.",
    ru: "OG Lab - лучшая диспенсария каннабиса на Самуи с турами на ферму, научной зоной и премиум продуктами. Крупнейшая диспенсария на Самуи с лучшими ценами прямо с фермы.",
    th: "OG Lab เป็นดิสเพนซารีกัญชาที่ดีที่สุดในสมุยพร้อมทัวร์ฟาร์ม พื้นที่วิทยาศาสตร์ และผลิตภัณฑ์กัญชาพรีเมียม",
    fr: "OG Lab est le meilleur dispensaire cannabis de Samui avec visites de la ferme, labo scientifique et produits premium. Le plus grand dispensaire de Koh Samui avec les meilleurs prix direct producteur.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      languages: {
        'en': '/en',
        'ru': '/ru',
        'th': '/th',
        'fr': '/fr',
        'de': '/de',
        'he': '/he',
        'it': '/it',
        'x-default': '/en',
      },
    },
  };
}

// Viewport configuration для предотвращения автозума на iOS
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  userScalable: true, // оставляем возможность зума для доступности
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  const validLocales = ['en', 'ru', 'th', 'fr', 'de', 'he', 'it'];
  if (!validLocales.includes(locale)) {
    notFound();
  }
  
  // Get messages for this locale explicitly
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <head>
        {/* Preload только критических ресурсов для главной страницы */}
        <link rel="preload" href="/assets/images/oglab_logo_round.svg" as="image" type="image/svg+xml" />
        
        {/* DNS prefetch для внешних ресурсов */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google.com" />
      </head>
      <body className={`${inter.variable} ${notoSansThai.variable} ${rubik.variable} ${locale === 'th' ? 'font-thai' : locale === 'he' ? 'font-hebrew' : 'font-sans'}`}>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

