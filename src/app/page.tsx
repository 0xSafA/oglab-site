import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import NewsLandingPreviewWrapper from '@/components/NewsLandingPreviewWrapper';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { fetchTheme } from '@/lib/supabase-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const theme = await fetchTheme();
  
  // Use theme colors or fallback to defaults
  const primaryColor = theme?.primary_color || '#536C4A';
  const secondaryColor = theme?.secondary_color || '#B0BF93';
  const logoUrl = '/assets/images/oglab_logo_round.svg';
  const eventText = theme?.event_text ?? "Next party is coming 26 September at 19:00! Stay tuned!";
  const offerText = theme?.offer_text ?? "Next party is coming 26 September at 19:00! Stay tuned!";
  const offerHidden = theme?.offer_hide ?? false;
  
  // Animation settings with defaults
  const enableParticles = theme?.offer_enable_particles ?? true;
  const enableCosmicGlow = theme?.offer_enable_cosmic_glow ?? true;
  const enableFloating = theme?.offer_enable_floating ?? true;
  const enablePulse = theme?.offer_enable_pulse ?? true;
  const enableInnerLight = theme?.offer_enable_inner_light ?? true;
  
  // Build animation string based on settings
  const animations = [
    enableCosmicGlow && 'cosmicGlow 4s ease-in-out infinite',
    enableFloating && 'floating 6s ease-in-out infinite', 
    enablePulse && 'magicPulse 4s ease-in-out infinite'
  ].filter(Boolean).join(', ');

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
      className="min-h-screen bg-gradient-to-br flex items-start justify-center pt-7 pb-5 md:pt-6 md:pb-5"
      style={{ 
        background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` 
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A] via-[#B0BF93] to-[#536C4A]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,191,147,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(83,108,74,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_60%,rgba(176,191,147,0.2)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white/95 rounded-3xl shadow-2xl border-[3px] md:border-2 border-[#B0BF93]/45 md:border-[#B0BF93]/40 p-8 animate-fade-in-up">
          
          {/* Social Icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <a
              href="https://www.youtube.com/@oglabco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="transition-transform hover:scale-125"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                className="lucide lucide-youtube-icon lucide-youtube youtube-icon"
              >
                <g className="youtube-stroke" fill="none" stroke="#536C4A" strokeLinecap="round" strokeLinejoin="round">
                  <path vectorEffect="non-scaling-stroke" d="M2.5 17a24.1 24.1 0 0 1 0-10a2 2 0 0 1 1.4-1.4a49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10a2 2 0 0 1-1.4 1.4a49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path vectorEffect="non-scaling-stroke" d="m10 15l5-3l-5-3z" />
                </g>
              </svg>
            </a>
            <SocialLink href="https://www.instagram.com/oglab.co/" icon="/assets/images/instagram.svg" alt="Instagram" />
            <SocialLink href="https://t.me/Oglabco" icon="/assets/images/telegram.svg" alt="Telegram" />
            <SocialLink href="https://api.whatsapp.com/send?phone=+66982040757" icon="/assets/images/whatsapp.svg" alt="WhatsApp" />
            <SocialLink href="https://www.facebook.com/OGLabcom" icon="/assets/images/facebook.svg" alt="Facebook" />
            <SocialLink href="https://www.tripadvisor.com/Attraction_Review-g293918-d32974728-Reviews-OG_Lab_Cannabis_Farm_Dispensary_Samui-Ko_Samui_Surat_Thani_Province.html" icon="/assets/images/tripadvisor.svg" alt="TripAdvisor" size="large" />
          </div>

          {/* Contact Info with Language Switcher */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap items-center">
            <ContactLink href="tel:+66982040757" text="+66 98 204 0757" primaryColor={primaryColor} />
            <ContactLink href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text="Google Map" primaryColor={primaryColor} />
            <LanguageSwitcher />
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <Link href="/auth/login" aria-label="Login" className="inline-block">
                <Image
                  src={logoUrl}
                  alt="OG Lab Logo"
                  width={120}
                  height={120}
                  className="rounded-full shadow-lg animate-pulse-slow cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` 
              }}
            >
              OG Lab – Perfect Cannabis
            </h1>
            <p className="text-lg font-medium" style={{ color: primaryColor }}>The Best Cannabis Weed Dispensary and Farm on Koh Samui</p>
          </div>

          {/* Offer Pill (harmonized with badges) with Configurable Magic Effects */}
          {!offerHidden && (  
            <div className="flex justify-center mb-4">
              <div className="relative inline-block">
                {/* Магические частицы вокруг плашки - только если включены */}
                {enableParticles && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full opacity-70 animate-css-particle"
                        style={{
                          background: `hsl(${(i * 60) % 360}, 70%, 60%)`,
                          left: `${(i * 17 + 10) % 80}%`,
                          top: `${(i * 23 + 15) % 70}%`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
                
                <div
                  className="text-white px-5 py-2 rounded-full font-bold shadow-2xl text-sm text-center relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, #FFD700, ${primaryColor})`,
                    backgroundSize: '300% 300%',
                    animation: animations || 'none',
                  }}
                >
                  {/* Пульсирующий внутренний свет - только если включен */}
                  {enableInnerLight && (
                    <div 
                      className="absolute inset-0 rounded-full opacity-20 animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)',
                      }}
                    />
                  )}
                  <span className="relative z-10 drop-shadow-lg">{offerText}</span>
                </div>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Badge text="Largest dispensary on Samui" primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <Badge text="Must Visit Location" primaryColor={primaryColor} secondaryColor={secondaryColor} />
            <Badge text="Observe Live Cultivation" primaryColor={primaryColor} secondaryColor={secondaryColor} />
          </div>

          {/* News Preview Section */}
          <div className="mb-8">
            <NewsLandingPreviewWrapper />
          </div>

          {/* Why Choose Section */}
          <Section title="Why Choose OG Lab?">
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">Koh Samui&apos;s largest cannabis dispensary</span> – where quality meets culture. Discover live cultivation, explore our scientific area, and enjoy products made with passion and precision. OG Lab is the destination for every cannabis lover.
            </p>
          </Section>



          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <FeatureCard title="Farm Tours" description="Cannabis tours to our farm with scientific area with indoor grow and outdoor cannabis garden. See the growing process with your own eyes!" />
            <FeatureCard title="Events & Parties" description="Every 3 weeks we organize amazing parties for our community. Join us for unforgettable experiences!" />
            <FeatureCard title="Recognized Quality" description="Our cannabis is recognized at national competitions. Every award is proof of our uncompromising quality." />
            <FeatureCard title="Best Prices" description="Best prices directly from the producer! Maximum quality, freshest cannabis straight from the farm." />
            <FeatureCard title="Scientific Approach" description="Scientific area with big observation window. Innovative growing methods and quality control systems." />
            <FeatureCard title="Must Visit Place" description="Competing for the best location title on Samui in TripAdvisor. Must visit place on the island!" />
          </div>

          {/* Products Section */}
          <Section title="Our Products">
            <p className="text-gray-700 leading-relaxed">
              From <span className="font-semibold bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">Andaman cannabis papirosas</span> with cooling filter to premium buds, edibles, hash and plant clones. Each product is created with love and attention to detail.
            </p>
          </Section>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <CTAButton href="/menu" text="Weed Menu" />
          </div>


          {/* Call to Action Section with Map */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A] to-[#B0BF93] rounded-3xl p-8 mb-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            <div className="relative z-10 grid gap-6 md:grid-cols-2 md:items-center">
              {/* Text Content */}
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-wide">
                  Discover Hidden Gem of Thailand
                </h3>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  We invite you to discover the best-kept secret of Thailand and enjoy products crafted with passion and precision!
                </p>
                <p className="text-lg font-semibold mb-6">
                  More than a dispensary – a destination for true enthusiasts.
                </p>
                <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                  <CTAButton href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text="Visit Our Farm" external />
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 h-[300px] md:h-[350px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3935.40694564511!2d99.9582324!3d9.4732875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3054f550ef9d22ab%3A0x78805fae6045029c!2sOG%20Lab%20-%20Cannabis%E2%80%8B%20Farm%20Dispensary%20Samui!5e0!3m2!1sru!2sth!4v1759484890949!5m2!1sru!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="OG Lab - Cannabis Farm Dispensary Samui Location"
                  className="absolute inset-0"
                />
              </div>
            </div>
              
          </div>

          {/* Final Section */}
          <Section>
            <p className="text-center font-semibold text-gray-800 mb-2">Let&apos;s work, learn and relax together!</p>
            <p className="text-center text-gray-600">{eventText}</p>
          </Section>

          {/* Promo Block - Moved to bottom */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A]/10 to-[#B0BF93]/10 border-r-4 border-[#536C4A] rounded-2xl p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B0BF93]/20 to-transparent animate-shimmer"></div>
            <h3 className="text-xl font-bold text-[#536C4A] mb-3 uppercase tracking-wide bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              VALID CANNABIS PRESCRIPTION – HERE & NOW
            </h3>
            <h4 className="text-lg font-semibold text-[#536C4A] mb-2">Travel Safe. Smoke Free. No Stress</h4>
            <p className="text-[#536C4A] mb-4">Official Cannabis Prescription in 1 Minute</p>
            <a 
              href="https://ogpx.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              Get Your Prescription
            </a>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}

// Components
function SocialLink({ href, icon, alt, size = "normal" }: { href: string; icon: string; alt: string; size?: "normal" | "large" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-125">
      <Image 
        src={icon} 
        alt={alt} 
        width={size === "large" ? 45 : 40} 
        height={size === "large" ? 45 : 40} 
        className="transition-all duration-300"
      />
    </a>
  );
}

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