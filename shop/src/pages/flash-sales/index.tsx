import PageBanner from '@/components/banners/page-banner';
import FlashSaleCard from '@/components/flash-sale/flash-sale';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import NotFound from '@/components/ui/not-found';
import { useFlashSales } from '@/framework/flash-sales';
import { LIMIT_HUNDRED } from '@/lib/constants';
import type { NextPageWithLayout } from '@/types';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
export { getStaticProps } from '@/framework/shops-page.ssr';

const FlashDealsPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const limit = LIMIT_HUNDRED;
  const { flashSales, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useFlashSales({
      language: locale,
      limit,
    });

  if (isLoading) {
    return <Spinner showText={false} />;
  }

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="grow bg-[#F9F9F9] pb-8 lg:pb-10 xl:pb-14">
      <PageBanner
        title={t('text-available-flash-sale')}
        breadcrumbTitle={t('text-home')}
      />
      <div className="mx-auto max-w-[94.75rem]">
        <div className="px-4 py-10 pt-20">
          {!isEmpty(flashSales) ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <FlashSaleCard flashSales={flashSales as any} />
            </div>
          ) : (
            <NotFound text="text-no-flash-deal" className="h-96" />
          )}

          {hasMore && (
            <div className="mt-8 flex items-center justify-center lg:mt-12">
              <Button onClick={loadMore} loading={isLoadingMore}>
                {t('text-load-more')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FlashDealsPage.getLayout = getLayoutWithFooter;

export default FlashDealsPage;
