import Script from 'next/script';
import { getTranslations } from 'next-intl/server';
import {Link} from '@/navigation';
import NewsLandingPreviewWrapper from '@/components/NewsLandingPreviewWrapper';
import OGLabAgent from '@/components/OGLabAgent';
import BehindTheScenes from '@/components/BehindTheScenes';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DynamicOfferBanner from '@/components/DynamicOfferBanner';
import DynamicEventText from '@/components/DynamicEventText';
import LazyGoogleMap from '@/components/LazyGoogleMap';
import { getThemeConfig } from '@/lib/theme-config';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  // Get theme from environment variables - no database calls!
  const theme = getThemeConfig();
  
  const primaryColor = theme.primary_color;
  const secondaryColor = theme.secondary_color;

  // Schema.org LocalBusiness structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://oglab.com',
    name: 'OG Lab',
    description: 'The best cannabis dispensary and farm on Koh Samui with farm tours, scientific area, and premium cannabis products.',
    url: 'https://oglab.com',
    telephone: '+66982040757',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Koh Samui',
      addressRegion: 'Surat Thani',
      addressCountry: 'TH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.5356,
      longitude: 100.0629,
    },
    image: 'https://oglab.com/assets/images/oglab_logo.png',
    logo: 'https://oglab.com/assets/images/oglab_logo.png',
    priceRange: '฿฿',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/OGLabcom',
      'https://www.instagram.com/oglab.co',
      'https://www.youtube.com/@oglabco',
      'https://t.me/oglab_co',
      'https://www.tripadvisor.com/Attraction_Review-g293918-d32974728-Reviews-OG_Lab_Cannabis_Farm_Dispensary_Samui-Ko_Samui_Surat_Thani_Province.html',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '50',
    },
  };

  return (
    <>
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    <div 
      className="min-h-screen bg-gradient-to-br flex items-start justify-center pt-7 pb-5 md:pt-6 md:pb-5 px-4 overflow-x-hidden"
      style={{ 
        background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` 
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A] via-[#B0BF93] to-[#536C4A]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,191,147,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(83,108,74,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_60%,rgba(176,191,147,0.2)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#FFFEF9] via-[#FFFCF0] to-[#FFF9E6] rounded-3xl shadow-xl border-2 border-[#B0BF93]/35 p-8 animate-fade-in-up">
          
          {/* Social Icons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <a
              href="https://www.instagram.com/oglab.co/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#536C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://t.me/Oglabco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#536C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="m22 2-7 20-4-9-9-4z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=+66982040757"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#536C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z"/>
                <path d="M9 10a3 3 0 0 0 6 0c0-1-1-1-1-1s-1 0-1 1a1 1 0 0 1-2 0c0-1-1-1-1-1s-1 0-1 1z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/OGLabcom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#536C4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href="https://www.tripadvisor.com/Attraction_Review-g293918-d32974728-Reviews-OG_Lab_Cannabis_Farm_Dispensary_Samui-Ko_Samui_Surat_Thani_Province.html"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TripAdvisor"
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg viewBox="0 -96 512.2 512.2" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fill="#536C4A" d="M128.2 127.9C92.7 127.9 64 156.6 64 192c0 35.4 28.7 64.1 64.1 64.1 35.4 0 64.1-28.7 64.1-64.1.1-35.4-28.6-64.1-64-64.1zm0 110c-25.3 0-45.9-20.5-45.9-45.9s20.5-45.9 45.9-45.9S174 166.7 174 192s-20.5 45.9-45.8 45.9z"/>
                <circle fill="#536C4A" cx="128.4" cy="191.9" r="31.9"/>
                <path fill="#536C4A" d="M384.2 127.9c-35.4 0-64.1 28.7-64.1 64.1 0 35.4 28.7 64.1 64.1 64.1 35.4 0 64.1-28.7 64.1-64.1 0-35.4-28.7-64.1-64.1-64.1zm0 110c-25.3 0-45.9-20.5-45.9-45.9s20.5-45.9 45.9-45.9S430 166.7 430 192s-20.5 45.9-45.8 45.9z"/>
                <circle fill="#536C4A" cx="384.4" cy="191.9" r="31.9"/>
                <path fill="#536C4A" d="M474.4 101.2l37.7-37.4h-76.4C392.9 29 321.8 0 255.9 0c-66 0-136.5 29-179.3 63.8H0l37.7 37.4C14.4 124.4 0 156.5 0 192c0 70.8 57.4 128.2 128.2 128.2 32.5 0 62.2-12.1 84.8-32.1l43.4 31.9 42.9-31.2-.5-1.2c22.7 20.2 52.5 32.5 85.3 32.5 70.8 0 128.2-57.4 128.2-128.2-.1-35.4-14.6-67.5-37.9-90.7zM368 64.8c-60.7 7.6-108.3 57.6-111.9 119.5-3.7-62-51.4-112.1-112.3-119.5 30.6-22 69.6-32.8 112.1-32.8S337.4 42.8 368 64.8zM128.2 288.2C75 288.2 32 245.1 32 192s43.1-96.2 96.2-96.2 96.2 43.1 96.2 96.2c-.1 53.1-43.1 96.2-96.2 96.2zm256 0c-53.1 0-96.2-43.1-96.2-96.2s43.1-96.2 96.2-96.2 96.2 43.1 96.2 96.2c-.1 53.1-43.1 96.2-96.2 96.2z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@oglabco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-transform hover:scale-125"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full"
              >
                <g fill="none" stroke="#536C4A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.1 24.1 0 0 1 0-10a2 2 0 0 1 1.4-1.4a49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10a2 2 0 0 1-1.4 1.4a49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15l5-3l-5-3z" />
                </g>
              </svg>
            </a>
          </div>

          {/* Contact Info with Language Switcher */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap items-center">
            <ContactLink href="tel:+66982040757" text={t('phone')} primaryColor={primaryColor} />
            <ContactLink href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text={t('googleMap')} primaryColor={primaryColor} />
            <LanguageSwitcher />
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <a href="/auth/login" aria-label="Login" className="inline-block">
                <svg 
                  width="120" 
                  height="120" 
                  viewBox="0 0 164 164" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-full shadow-lg animate-pulse-slow cursor-pointer hover:scale-105 transition-transform"
                >
                  <g transform="matrix(-1,0,0,1,499.122,-75.1627)">
                    <ellipse cx="417.585" cy="156.699" rx="76.03" ry="76.03" style={{fill: 'rgb(83,108,74)', stroke: 'black', strokeWidth: '0.48px'}}/>
                  </g>
                  <g transform="matrix(1,0,0,1,-336.049,-105.801)">
                    <path d="M476.87,154.902L431.229,154.902C430.413,154.902 429.649,154.967 428.936,155.085C428.163,155.212 427.444,155.402 426.775,155.635C426.145,155.856 425.558,156.139 425.016,156.482C424.478,156.823 423.989,157.223 423.551,157.68L423.536,157.694C423.075,158.137 422.674,158.625 422.335,159.157C421.995,159.691 421.714,160.275 421.492,160.909C421.267,161.55 421.093,162.244 420.971,162.986C420.847,163.735 420.776,164.532 420.756,165.372L420.758,178.546C420.776,179.407 420.847,180.214 420.97,180.97C421.093,181.721 421.267,182.417 421.492,183.059C421.712,183.689 421.999,184.269 422.344,184.806C422.689,185.343 423.093,185.837 423.545,186.292C424.461,187.215 425.564,187.934 426.861,188.417C428.123,188.886 429.576,189.135 431.229,189.135L476.87,189.135L476.87,168.84L463.068,168.84L456.771,175.137L470.397,175.137L470.397,182.838L431.993,182.838C431.62,182.838 431.261,182.811 430.919,182.756C430.572,182.701 430.252,182.619 429.959,182.511C429.661,182.401 429.386,182.267 429.135,182.111C428.878,181.951 428.648,181.769 428.445,181.566C428.035,181.156 427.728,180.652 427.525,180.054C427.329,179.478 427.231,178.818 427.231,178.076L427.231,166.019C427.231,165.259 427.333,164.589 427.53,164.005C427.734,163.402 428.04,162.895 428.438,162.479C428.846,162.054 429.35,161.73 429.957,161.514C430.542,161.306 431.219,161.198 431.993,161.198L470.574,161.198L476.87,154.902Z" style={{fill: 'white', fillRule: 'nonzero'}}/>
                  </g>
                  <g transform="matrix(1,0,0,1,-336.049,-105.801)">
                    <path d="M369.477,161.198L407.199,161.198C407.941,161.198 408.601,161.296 409.177,161.492C409.772,161.694 410.276,162.001 410.687,162.412L410.689,162.414C411.099,162.824 411.405,163.334 411.608,163.942C411.804,164.528 411.902,165.201 411.902,165.961L411.902,178.076C411.902,178.818 411.804,179.478 411.609,180.054C411.407,180.649 411.099,181.154 410.688,181.565C410.488,181.767 410.261,181.948 410.007,182.109C409.76,182.265 409.491,182.398 409.198,182.509C408.907,182.618 408.591,182.701 408.253,182.756C407.917,182.81 407.565,182.838 407.199,182.838L369.477,182.838C369.111,182.838 368.759,182.81 368.423,182.756C368.085,182.701 367.769,182.618 367.479,182.509C367.186,182.398 366.916,182.265 366.669,182.109C366.415,181.948 366.188,181.767 365.988,181.565C365.577,181.154 365.27,180.649 365.068,180.054C364.872,179.478 364.774,178.818 364.774,178.076L364.774,165.961C364.774,165.201 364.872,164.528 365.068,163.942C365.271,163.334 365.577,162.824 365.987,162.414L365.989,162.412C366.4,162.001 366.904,161.694 367.5,161.492C368.076,161.296 368.735,161.198 369.477,161.198ZM368.771,189.135L407.905,189.135C409.554,189.135 411.003,188.885 412.262,188.417C413.56,187.934 414.665,187.214 415.589,186.29C416.502,185.377 417.197,184.289 417.662,183.017L417.662,183.015C418.134,181.725 418.376,180.239 418.376,178.546L418.376,165.372C418.376,163.699 418.136,162.226 417.665,160.946C417.199,159.678 416.505,158.595 415.591,157.688C415.136,157.235 414.645,156.832 414.11,156.487C413.575,156.142 412.997,155.856 412.368,155.635C411.701,155.402 410.979,155.213 410.205,155.085C409.488,154.967 408.722,154.902 407.905,154.902L368.771,154.902C367.955,154.902 367.188,154.967 366.471,155.085C365.697,155.213 364.976,155.402 364.308,155.635C363.679,155.856 363.101,156.142 362.567,156.487C362.031,156.832 361.54,157.235 361.085,157.688C360.172,158.595 359.478,159.678 359.012,160.946C358.541,162.226 358.301,163.699 358.301,165.372L358.301,178.546C358.301,180.239 358.542,181.725 359.014,183.015L359.014,183.017C359.48,184.289 360.175,185.377 361.087,186.29C362.011,187.214 363.117,187.934 364.414,188.417C365.673,188.885 367.122,189.135 368.771,189.135Z" style={{fill: 'white', fillRule: 'nonzero'}}/>
                  </g>
                  <g transform="matrix(1,0,0,1,-336.049,-106.433)">
                    <path d="M374.93,165.899L374.93,175.376C374.93,175.977 375.047,176.406 375.281,176.663C375.539,176.897 375.968,177.014 376.568,177.014L381.108,177.014L381.108,179.939L376.358,179.939C375.554,179.939 374.876,179.853 374.318,179.686C373.76,179.518 373.308,179.261 372.965,178.91C372.614,178.566 372.356,178.11 372.188,177.545C372.021,176.979 371.935,176.304 371.935,175.516L371.935,165.899L374.93,165.899ZM387.051,175.844C386.56,175.844 386.193,175.938 385.951,176.125C385.702,176.312 385.577,176.589 385.577,176.956L385.577,177.014L389.918,177.014L389.918,175.844L387.051,175.844ZM389.918,172.919C389.918,172.74 389.886,172.568 389.824,172.408C389.762,172.248 389.668,172.124 389.543,172.03C389.294,171.843 388.927,171.749 388.443,171.749L382.57,171.749L385.495,168.824L389.274,168.824L389.274,168.836C390.421,168.898 391.294,169.175 391.895,169.667C392.573,170.228 392.913,171.067 392.913,172.182L392.913,179.939L389.918,179.939L389.918,177.88L387.859,179.939L382.57,179.939L382.57,176.254C382.57,174.031 383.924,172.919 386.63,172.919L389.918,172.919ZM400.26,177.014C400.744,177.014 401.115,176.921 401.372,176.733C401.606,176.554 401.73,176.277 401.746,175.903L401.746,172.861C401.73,172.486 401.606,172.209 401.372,172.03C401.115,171.843 400.74,171.749 400.256,171.749L398.849,171.749C398.357,171.749 397.987,171.843 397.745,172.03C397.495,172.209 397.371,172.486 397.371,172.861L397.378,179.073L399.438,177.014L400.26,177.014ZM394.376,164.729L397.371,164.729L397.371,170.883L399.438,168.824L400.67,168.824C403.384,168.824 404.741,169.936 404.741,172.159L404.741,176.581C404.741,177.697 404.402,178.535 403.72,179.097C403.041,179.658 402.023,179.939 400.674,179.939L394.376,179.939L394.376,164.729Z" style={{fill: 'rgb(176,191,147)', fillRule: 'nonzero'}}/>
                  </g>
                  <g transform="matrix(-1,0,0,1,418.089,-15.3557)">
                    <rect x="376.344" y="112.036" width="1.449" height="29.519" style={{fill: 'white'}}/>
                  </g>
                  <g transform="matrix(1,0,0,1,-336.049,-15.898)">
                    <path d="M388.806,112.701C390.257,112.701 391.398,113.048 392.23,113.741C393.062,114.435 393.478,115.389 393.478,116.605C393.478,117.821 393.062,118.776 392.23,119.469C391.398,120.162 390.257,120.509 388.806,120.509L386.038,120.509L386.038,123.901L384.439,123.901L384.439,112.701L388.806,112.701ZM388.758,119.117C389.771,119.117 390.545,118.901 391.078,118.469C391.611,118.037 391.878,117.416 391.878,116.605C391.878,115.795 391.611,115.173 391.078,114.741C390.545,114.309 389.771,114.093 388.758,114.093L386.038,114.093L386.038,119.117L388.758,119.117ZM403.346,119.709C403.346,119.826 403.335,119.981 403.314,120.173L396.435,120.173C396.53,120.92 396.858,121.519 397.418,121.973C397.978,122.426 398.674,122.653 399.506,122.653C400.52,122.653 401.335,122.311 401.954,121.629L402.802,122.621C402.418,123.069 401.941,123.41 401.37,123.645C400.799,123.88 400.162,123.997 399.458,123.997C398.562,123.997 397.768,123.813 397.074,123.445C396.381,123.077 395.845,122.562 395.466,121.901C395.088,121.24 394.898,120.493 394.898,119.661C394.898,118.84 395.082,118.099 395.45,117.437C395.818,116.776 396.325,116.261 396.97,115.893C397.616,115.525 398.344,115.341 399.154,115.341C399.965,115.341 400.688,115.525 401.322,115.893C401.957,116.261 402.453,116.776 402.81,117.437C403.167,118.099 403.346,118.856 403.346,119.709ZM399.154,116.637C398.418,116.637 397.802,116.861 397.306,117.309C396.81,117.757 396.52,118.344 396.435,119.069L401.874,119.069C401.789,118.355 401.498,117.77 401.002,117.317C400.506,116.864 399.89,116.637 399.154,116.637ZM407.054,116.845C407.321,116.354 407.716,115.981 408.238,115.725C408.761,115.469 409.396,115.341 410.142,115.341L410.142,116.829C410.057,116.818 409.94,116.813 409.79,116.813C408.958,116.813 408.305,117.061 407.83,117.557C407.356,118.053 407.118,118.76 407.118,119.677L407.118,123.901L405.583,123.901L405.583,115.421L407.054,115.421L407.054,116.845ZM415.355,113.197C414.437,113.197 413.979,113.694 413.979,114.685L413.979,115.421L416.443,115.421L416.443,116.685L414.011,116.685L414.011,123.901L412.475,123.901L412.475,116.685L411.035,116.685L411.035,115.421L412.475,115.421L412.475,114.669C412.475,113.827 412.72,113.16 413.211,112.669C413.701,112.179 414.389,111.933 415.275,111.933C415.616,111.933 415.936,111.976 416.235,112.062C416.533,112.147 416.789,112.27 417.003,112.43L416.538,113.597C416.186,113.331 415.792,113.197 415.355,113.197ZM425.543,119.709C425.543,119.826 425.532,119.981 425.511,120.173L418.631,120.173C418.727,120.92 419.055,121.519 419.615,121.973C420.175,122.426 420.871,122.653 421.703,122.653C422.716,122.653 423.532,122.311 424.151,121.629L424.999,122.621C424.615,123.069 424.138,123.41 423.567,123.645C422.996,123.88 422.359,123.997 421.655,123.997C420.759,123.997 419.964,123.813 419.271,123.445C418.578,123.077 418.042,122.562 417.663,121.901C417.285,121.24 417.095,120.493 417.095,119.661C417.095,118.84 417.279,118.099 417.647,117.437C418.015,116.776 418.522,116.261 419.167,115.893C419.812,115.525 420.54,115.341 421.351,115.341C422.162,115.341 422.884,115.525 423.519,115.893C424.153,116.261 424.65,116.776 425.007,117.437C425.364,118.099 425.543,118.856 425.543,119.709ZM421.351,116.637C420.615,116.637 419.999,116.861 419.503,117.309C419.007,117.757 418.717,118.344 418.631,119.069L424.071,119.069C423.985,118.355 423.695,117.77 423.199,117.317C422.703,116.864 422.087,116.637 421.351,116.637ZM431.475,123.997C430.611,123.997 429.84,123.81 429.163,123.437C428.486,123.063 427.955,122.549 427.571,121.893C427.187,121.237 426.995,120.493 426.995,119.661C426.995,118.829 427.187,118.085 427.571,117.429C427.955,116.773 428.486,116.261 429.163,115.893C429.84,115.525 430.611,115.341 431.475,115.341C432.243,115.341 432.928,115.496 433.531,115.805C434.133,116.115 434.6,116.562 434.931,117.149L433.763,117.901C433.496,117.496 433.166,117.192 432.771,116.989C432.376,116.787 431.939,116.685 431.459,116.685C430.904,116.685 430.406,116.808 429.963,117.053C429.52,117.299 429.174,117.648 428.923,118.101C428.672,118.554 428.547,119.075 428.547,119.661C428.547,120.258 428.672,120.783 428.923,121.237C429.174,121.69 429.52,122.04 429.963,122.285C430.406,122.53 430.904,122.653 431.459,122.653C431.939,122.653 432.376,122.551 432.771,122.349C433.166,122.146 433.496,121.842 433.763,121.437L434.931,122.173C434.6,122.76 434.133,123.21 433.531,123.525C432.928,123.84 432.243,123.997 431.475,123.997ZM441.903,123.405C441.679,123.597 441.402,123.743 441.071,123.845C440.74,123.946 440.399,123.997 440.047,123.997C439.194,123.997 438.532,123.767 438.063,123.309C437.594,122.85 437.359,122.194 437.359,121.341L437.359,116.685L435.919,116.685L435.919,115.421L437.359,115.421L437.359,113.565L438.895,113.565L438.895,115.421L441.327,115.421L441.327,116.685L438.895,116.685L438.895,121.277C438.895,121.736 439.01,122.087 439.239,122.333C439.468,122.578 439.796,122.701 440.223,122.701C440.692,122.701 441.092,122.567 441.423,122.301L441.903,123.405ZM389.446,142.201C388.326,142.201 387.316,141.953 386.414,141.457C385.513,140.961 384.807,140.278 384.295,139.409C383.783,138.539 383.526,137.561 383.526,136.473C383.526,135.385 383.783,134.407 384.295,133.537C384.807,132.668 385.516,131.985 386.422,131.489C387.329,130.993 388.342,130.745 389.462,130.745C390.337,130.745 391.137,130.892 391.862,131.185C392.587,131.479 393.206,131.913 393.718,132.489L392.678,133.497C391.835,132.612 390.785,132.169 389.526,132.169C388.694,132.169 387.942,132.356 387.27,132.729C386.598,133.103 386.073,133.617 385.694,134.273C385.316,134.929 385.127,135.662 385.127,136.473C385.127,137.284 385.316,138.017 385.694,138.673C386.073,139.329 386.598,139.843 387.27,140.217C387.942,140.59 388.694,140.777 389.526,140.777C390.774,140.777 391.825,140.329 392.678,139.433L393.718,140.441C393.206,141.017 392.585,141.454 391.854,141.753C391.123,142.051 390.321,142.201 389.446,142.201ZM398.866,133.513C400.04,133.513 400.938,133.801 401.562,134.377C402.186,134.953 402.498,135.812 402.498,136.953L402.498,142.073L401.042,142.073L401.042,140.953C400.786,141.347 400.421,141.648 399.946,141.856C399.472,142.065 398.909,142.169 398.258,142.169C397.309,142.169 396.549,141.939 395.978,141.481C395.408,141.022 395.123,140.419 395.123,139.673C395.123,138.926 395.395,138.326 395.938,137.873C396.482,137.42 397.347,137.193 398.53,137.193L400.962,137.193L400.962,136.889C400.962,136.228 400.77,135.721 400.386,135.369C400.002,135.017 399.437,134.841 398.69,134.841C398.189,134.841 397.698,134.924 397.218,135.089C396.738,135.254 396.333,135.476 396.003,135.753L395.363,134.601C395.8,134.249 396.322,133.98 396.93,133.793C397.538,133.607 398.184,133.513 398.866,133.513ZM398.514,140.985C399.101,140.985 399.607,140.854 400.034,140.593C400.461,140.332 400.77,139.961 400.962,139.481L400.962,138.297L398.594,138.297C397.293,138.297 396.642,138.734 396.642,139.609C396.642,140.035 396.808,140.371 397.138,140.617C397.469,140.862 397.928,140.985 398.514,140.985ZM409.982,133.513C411.06,133.513 411.915,133.825 412.55,134.449C413.185,135.073 413.502,135.988 413.502,137.193L413.502,142.073L411.966,142.073L411.966,137.369C411.966,136.548 411.769,135.929 411.374,135.513C410.979,135.097 410.414,134.889 409.678,134.889C408.846,134.889 408.19,135.132 407.71,135.617C407.231,136.102 406.99,136.798 406.99,137.705L406.99,142.073L405.454,142.073L405.454,133.593L406.926,133.593L406.926,134.873C407.236,134.436 407.654,134.1 408.183,133.865C408.71,133.631 409.31,133.513 409.982,133.513ZM420.986,133.513C422.063,133.513 422.919,133.825 423.554,134.449C424.189,135.073 424.506,135.988 424.506,137.193L424.506,142.073L422.97,142.073L422.97,137.369C422.97,136.548 422.773,135.929 422.378,135.513C421.983,135.097 421.418,134.889 420.682,134.889C419.85,134.889 419.195,135.132 418.714,135.617C418.234,136.102 417.994,136.798 417.994,137.705L417.994,142.073L416.458,142.073L416.458,133.593L417.93,133.593L417.93,134.873C418.24,134.436 418.658,134.1 419.186,133.865C419.714,133.631 420.314,133.513 420.986,133.513ZM430.55,133.513C431.723,133.513 432.622,133.801 433.246,134.377C433.87,134.953 434.182,135.812 434.182,136.953L434.182,142.073L432.726,142.073L432.726,140.953C432.47,141.347 432.105,141.648 431.63,141.856C431.156,142.065 430.593,142.169 429.942,142.169C428.993,142.169 428.233,141.939 427.662,141.481C427.092,141.022 426.807,140.419 426.807,139.673C426.807,138.926 427.078,138.326 427.623,137.873C428.166,137.42 429.03,137.193 430.214,137.193L432.646,137.193L432.646,136.889C432.646,136.228 432.454,135.721 432.07,135.369C431.686,135.017 431.121,134.841 430.374,134.841C429.873,134.841 429.382,134.924 428.902,135.089C428.422,135.254 428.017,135.476 427.686,135.753L427.047,134.601C427.484,134.249 428.006,133.98 428.614,133.793C429.222,133.607 429.868,133.513 430.55,133.513ZM430.198,140.985C430.785,140.985 431.291,140.854 431.718,140.593C432.145,140.332 432.454,139.961 432.646,139.481L432.646,138.297L430.278,138.297C428.977,138.297 428.326,138.734 428.326,139.609C428.326,140.035 428.492,140.371 428.822,140.617C429.153,140.862 429.611,140.985 430.198,140.985ZM441.634,133.513C442.455,133.513 443.191,133.694 443.842,134.057C444.493,134.42 445.002,134.926 445.37,135.577C445.738,136.228 445.922,136.979 445.922,137.833C445.922,138.686 445.738,139.441 445.37,140.097C445.002,140.753 444.493,141.262 443.842,141.625C443.191,141.987 442.455,142.169 441.634,142.169C441.005,142.169 440.429,142.046 439.906,141.801C439.384,141.556 438.952,141.198 438.61,140.729L438.61,142.073L437.138,142.073L437.138,130.201L438.675,130.201L438.675,134.873C439.016,134.425 439.442,134.086 439.954,133.857C440.466,133.628 441.026,133.513 441.634,133.513ZM441.506,140.825C442.05,140.825 442.538,140.699 442.97,140.449C443.402,140.198 443.743,139.846 443.994,139.393C444.245,138.939 444.37,138.419 444.37,137.833C444.37,137.246 444.245,136.726 443.994,136.273C443.743,135.82 443.402,135.47 442.97,135.225C442.538,134.98 442.05,134.857 441.506,134.857C440.973,134.857 440.487,134.98 440.05,135.225C439.613,135.47 439.272,135.82 439.026,136.273C438.781,136.726 438.658,137.246 438.658,137.833C438.658,138.419 438.781,138.939 439.026,139.393C439.272,139.846 439.613,140.198 440.05,140.449C440.487,140.699 440.973,140.825 441.506,140.825ZM448.158,133.593L449.694,133.593L449.694,142.073L448.158,142.073L448.158,133.593ZM448.926,131.961C448.628,131.961 448.38,131.865 448.182,131.673C447.985,131.481 447.886,131.247 447.886,130.969C447.886,130.692 447.985,130.455 448.182,130.257C448.38,130.06 448.628,129.962 448.926,129.962C449.225,129.962 449.473,130.055 449.67,130.241C449.868,130.428 449.966,130.66 449.966,130.938C449.966,131.225 449.868,131.468 449.67,131.665C449.473,131.863 449.225,131.961 448.926,131.961ZM455.163,142.169C454.47,142.169 453.803,142.075 453.163,141.889C452.523,141.702 452.022,141.464 451.659,141.177L452.299,139.961C452.672,140.227 453.126,140.441 453.659,140.601C454.192,140.761 454.731,140.841 455.275,140.841C456.619,140.841 457.291,140.457 457.291,139.689C457.291,139.433 457.2,139.23 457.019,139.081C456.837,138.931 456.611,138.822 456.339,138.753C456.067,138.683 455.68,138.606 455.179,138.521C454.496,138.414 453.939,138.292 453.507,138.153C453.075,138.014 452.704,137.779 452.395,137.449C452.086,137.118 451.931,136.654 451.931,136.057C451.931,135.289 452.251,134.673 452.891,134.209C453.531,133.745 454.389,133.513 455.467,133.513C456.032,133.513 456.597,133.582 457.163,133.721C457.728,133.86 458.192,134.046 458.554,134.281L457.899,135.497C457.205,135.049 456.389,134.825 455.451,134.825C454.8,134.825 454.304,134.932 453.963,135.145C453.621,135.358 453.451,135.641 453.451,135.993C453.451,136.27 453.547,136.489 453.739,136.649C453.931,136.809 454.168,136.926 454.451,137.001C454.734,137.076 455.131,137.161 455.643,137.257C456.325,137.374 456.877,137.5 457.299,137.633C457.72,137.766 458.08,137.993 458.379,138.313C458.677,138.633 458.826,139.081 458.826,139.657C458.826,140.425 458.499,141.035 457.843,141.489C457.187,141.942 456.293,142.169 455.163,142.169" style={{fill: 'white', fillRule: 'nonzero'}}/>
                  </g>
                </svg>
              </a>
            </div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
              }}
            >
              {t('title')}
            </h1>
            <p className="text-lg font-medium" style={{ color: primaryColor }}>{t('subtitle')}</p>
          </div>


          {/* Dynamic Offer Banner - loads text and animations from database asynchronously */}
          <div className="mb-4 flex justify-center">
            <div className="w-full max-w-xl">
              <DynamicOfferBanner
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            </div>
          </div>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            <Badge text={t('badgeLargestDispensary')} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <Badge text={t('badgeMustVisit')} primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <Badge text={t('badgeLiveCultivation')} primaryColor={primaryColor} secondaryColor={secondaryColor} />
          </div>

          {/* News Preview Section */}
          <div className="mb-8">
            <NewsLandingPreviewWrapper />
          </div>

          {/* Why Choose Section */}
          <Section title={t('whyChooseTitle')}>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">{t('whyChoosePart1')}</span>{t('whyChoosePart2')}
            </p>
          </Section>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <FeatureCard title={t('featureFarmToursTitle')} description={t('featureFarmToursDescription')} />
            <FeatureCard title={t('featureEventsTitle')} description={t('featureEventsDescription')} />
            <FeatureCard title={t('featureRecognizedTitle')} description={t('featureRecognizedDescription')} />
            <FeatureCard title={t('featureBestPricesTitle')} description={t('featureBestPricesDescription')} />
            <FeatureCard title={t('featureScientificTitle')} description={t('featureScientificDescription')} />
            <FeatureCard title={t('featureMustVisitTitle')} description={t('featureMustVisitDescription')} />
          </div>

          {/* OG Lab Agent */}
          <div className="mb-8">
            <OGLabAgent />
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <CTAButton href="/menu" text={t('ctaExploreMenu')} />
          </div>


          {/* Call to Action Section with Map */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A] to-[#B0BF93] rounded-3xl p-8 mb-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            <div className="relative z-10 grid gap-6 md:grid-cols-2 md:items-center">
              {/* Text Content */}
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-wide">
                  {t('discoverGemTitle')}
                </h3>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  {t('discoverGemText1')}
                </p>
                <p className="text-lg font-semibold mb-6">
                  {t('discoverGemText2')}
                </p>
                <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                  <CTAButton href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text={t('ctaVisitUs')} external />
                </div>
              </div>

              {/* Google Maps Embed - Lazy loaded on scroll */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 h-[300px] md:h-[350px]">
                <LazyGoogleMap
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3935.40694564511!2d99.9582324!3d9.4732875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3054f550ef9d22ab%3A0x78805fae6045029c!2sOG%20Lab%20-%20Cannabis%E2%80%8B%20Farm%20Dispensary%20Samui!5e0!3m2!1sru!2sth!4v1759484890949!5m2!1sru!2sth"
                  title="OG Lab - Cannabis Farm Dispensary Samui Location"
                  height="100%"
                />
              </div>
            </div>
              
          </div>

          {/* Behind The Scenes */}
          <BehindTheScenes />

          {/* Final Section */}
          <Section>
            <p className="text-center font-semibold text-gray-800 mb-2">{t('finalSectionText')}</p>
            <DynamicEventText />
          </Section>

          {/* Promo Block - Moved to bottom */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A]/10 to-[#B0BF93]/10 border-r-4 border-[#536C4A] rounded-2xl p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B0BF93]/20 to-transparent animate-shimmer"></div>
            <h3 className="text-xl font-bold text-[#536C4A] mb-3 uppercase tracking-wide bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              {t('prescriptionTitle')}
            </h3>
            <h4 className="text-lg font-semibold text-[#536C4A] mb-2">{t('prescriptionSubtitle')}</h4>
            <p className="text-[#536C4A] mb-4">{t('prescriptionDescription')}</p>
            <a 
              href="https://ogpx.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {t('prescriptionCta')}
            </a>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}

// Components
function ContactLink({ href, text, primaryColor }: { href: string; text: string; primaryColor: string }) {
  return (
    <a 
      href={href} 
      className="contact-link px-4 py-2 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1"
      style={{ 
        backgroundColor: `${primaryColor}10`,
        color: primaryColor,
        '--primary-color': primaryColor
      } as React.CSSProperties & { [key: string]: string }}
    >
      {text}
    </a>
  );
}

function Badge({ text, primaryColor, secondaryColor }: { text: string; primaryColor: string; secondaryColor: string }) {
  return (
    <div 
      className="text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-fade-in-up"
      style={{ 
        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
      }}
    >
      {text}
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#B0BF93]/10 border-l-4 border-[#536C4A] rounded-2xl p-6 mb-6">
      {title && <h3 className="text-xl font-semibold text-[#536C4A] mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border-l-4 border-[#536C4A] rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <h4 className="text-lg font-semibold text-[#536C4A] mb-3">{title}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CTAButton({ href, text, external = false }: { href: string; text: string; external?: boolean }) {
  const className = "bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1";
  
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {text}
      </a>
    );
  }
  
  return (
    <Link href={href} className={className}>
      {text}
    </Link>
  );
}