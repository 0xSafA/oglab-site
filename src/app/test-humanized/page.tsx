import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export const dynamic = 'force-dynamic';

export default async function HumanizedHomePage() {
  const primaryColor = '#536C4A';
  const secondaryColor = '#B0BF93';
  const logoUrl = '/assets/images/oglab_logo_round.svg';

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
      
      {/* Hero Section with Background Video */}
      <div className="relative min-h-screen overflow-hidden">
        
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {/* Placeholder для видео - замените на реальное видео */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A]/90 via-[#536C4A]/80 to-[#B0BF93]/90">
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
            </div>
          </div>
          
          {/* Видео заменит этот placeholder */}
          {/* <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/farm-tour.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A]/70 via-[#536C4A]/60 to-[#B0BF93]/70"></div> */}
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl">
            
            {/* Social Icons - теперь поверх видео */}
            <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in-up">
              <a
                href="https://www.youtube.com/@oglabco"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="transition-transform hover:scale-125 bg-white/90 rounded-full p-1"
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
            <div className="flex justify-center gap-4 mb-8 flex-wrap items-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <ContactLink href="tel:+66982040757" text="+66 98 204 0757" primaryColor={primaryColor} />
              <ContactLink href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text="Google Map" primaryColor={primaryColor} />
              <LanguageSwitcher />
            </div>

            {/* Logo and Title - на фоне видео */}
            <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative inline-block mb-6">
                <Link href="/auth/login" aria-label="Login" className="inline-block">
                  <Image
                    src={logoUrl}
                    alt="OG Lab Logo"
                    width={150}
                    height={150}
                    className="rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform border-4 border-white/90"
                  />
                </Link>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl">
                OG Lab – Perfect Cannabis
              </h1>
              <p className="text-xl md:text-2xl font-medium text-white/95 drop-shadow-lg">
                Cannabis Dispensary and Farm on Koh Samui
              </p>
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-3 mb-8 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Badge text="Largest dispensary on Samui" primaryColor={primaryColor} secondaryColor={secondaryColor} />
              <Badge text="Must Visit Location" primaryColor={primaryColor} secondaryColor={secondaryColor} />
              <Badge text="Observe Live Cultivation" primaryColor={primaryColor} secondaryColor={secondaryColor} />
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CTAButton href="/menu" text="Explore Weed Menu" large />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="text-white/80 text-center">
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-sm">Scroll Down</span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Photo Carousel Section */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              Glimpse Into Our World
            </h2>
            
            {/* Carousel Grid - Placeholder для фото */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <PhotoCard
                title="Our Farm"
                description="Organic cannabis cultivation under the Thai sun"
                placeholder="🌿"
                imageUrl="/photos/farm-1.jpg"
              />
              <PhotoCard
                title="Premium Products"
                description="Hand-selected buds and Andaman papirosas"
                placeholder="🍃"
                imageUrl="/photos/products-1.jpg"
              />
              <PhotoCard
                title="Happy Visitors"
                description="Creating memorable experiences every day"
                placeholder="😊"
                imageUrl="/photos/customers-1.jpg"
              />
            </div>
          </section>

          {/* Meet Our Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              Meet Our Passionate Team
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
              Behind every great product is a team of dedicated professionals who love what they do
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TeamMember
                name="Alex"
                role="Head Cultivator"
                placeholder="👨‍🌾"
                imageUrl="/photos/team-alex.jpg"
              />
              <TeamMember
                name="Maria"
                role="Customer Experience"
                placeholder="👩‍💼"
                imageUrl="/photos/team-maria.jpg"
              />
              <TeamMember
                name="David"
                role="Quality Control"
                placeholder="👨‍🔬"
                imageUrl="/photos/team-david.jpg"
              />
              <TeamMember
                name="Sophie"
                role="Farm Tour Guide"
                placeholder="👩‍🏫"
                imageUrl="/photos/team-sophie.jpg"
              />
            </div>
          </section>

          {/* Video Tour Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-[#536C4A] to-[#B0BF93] rounded-3xl p-8 md:p-12 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Take A Virtual Farm Tour
                  </h2>
                  <p className="text-lg mb-6 text-white/90">
                    Can&apos;t visit us in person yet? Watch our virtual tour and explore our facilities, 
                    cultivation process, and scientific area from the comfort of your home.
                  </p>
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🌱</span>
                      <span>See our indoor and outdoor growing areas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🔬</span>
                      <span>Explore our scientific observation room</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">🏪</span>
                      <span>Walk through our spacious dispensary</span>
                    </li>
                  </ul>
                </div>
                
                {/* Video Placeholder */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-video bg-[#536C4A]/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎥</div>
                      <p className="text-white/80">Video будет здесь</p>
                      <p className="text-sm text-white/60 mt-2">Загрузите farm-tour.mp4</p>
                    </div>
                  </div>
                  {/* Реальное видео */}
                  {/* <iframe
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                    title="OG Lab Farm Tour"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  /> */}
                </div>
              </div>
            </div>
          </section>

          {/* Behind the Scenes Photo Grid */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              Behind The Scenes
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
              From seed to harvest - witness our dedication to quality at every step
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BehindScenesCard emoji="🌱" title="Seedlings" imageUrl="/photos/behind-1.jpg" />
              <BehindScenesCard emoji="💧" title="Watering" imageUrl="/photos/behind-2.jpg" />
              <BehindScenesCard emoji="✂️" title="Trimming" imageUrl="/photos/behind-3.jpg" />
              <BehindScenesCard emoji="🔬" title="Testing" imageUrl="/photos/behind-4.jpg" />
              <BehindScenesCard emoji="📦" title="Packaging" imageUrl="/photos/behind-5.jpg" />
              <BehindScenesCard emoji="🏪" title="Dispensary" imageUrl="/photos/behind-6.jpg" />
              <BehindScenesCard emoji="🎉" title="Events" imageUrl="/photos/behind-7.jpg" />
              <BehindScenesCard emoji="🤝" title="Community" imageUrl="/photos/behind-8.jpg" />
            </div>
          </section>

          {/* Why Choose Section */}
          <Section title="Why Choose OG Lab?">
            <p className="text-gray-700 leading-relaxed text-lg">
              <span className="font-semibold bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">Koh Samui&apos;s largest cannabis dispensary</span> – where quality meets culture. 
              Discover live cultivation, explore our scientific area, and enjoy products made with passion and precision. 
              OG Lab is the destination for every cannabis lover.
            </p>
          </Section>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <FeatureCard 
              emoji="🚜"
              title="Farm Tours" 
              description="Cannabis tours to our farm with scientific area with indoor grow and outdoor cannabis garden. See the growing process with your own eyes!" 
            />
            <FeatureCard 
              emoji="🎊"
              title="Events & Parties" 
              description="Every 3 weeks we organize amazing parties for our community. Join us for unforgettable experiences!" 
            />
            <FeatureCard 
              emoji="🏆"
              title="Recognized Quality" 
              description="Our cannabis is recognized at national competitions. Every award is proof of our uncompromising quality." 
            />
            <FeatureCard 
              emoji="💰"
              title="Best Prices" 
              description="Best prices directly from the producer! Maximum quality, freshest cannabis straight from the farm." 
            />
            <FeatureCard 
              emoji="🔬"
              title="Scientific Approach" 
              description="Scientific area with big observation window. Innovative growing methods and quality control systems." 
            />
            <FeatureCard 
              emoji="⭐"
              title="Must Visit Place" 
              description="Competing for the best location title on Samui in TripAdvisor. Must visit place on the island!" 
            />
          </div>

          {/* Products Section */}
          <Section title="Our Products">
            <p className="text-gray-700 leading-relaxed text-lg">
              From <span className="font-semibold bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">Andaman cannabis papirosas</span> with cooling filter 
              to premium buds, edibles, hash and plant clones. Each product is created with love and attention to detail.
            </p>
          </Section>

          {/* CTA with Map */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A] to-[#B0BF93] rounded-3xl p-8 md:p-12 mb-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-wide">
                  Visit Us Today
                </h3>
                <p className="text-lg md:text-xl leading-relaxed mb-6">
                  Experience the warmth of our team, the beauty of our farm, and the quality of our products. 
                  We&apos;re more than a dispensary – we&apos;re a destination for true enthusiasts.
                </p>
                <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                  <CTAButton href="https://maps.app.goo.gl/774xQAAVHG5NY9i6A" text="Get Directions" external white />
                  <CTAButton href="/menu" text="View Menu" white />
                </div>
              </div>

              {/* Google Maps */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 h-[300px] md:h-[350px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3935.40694564511!2d99.9582324!3d9.4732875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3054f550ef9d22ab%3A0x78805fae6045029c!2sOG%20Lab%20-%20Cannabis%E2%80%8B%20Farm%20Dispensary%20Samui!5e0!3m2!1sru!2sth!4v1759484890949!5m2!1sru!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="OG Lab Location"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>

          {/* Promo Block */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A]/10 to-[#B0BF93]/10 border-l-4 border-[#536C4A] rounded-2xl p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B0BF93]/20 to-transparent animate-shimmer"></div>
            <h3 className="text-2xl font-bold text-[#536C4A] mb-3 uppercase tracking-wide bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              VALID CANNABIS PRESCRIPTION – HERE & NOW
            </h3>
            <h4 className="text-xl font-semibold text-[#536C4A] mb-2">Travel Safe. Smoke Free. No Stress</h4>
            <p className="text-[#536C4A] mb-4 text-lg">Official Cannabis Prescription in 1 Minute</p>
            <a 
              href="https://ogpx.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-lg"
            >
              Get Your Prescription
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Components
function SocialLink({ href, icon, alt, size = "normal" }: { href: string; icon: string; alt: string; size?: "normal" | "large" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-125 bg-white/90 rounded-full p-1">
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
      className="contact-link px-5 py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm shadow-lg"
      style={{ 
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
      className="text-white px-5 py-3 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm"
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
    <div className="bg-[#B0BF93]/10 border-l-4 border-[#536C4A] rounded-2xl p-8 mb-8">
      {title && <h3 className="text-2xl md:text-3xl font-semibold text-[#536C4A] mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white border-2 border-[#B0BF93]/30 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="text-4xl mb-4">{emoji}</div>
      <h4 className="text-xl font-semibold text-[#536C4A] mb-3">{title}</h4>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function CTAButton({ href, text, external = false, large = false, white = false }: { href: string; text: string; external?: boolean; large?: boolean; white?: boolean }) {
  const className = `${white ? 'bg-white text-[#536C4A]' : 'bg-white text-[#536C4A]'} ${large ? 'px-10 py-4 text-xl' : 'px-8 py-3 text-lg'} rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105`;
  
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

function PhotoCard({ title, description, placeholder, imageUrl }: { title: string; description: string; placeholder: string; imageUrl: string }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 aspect-[4/3]">
      {/* Placeholder - замените на реальные фото */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A] to-[#B0BF93] flex items-center justify-center">
        <span className="text-8xl">{placeholder}</span>
      </div>
      {/* <Image src={imageUrl} alt={title} fill className="object-cover" /> */}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/90">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TeamMember({ name, role, placeholder, imageUrl }: { name: string; role: string; placeholder: string; imageUrl: string }) {
  return (
    <div className="text-center group">
      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 aspect-square mb-4">
        {/* Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B0BF93] to-[#536C4A] flex items-center justify-center">
          <span className="text-8xl">{placeholder}</span>
        </div>
        {/* <Image src={imageUrl} alt={name} fill className="object-cover" /> */}
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-[#536C4A]/0 group-hover:bg-[#536C4A]/20 transition-all duration-300"></div>
      </div>
      <h4 className="text-xl font-bold text-[#536C4A] mb-1">{name}</h4>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}

function BehindScenesCard({ emoji, title, imageUrl }: { emoji: string; title: string; imageUrl: string }) {
  return (
    <div className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 aspect-square">
      {/* Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B0BF93]/50 to-[#536C4A]/50 flex items-center justify-center">
        <span className="text-5xl">{emoji}</span>
      </div>
      {/* <Image src={imageUrl} alt={title} fill className="object-cover" /> */}
      
      {/* Title overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-3">
        <span className="text-white font-semibold text-sm">{title}</span>
      </div>
    </div>
  );
}

