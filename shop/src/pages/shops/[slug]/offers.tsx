import Seo from '@/components/seo/seo';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { useTranslation } from 'next-i18next';
import rangeMap from '@/lib/range-map';
import CouponLoader from '@/components/ui/loaders/coupon-loader';
import { useCoupons } from '@/framework/coupon';
import ErrorMessage from '@/components/ui/error-message';
import CouponCard from '@/components/ui/cards/coupon';
import dynamic from 'next/dynamic';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import PageBanner from '@/components/banners/page-banner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import { useSettings } from '@/framework/settings';
import { Routes } from '@/config/routes';
const CartCounterButton = dynamic(
  () => import('@/components/cart/cart-counter-button'),
  { ssr: false },
);

export default function ShopOffersPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    query: { slug },
  } = useRouter();
  const { data: shopData } = useShop({ slug: slug as string });
  const { settings } = useSettings();
  const shopId = shopData?.id!;

  !settings?.enableCoupons ? router.replace(Routes.shops) : null;

  const { isLoading, isLoadingMore, hasMore, coupons, error, loadMore } =
    useCoupons({
      shop_id: shopId,
    });
  const isValidCoupon = coupons.filter(
    (item: any) => Boolean(item?.is_approve) && Boolean(item?.is_valid),
  );

  if (error) return <ErrorMessage message={error.message} />;
  if (!isLoading && !coupons.length) {
    return (
      <div className="max-w-lg min-h-full px-4 pt-6 pb-8 mx-auto bg-gray-100 lg:p-10">
        <NotFound text="text-no-coupon" />
      </div>
    );
  }

  return (
    <>
      <Seo title="Offers" url="offers" />
      <PageBanner
        title={t('text-offers-title')}
        breadcrumbTitle={t('text-home')}
      />
      <div className="w-full px-4 py-12 mx-auto bg-gray-100 max-w-1920 lg:py-14 lg:px-8 xl:py-24 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-8 2xl:grid-cols-6">
          {isLoading && !isValidCoupon.length ? (
            rangeMap(6, (i) => (
              <CouponLoader key={i} uniqueKey={`coupon-${i}`} />
            ))
          ) : isValidCoupon.length ? (
            isValidCoupon.map((item: any) => (
              <CouponCard key={item.id} coupon={item} />
            ))
          ) : (
            <div className="max-w-lg mx-auto bg-gray-100 col-span-full">
              <NotFound text="text-no-coupon" />
            </div>
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

      <CartCounterButton />
    </>
  );
}

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

ShopOffersPage.getLayout = getLayoutWithFooter;
