import useLayout from '@/lib/hooks/use-layout';
import Header from './header';
import HeaderMinimal from './header-minimal';
import Footer from '../icons/check-icon';
import NoticeHighlightedBar from '@/components/store-notice/notice-highlightedBar';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const MobileNavigation = dynamic(() => import('./mobile-navigation'), {
  ssr: false,
});

export default function SiteLayout({ children }: React.PropsWithChildren<{}>) {
  const { layout } = useLayout();
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150">
      {router.query.slug && <NoticeHighlightedBar />}

      {['minimal', 'compact'].includes(layout) ? (
        <HeaderMinimal layout={layout} />
      ) : (
        <Header layout={layout} />
      )}
      {children}
      {['compact'].includes(layout) && <Footer />}
      <MobileNavigation />
    </div>
  );
}
export const getLayout = (page: React.ReactElement) => (
  <SiteLayout>{page}</SiteLayout>
);
