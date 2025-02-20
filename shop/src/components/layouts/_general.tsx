import Header from './header';
import dynamic from 'next/dynamic';

const MobileNavigation = dynamic(
  () => import('@/components/layouts/mobile-navigation'),
  {
    ssr: false,
  }
);
export default function GeneralLayout({
  children,
  layout,
}: React.PropsWithChildren<{ layout?: string }>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 transition-colors duration-150">
      <Header layout={layout} />
      {children}
      <MobileNavigation />
    </div>
  );
}

export const getGeneralLayout = (page: React.ReactElement) => (
  <GeneralLayout layout={page.props.layout}>
    {page}
    <MobileNavigation />
  </GeneralLayout>
);
