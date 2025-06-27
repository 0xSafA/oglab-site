import { getLayout } from '@/components/layouts/layout';
import ProductsGrid from '@/components/products/grid';
import ShopSidebar from '@/components/shops/sidebar';
import CountdownTimer from '@/components/ui/countdown-timer/maintenance';
import { Image } from '@/components/ui/image';
import { useShopMaintenanceEvent } from '@/framework/shop';
import { getStaticPaths, getStaticProps } from '@/framework/shop.ssr';
import {
  checkIsShopMaintenanceModeComing,
  checkIsShopMaintenanceModeStart,
} from '@/lib/constants';
import { useWindowSize } from '@/lib/use-window-size';
import { NextPageWithLayout } from '@/types';
import classNames from 'classnames';
import { eachMinuteOfInterval, isBefore } from 'date-fns';
import { useAtom } from 'jotai';
import { InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
export { getStaticPaths, getStaticProps };

const CartCounterButton = dynamic(
  () => import('@/components/cart/cart-counter-button'),
  { ssr: false },
);

const ShopPage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ shop, variables }) => {
  const { locale, query, asPath, reload } = useRouter();
  const { width } = useWindowSize();
  const { t } = useTranslation('banner');
  const { createShopMaintenanceEventRequest } = useShopMaintenanceEvent();
  const [_, setUnderMaintenanceIsComing] = useAtom(
    checkIsShopMaintenanceModeComing,
  );
  const [underMaintenanceStart, setUnderMaintenanceStart] = useAtom(
    checkIsShopMaintenanceModeStart,
  );

  const isGerman = locale === 'de';
  const isBook = asPath.includes('/book');

  // Use useMemo to avoid recomputing the date interval on every render
  const dateInterVal = useMemo(() => {
    if (
      shop?.settings?.shopMaintenance?.start &&
      shop?.settings?.shopMaintenance?.until &&
      shop?.settings?.isShopUnderMaintenance
    ) {
      return eachMinuteOfInterval({
        start: new Date(shop?.settings?.shopMaintenance?.start),
        end: new Date(shop?.settings?.shopMaintenance?.until),
      });
    }
    return [];
  }, [
    shop?.settings?.shopMaintenance?.start,
    shop?.settings?.shopMaintenance?.until,
    shop?.settings?.isShopUnderMaintenance,
  ]);

  // Use useCallback to avoid creating new functions on every render
  const handleMaintenanceCheck = useCallback(() => {
    if (dateInterVal?.length > 0 && query?.slug) {
      const beforeDay = isBefore(
        new Date(),
        new Date(shop?.settings?.shopMaintenance?.start as string),
      );
      // Calculate maintenance start time
      const maintenanceStartTime = new Date(
        shop?.settings?.shopMaintenance?.start as string,
      );
      const maintenanceEndTime = new Date(
        shop?.settings?.shopMaintenance?.until as string,
      );
      maintenanceStartTime.setMinutes(maintenanceStartTime.getMinutes());
      // Check if the current time has passed the maintenance start time
      const currentTime = new Date();
      const checkIsMaintenanceStart =
        currentTime >= maintenanceStartTime &&
        currentTime < maintenanceEndTime &&
        shop?.settings?.isShopUnderMaintenance;
      const checkIsMaintenance =
        beforeDay && shop?.settings?.isShopUnderMaintenance;
      setUnderMaintenanceStart(checkIsMaintenanceStart as boolean);
      setUnderMaintenanceIsComing(checkIsMaintenance as boolean);
    }
  }, [
    dateInterVal,
    shop?.settings?.isShopUnderMaintenance,
    shop?.settings?.shopMaintenance?.start,
    shop?.settings?.shopMaintenance?.until,
  ]);

  // Use useEffect to run the maintenance check only once
  useEffect(() => {
    handleMaintenanceCheck();
  }, [handleMaintenanceCheck]);

  return (
    <div className="flex flex-col bg-gray-100 lg:flex-row lg:items-start lg:p-8">
      <ShopSidebar shop={shop} className="sticky top-24 lg:top-28" />

      <div
        className={classNames(
          'flex flex-col w-full p-4 pb-12 lg:p-0 ltr:lg:pl-8 rtl:lg:pr-8',
          underMaintenanceStart ? 'self-stretch' : '',
        )}
      >
        <div className="relative w-full h-full overflow-hidden rounded">
          <Image
            alt={t('heading')}
            src={
              shop?.cover_image?.original! ?? '/shop-fallback-cover-photo.png'
            }
            width={2340}
            height={870}
            className="w-full h-full"
          />
        </div>
        {!underMaintenanceStart ? (
          <>
            <ProductsGrid
              className="py-8"
              gridClassName={classNames(
                'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3',
                {
                  'gap-6 md:gap-8': isBook,
                },
                {
                  'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]':
                    isGerman,
                },
              )}
              variables={variables}
            />
            {width > 1023 && <CartCounterButton />}
          </>
        ) : (
          <>
            <div className="h-full mt-8 bg-[#040014] relative rounded flex">
              <div className="m-auto space-y-8 max-w-2xl w-full text-center relative z-20 text-white">
                <div className="uppercase">
                  <CountdownTimer
                    date={
                      new Date(
                        shop?.settings?.shopMaintenance?.start
                          ? (shop?.settings?.shopMaintenance?.until as string)
                          : (shop?.settings?.shopMaintenance?.start as string),
                      )
                    }
                    onComplete={() =>
                      createShopMaintenanceEventRequest({
                        shop_id: shop?.id,
                        isMaintenance: false,
                        isShopUnderMaintenance: Boolean(
                          shop?.settings?.isShopUnderMaintenance,
                        ),
                      })
                    }
                  />
                </div>
                {shop?.settings?.shopMaintenance?.title ? (
                  <h1 className="text-xl font-bold lg:mb-8 lg:text-5xl">
                    {shop?.settings?.shopMaintenance?.title}
                  </h1>
                ) : (
                  ''
                )}
                {shop?.settings?.shopMaintenance?.description ? (
                  <p className="text-base leading-8 lg:text-lg">
                    {shop?.settings?.shopMaintenance?.description}
                  </p>
                ) : (
                  ''
                )}
              </div>
              {shop?.settings?.shopMaintenance?.image &&
              shop?.settings?.shopMaintenance?.image?.original ? (
                <div className="absolute top-0 left-0 z-10 h-full w-full bg-no-repeat">
                  <Image
                    src={shop?.settings?.shopMaintenance?.image?.original}
                    alt="maintenance image"
                    fill
                    className="object-contain object-bottom"
                  />
                </div>
              ) : (
                ''
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

ShopPage.getLayout = getLayout;
export default ShopPage;
