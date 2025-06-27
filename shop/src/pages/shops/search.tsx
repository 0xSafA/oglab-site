import type { NextPageWithLayout, Shop } from '@/types';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { useTranslation } from 'next-i18next';
import rangeMap from '@/lib/range-map';
import { useShops } from '@/framework/shop';
import ErrorMessage from '@/components/ui/error-message';
import { SHOPS_LIMIT } from '@/lib/constants';
import { useGetSearchNearShops } from '@/framework/shop';
export { getStaticProps } from '@/framework/shops-page.ssr';
import { useRouter } from 'next/router';
import NearShopCard from '@/components/ui/cards/near-shop';
import NearShopLoader from '@/components/ui/loaders/near-shop-loader';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';

const ShopsPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const limit = SHOPS_LIMIT;
  const { shops, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useShops({
      limit,
      is_active: 1,
    });

  const { data, isLoading: nearShopLoading } = useGetSearchNearShops({
    //@ts-ignore
    lat: query?.lat?.toString() as string,
    //@ts-ignore
    lng: query?.lng?.toString() as string,
  });

  if (isLoading || nearShopLoading) {
    return (
      <div className="container grid grid-cols-1 gap-6 px-4 pt-6 mx-auto sm:grid-cols-2 lg:grid-cols-2 lg:pt-10 2xl:grid-cols-3">
        <>
          {rangeMap(limit, (i) => (
            <NearShopLoader key={i} />
          ))}
        </>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <>
        <div className="min-h-full px-4 pt-6 pb-8 bg-gray-100 lg:p-8">
          <NotFound className="max-w-lg mx-auto" text="No Shops Nearby Found" />
        </div>
        <div className="bg-light">
          <div className="mx-auto flex w-full max-w-[1492px] flex-col p-8 pt-14">
            <h3 className="mb-8 text-2xl font-bold text-heading">
              {t('text-all-shops')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
              {shops.map((shop) => (
                <NearShopCard
                  key={shop.id}
                  //@ts-ignore
                  shop={shop}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isLoading && !shops?.length) {
    return (
      <div className="min-h-full px-4 pt-6 pb-8 bg-gray-100 lg:p-8">
        <NotFound text="text-no-shops" />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="min-h-screen bg-light">
      <div className="mx-auto flex w-full max-w-[1492px] flex-col p-8 pt-14">
        <h3 className="mb-8 text-2xl font-bold text-heading">
          {t('text-near-shops')}
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
          {data?.map(
            (shop) =>
              // @ts-ignore
              shop?.distance && <NearShopCard key={shop.id} shop={shop!} />,
          )}
        </div>
        {hasMore && (
          <div className="flex items-center justify-center mt-8 lg:mt-12">
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
