import SingleViewVendorRequest from '@/components/flash-sale/vendor-request/single-view-vendor-request';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  FlashSale,
  ProductPaginator,
  FlashSaleRequests,
} from '__generated__/__types__';
import { adminOnly, getAuthCredentials } from '@/utils/auth-utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import FlashSaleProductList from '@/components/flash-sale/flash-sale-product-list';
import { useCallback, useState } from 'react';
import {
  useFetchFlashSaleRequestedProductsQuery,
  useFlashSaleRequestQuery,
} from '@/graphql/flash_sale_requests.graphql';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const VendorRequestFlashSaleSinglePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: flashSaleRequest,
    loading,
    error,
    refetch,
  } = useFlashSaleRequestQuery({
    variables: {
      id: query?.id as string,
      language: locale as string,
    },
    fetchPolicy: 'network-only',
  });

  const {
    data: products,
    loading: loadingProducts,
    error: errorProducts,
  } = useFetchFlashSaleRequestedProductsQuery({
    variables: {
      first: 5,
      vendor_request_id: query?.id as string,
      page: 1,
      // name: searchTerm,
    },
    fetchPolicy: 'network-only',
  });

  const handleSearch = useCallback(
    ({ searchText }: { searchText: string }) => {
      setSearchTerm(searchText);
      setPage(1);
    },
    [setSearchTerm, setPage],
  );

  const handlePagination = useCallback(
    (current: any) => {
      setPage(current);
    },
    [setPage],
  );

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <SingleViewVendorRequest
        data={flashSaleRequest?.flashSaleRequest as FlashSaleRequests}
      />
      <div className="relative overflow-hidden bg-white mb-5">
        <FlashSaleProductList
          products={
            products?.fetchRequestedProducts?.data as ProductPaginator['data']
          }
          paginatorInfo={
            products?.fetchRequestedProducts
              ?.paginatorInfo as ProductPaginator['paginatorInfo']
          }
          onPagination={handlePagination}
          handleSearch={handleSearch}
          type={flashSaleRequest?.flashSaleRequest?.flash_sale?.type as string}
          rate={flashSaleRequest?.flashSaleRequest?.flash_sale?.rate as number}
        />
      </div>
    </>
  );
};

VendorRequestFlashSaleSinglePage.authenticate = {
  permissions: adminOnly,
};
VendorRequestFlashSaleSinglePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table'])),
  },
});

export default VendorRequestFlashSaleSinglePage;
