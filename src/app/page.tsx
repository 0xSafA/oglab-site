import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] flex items-start justify-center pt-7 pb-5 md:pt-6 md:pb-5">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#536C4A] via-[#B0BF93] to-[#536C4A]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(176,191,147,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(83,108,74,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_60%,rgba(176,191,147,0.2)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-[3px] md:border-2 border-[#B0BF93]/45 md:border-[#B0BF93]/40 p-8 animate-fade-in-up">
          
          {/* Social Icons */}
          <div className="flex justify-center gap-4 mb-6">
            <SocialLink href="https://www.instagram.com/oglabco/" icon="/assets/images/instagram.svg" alt="Instagram" />
            <SocialLink href="https://t.me/Oglabco" icon="/assets/images/telegram.svg" alt="Telegram" />
            <SocialLink href="https://api.whatsapp.com/send?phone=+66982040757" icon="/assets/images/whatsapp.svg" alt="WhatsApp" />
            <SocialLink href="https://www.facebook.com/OGLabcom" icon="/assets/images/facebook.svg" alt="Facebook" />
            <SocialLink href="https://www.tripadvisor.com/Attraction_Review-g293918-d32974728-Reviews-OG_Lab_Cannabis_Farm_Dispensary_Samui-Ko_Samui_Surat_Thani_Province.html" icon="/assets/images/tripadvisor.svg" alt="TripAdvisor" size="large" />
          </div>

          {/* Contact Info */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <ContactLink href="tel:+66982040757" text="+66 98 204 0757" />
            <ContactLink href="https://maps.app.goo.gl/5UtovCjQXCQixxJy7" text="Google Map" />
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <Image
                src="/assets/images/oglab_logo_round.svg"
                alt="OG Lab Logo"
                width={120}
                height={120}
                className="rounded-full shadow-lg animate-pulse-slow"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#536C4A] to-[#B0BF93] bg-clip-text text-transparent">
              OG Lab - Perfect Cannabis
            </h1>
            <p className="text-lg text-[#536C4A] font-medium">Growing Farm and Dispensary</p>
          </div>

          {/* Badges */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Badge text="Largest dispensary on Samui" />
            <Badge text="Must Visit Location" />
            <Badge text="Observe Live Cultivation" />
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
            <FeatureCard title="Award Winners" description="We participate in Cannabis Cup competitions and other prestigious contests. Quality confirmed by awards!" />
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


          {/* Call to Action Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#536C4A] to-[#B0BF93] rounded-3xl p-8 mb-6 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <h3 className="text-xl md:text-2xl font-bold mb-4  tracking-wide">
              Discover Hidden Gem of Thailand
            </h3>
            <p className="text-lg md:text-xl leading-relaxed mb-4">
              We invite you to discover the best-kept secret of Thailand and enjoy products crafted with passion and precision!
            </p>
            <p className="text-lg font-semibold mb-6">
              More than a dispensary – a destination for true enthusiasts.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <CTAButton href="https://maps.app.goo.gl/5UtovCjQXCQixxJy7" text="Visit Our Farm" external />
            </div>
              
          </div>

          {/* Final Section */}
          <Section>
            <p className="text-center font-semibold text-gray-800 mb-2">Let&apos;s work, learn and relax together!</p>
            <p className="text-center text-gray-600">Next party is coming 19 September at 18:00! Stay tuned!</p>
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

function ContactLink({ href, text }: { href: string; text: string }) {
  return (
    <a 
      href={href} 
      className="bg-[#536C4A]/10 text-[#536C4A] px-4 py-2 rounded-full font-semibold hover:bg-[#536C4A] hover:text-white transition-all duration-300 hover:-translate-y-1"
    >
      {text}
    </a>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-fade-in-up">
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