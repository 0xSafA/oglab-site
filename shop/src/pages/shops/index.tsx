import type { NextPageWithLayout } from '@/types';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { useTranslation } from 'next-i18next';
import rangeMap from '@/lib/range-map';
import CouponLoader from '@/components/ui/loaders/coupon-loader';
import { useShops } from '@/framework/shop';
import ErrorMessage from '@/components/ui/error-message';
import ShopCard from '@/components/ui/cards/shop';
import { useGetSearchNearShops } from '@/framework/shop';
export { getStaticProps } from '@/framework/shops-page.ssr';
import { useRouter } from 'next/router';
import { SHOPS_PER_PAGE } from '@/framework/client/variables';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';

const ShopsPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const limit = SHOPS_PER_PAGE;
  const { shops, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useShops({
      limit,
      is_active: 1,
    });
  const { data } = useGetSearchNearShops({
    lat: query?.lat?.toString() as string,
    lng: query?.lng?.toString() as string,
  });

  if (error) return <ErrorMessage message={error.message} />;
  if (!isLoading && !shops.length) {
    return (
      <div className="min-h-full bg-gray-100 px-4 pt-6 pb-8 lg:p-8">
        <NotFound text="text-no-shops" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light ">
      <div className="mx-auto flex w-full max-w-6xl flex-col p-8 px-5 pt-14 lg:px-6 2xl:px-8">
        <h3 className="mb-8 text-2xl font-bold text-heading">
          {t('text-all-shops')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && !shops.length ? (
            <>
              {rangeMap(limit, (i) => (
                <CouponLoader key={i} uniqueKey={`shops-${i}`} />
              ))}
            </>
          ) : (
            shops.map((shop) => <ShopCard shop={shop} key={shop.id} />)
          )}
        </div>
        {hasMore && (
          <div className="mt-8 flex items-center justify-center lg:mt-12">
            <Button onClick={loadMore} loading={isLoadingMore}>
              {t('text-load-more')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
ShopsPage.getLayout = getLayoutWithFooter;

export default ShopsPage;
