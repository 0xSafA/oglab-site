import Layout from '@/components/layouts/admin';
import { adminOnly } from '@/utils/auth-utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  useFlashSaleQuery,
  useProductsByFlashSaleQuery,
} from '@/graphql/flash_sale.graphql';
import { useRouter } from 'next/router';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import SingleView from '@/components/flash-sale/single-view';
import { FlashSale, Product, ProductPaginator } from '__generated__/__types__';
import FlashSaleProductList from '@/components/flash-sale/flash-sale-product-list';
import { useCallback, useState } from 'react';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const FlashSalePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useFlashSaleQuery({
    variables: {
      slug: query?.slug as string,
      language: locale as string,
    },
  });

  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    refetch,
  } = useProductsByFlashSaleQuery({
    variables: {
      slug: query?.slug as string,
      first: 5,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  const handleSearch = useCallback(
    ({ searchText }: { searchText: string }) => {
      setSearchTerm(searchText);
      refetch({
        search: `name:${searchText?.toLowerCase()}`,
        page: 1,
      });
    },
    [setSearchTerm, refetch]
  );

  const handlePagination = useCallback(
    (current: any) => {
      refetch({
        search: `title:${searchTerm?.toLowerCase()}`,
        page: current,
      });
    },
    [refetch, searchTerm]
  );

  if (loading || productsLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error || productsError)
    return <ErrorMessage message={error?.message || productsError?.message} />;

  return (
    <>
      <SingleView data={data?.flashSale as FlashSale} className="mb-10" />
      <FlashSaleProductList
        products={products?.productsByFlashSale?.data as Product[]}
        type={data?.flashSale?.type as string}
        rate={data?.flashSale?.rate as number}
        paginatorInfo={
          products?.productsByFlashSale
            ?.paginatorInfo as ProductPaginator['paginatorInfo']
        }
        onPagination={handlePagination}
        handleSearch={handleSearch}
      />
    </>
  );
};

FlashSalePage.authenticate = {
  permissions: adminOnly,
};

FlashSalePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});

export default FlashSalePage;
