import { BasketIcon } from '@/components/icons/summary/basket';
import { ChecklistIcon } from '@/components/icons/summary/checklist';
import { EaringIcon } from '@/components/icons/summary/earning';
import { ShoppingIcon } from '@/components/icons/summary/shopping';
import RecentOrders from '@/components/order/recent-orders';
import PopularProductList from '@/components/product/popular-product-list';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import ColumnChart from '@/components/widgets/column-chart';
import StickerCard from '@/components/widgets/sticker-card';
import WithdrawTable from '@/components/withdraw/withdraw-table';
import cn from 'classnames';
import { useAdminDashboardQuery } from '@/graphql/admin-dashboard-query.graphql';
import usePrice from '@/utils/use-price';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Search from '@/components/common/search';
import { useWithdrawsQuery } from '@/graphql/withdraws.graphql';
import LowStockProduct from '@/components/product/product-stock';
import { PaginatorInfo, WithdrawPaginator } from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';

const OrderStatusWidget = dynamic(
  () => import('@/components/dashboard/widgets/box/widget-order-by-status')
);
const ProductCountByCategory = dynamic(
  () =>
    import(
      '@/components/dashboard/widgets/table/widget-product-count-by-category'
    )
);

const TopRatedProducts = dynamic(
  () => import('@/components/dashboard/widgets/box/widget-top-rate-product')
);
export default function Dashboard() {
  const { t } = useTranslation();
  const { locale } = useRouter();
          //@ts-ignore
  const [searchTerm, setSearchTerm] = useState('');
          //@ts-ignore
  const [page, setPage] = useState(1);
  const [activeTimeFrame, setActiveTimeFrame] = useState(1);

  const { data, loading, error } = useAdminDashboardQuery({
    variables: {
      limit: 10,
      language: locale,
    },
  });

  const [orderDataRange, setOrderDataRange] = useState(
    data?.analytics?.todayTotalOrderByStatus
  );

  const { data: withdraws, loading: withdrawLoading } = useWithdrawsQuery({
    variables: {
      first: 10,
    },
  });

  const { price: total_revenue } = usePrice(
    data && {
      amount: data?.analytics?.totalRevenue!,
    }
  );
      //@ts-ignore
  const { price: todays_revenue } = usePrice(
    data && {
      amount: data?.analytics?.todaysRevenue!,
    }
  );

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  const timeFrame = [
    { name: t('text-today'), day: 1 },
    { name: t('text-weekly'), day: 7 },
    { name: t('text-monthly'), day: 30 },
    { name: t('text-yearly'), day: 365 },
  ];

  useEffect(() => {
    switch (activeTimeFrame) {
      case 1:
        setOrderDataRange(data?.analytics?.todayTotalOrderByStatus);
        break;
      case 7:
        setOrderDataRange(data?.analytics?.weeklyTotalOrderByStatus);
        break;
      case 30:
        setOrderDataRange(data?.analytics?.monthlyTotalOrderByStatus);
        break;
      case 365:
        setOrderDataRange(data?.analytics?.yearlyTotalOrderByStatus);
        break;

      default:
        setOrderDataRange(orderDataRange);
        break;
    }
  });

  if (loading || withdrawLoading) {
    return <Loader text={t('common:text-loading')} />;
  }

  if (error) {
    return <ErrorMessage message={error?.message} />;
  }

  let salesByYear: number[] = Array.from({ length: 12 }, (_) => 0);
  if (!!data?.analytics?.totalYearSaleByMonth?.length) {
    salesByYear = data.analytics.totalYearSaleByMonth.map((item: any) =>
      item.total.toFixed(2)
    );
  }

  return (
    <div className="grid gap-7 md:gap-8 lg:grid-cols-2 2xl:grid-cols-12">
      <div className="col-span-full rounded-lg bg-light p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between md:mb-7">
          <PageHeading title={t('text-summary')} />
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StickerCard
            titleTransKey="sticker-card-title-rev"
            subtitleTransKey="sticker-card-subtitle-rev"
            icon={<EaringIcon className="h-8 w-8" />}
            color="#1EAE98"
            price={total_revenue}
          />
          <StickerCard
            titleTransKey="sticker-card-title-order"
            subtitleTransKey="sticker-card-subtitle-order"
            icon={<ShoppingIcon className="h-8 w-8" />}
            color="#865DFF"
            price={data?.analytics?.totalOrders}
          />
          <StickerCard
            titleTransKey="sticker-card-title-vendor"
            icon={<ChecklistIcon className="h-8 w-8" />}
            color="#D74EFF"
            price={data?.analytics?.totalVendors}
          />
          <StickerCard
            titleTransKey="sticker-card-title-total-shops"
            icon={<BasketIcon className="h-8 w-8" />}
            color="#E157A0"
            price={data?.analytics?.totalShops}
          />
        </div>
      </div>
      <div className="col-span-full rounded-lg bg-light p-6 md:p-8">
        <div className="mb-5 items-center justify-between sm:flex md:mb-7">
          <PageHeading title={t('text-order-status')} />
          <div className="mt-3.5 inline-flex rounded-full bg-gray-100/80 p-1.5 sm:mt-0">
            {timeFrame
              ? timeFrame.map((time) => (
                  <div key={time.day} className="relative">
                    <Button
                      className={cn(
                        '!focus:ring-0  relative z-10 !h-7 rounded-full !px-2.5 text-sm font-medium text-gray-500',
                        time.day === activeTimeFrame ? 'text-accent' : ''
                      )}
                      type="button"
                      onClick={() => setActiveTimeFrame(time.day)}
                      variant="custom"
                    >
                      {time.name}
                    </Button>
                    {time.day === activeTimeFrame ? (
                      <motion.div className="absolute bottom-0 left-0 right-0 z-0 h-full rounded-3xl bg-accent/10" />
                    ) : null}
                  </div>
                ))
              : null}
          </div>
        </div>

        <OrderStatusWidget
          order={orderDataRange}
          timeFrame={activeTimeFrame}
          allowedStatus={[
            'pending',
            'processing',
            'complete',
            'cancel',
            // 'out-for-delivery',
          ]}
        />
      </div>

      <RecentOrders
        className="col-span-full"
        //@ts-ignore
        orders={data?.orders?.data!}
        paginatorInfo={data?.orders?.paginatorInfo!}
        title={t('table:recent-order-table-title')}
        onPagination={handlePagination}
        searchElement={
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
            className="hidden max-w-sm sm:inline-block [&button]:top-0.5"
            inputClassName="!h-10"
          />
        }
      />
      <div className="lg:col-span-full 2xl:col-span-8">
        <ColumnChart
          widgetTitle={t('common:sale-history')}
          colors={['#6073D4']}
          series={salesByYear}
          categories={[
            t('common:january'),
            t('common:february'),
            t('common:march'),
            t('common:april'),
            t('common:may'),
            t('common:june'),
            t('common:july'),
            t('common:august'),
            t('common:september'),
            t('common:october'),
            t('common:november'),
            t('common:december'),
          ]}
        />
      </div>

      <PopularProductList
        //@ts-ignore
        products={data?.popularProducts!}
        title={t('table:popular-products-table-title')}
        className="lg:col-span-1 lg:col-start-2 lg:row-start-5 2xl:col-span-4 2xl:col-start-auto 2xl:row-start-auto"
      />

      <LowStockProduct
        // @ts-ignore
        products={data?.lowStockProducts!}
        title={'text-low-stock-products'}
        paginatorInfo={withdraws?.withdraws?.paginatorInfo}
        onPagination={handlePagination}
        className="col-span-full"
        searchElement={
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
            className="hidden max-w-sm sm:inline-block"
            inputClassName="!h-10"
          />
        }
      />

      <TopRatedProducts
        products={data?.topRatedProducts!}
        title={'text-most-rated-products'}
        className="lg:col-span-1 lg:col-start-1 lg:row-start-5 2xl:col-span-5 2xl:col-start-auto 2xl:row-start-auto 2xl:me-20"
      />
      <ProductCountByCategory
        products={data?.categoryWiseProduct!}
        title={'text-most-category-products'}
        className="col-span-full 2xl:col-span-7 2xl:ltr:-ml-20 2xl:rtl:-mr-20"
      />

      <WithdrawTable
        withdraws={withdraws?.withdraws as WithdrawPaginator}
        paginatorInfo={withdraws?.withdraws?.paginatorInfo as PaginatorInfo}
        onPagination={handlePagination}
        title={t('table:withdraw-table-title')}
        className="col-span-full"
      />
    </div>
  );
}
