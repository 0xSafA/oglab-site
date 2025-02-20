import { FilterIcon } from '@/components/icons/filter-icon';
// import MobileNavigation from '@/components/layouts/mobile-navigation';
import GeneralLayout from '@/components/layouts/_general';
import Details from '@/components/manufacturer/details';
import { Grid } from '@/components/products/grid';
import SidebarFilter from '@/components/search-view/sidebar-filter';
import { useProducts } from '@/framework/product';
import { useWindowSize } from '@/lib/use-window-size';
import { drawerAtom } from '@/store/drawer-atom';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import StickyBox from 'react-sticky-box';
import useLayout from '@/lib/hooks/use-layout';
export { getStaticPaths, getStaticProps } from '@/framework/manufacturer.ssr';

const CartCounterButton = dynamic(
  () => import('@/components/cart/cart-counter-button'),
  { ssr: false },
);

const MobileNavigation = dynamic(
  () => import('@/components/layouts/mobile-navigation'),
  {
    ssr: false,
  },
);

export default function Manufacturer({ manufacturer, variables }: any) {
  const { t } = useTranslation('common');
  const { query } = useRouter();

  const { products, loadMore, isLoadingMore, isLoading, hasMore, error } =
    useProducts({ ...variables, ...query });
  const { width } = useWindowSize();

  const productsItem: any = products;

  return (
    <>
      <div className="flex flex-col w-full">
        <Details manufacturer={manufacturer} />
        <h2 className="mb-8 text-3xl font-semibold tracking-tight text-heading">
          {manufacturer?.type?.name}
        </h2>
        <Grid
          products={productsItem}
          loadMore={loadMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          column="five"
        />
      </div>

      {width > 1023 && <CartCounterButton />}
    </>
  );
}

const GetLayout = (page: React.ReactElement) => {
  const { t } = useTranslation('common');
  const [_, setDrawerView] = useAtom(drawerAtom);
  const type = page.props.manufacturer?.type?.slug;
  return (
    <GeneralLayout>
      <>
        <div className="w-full bg-light">
          <div className="flex w-full min-h-screen px-5 pt-10 pb-16 mx-auto max-w-1920 rtl:space-x-reverse lg:space-x-10 xl:py-14 xl:px-16">
            <div className="hidden w-80 shrink-0 lg:block">
              <StickyBox offsetTop={140} offsetBottom={30}>
                <SidebarFilter type={type} showManufacturers={false} />
              </StickyBox>
            </div>
            {page}
          </div>
        </div>
        <MobileNavigation>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() =>
              setDrawerView({
                display: true,
                view: 'SEARCH_FILTER',
                data: { type, showManufacturers: false },
              })
            }
            className="flex items-center justify-center h-full p-2 focus:text-accent focus:outline-0"
          >
            <span className="sr-only">{t('text-filter')}</span>
            <FilterIcon width="17.05" height="18" />
          </motion.button>
        </MobileNavigation>
      </>
    </GeneralLayout>
  );
};
Manufacturer.getLayout = GetLayout;
