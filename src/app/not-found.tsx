import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#536C4A] to-[#B0BF93] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white/90 mb-6">Page Not Found</h2>
        <p className="text-white/80 mb-8 max-w-md">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link 
          href="/"
          className="inline-block bg-white text-[#536C4A] px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
