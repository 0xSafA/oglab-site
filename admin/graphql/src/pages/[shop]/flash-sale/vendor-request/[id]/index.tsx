import SingleViewVendorRequest from '@/components/flash-sale/vendor-request/single-view-vendor-request';
import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useShopQuery } from '@/graphql/shops.graphql';
import { FlashSaleRequests, ProductPaginator } from '__generated__/__types__';
import { adminOwnerAndStaffOnly, getAuthCredentials } from '@/utils/auth-utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import {
  useFetchFlashSaleRequestedProductsQuery,
  useFlashSaleRequestQuery,
} from '@/graphql/flash_sale_requests.graphql';
import FlashSaleProductListForVendor from '@/components/flash-sale/flash-sale-product-list-for-vendor';
import { useCallback, useState } from 'react';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const VendorRequestFlashSaleSinglePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { permissions } = getAuthCredentials();

  // const { data: shopData } = useShopQuery({
  //   variables: {
  //     slug: query?.shop as string,
  //   },
  // });

  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });

  const {
    data: flashSaleRequest,
    loading,
    error,
    refetch,
  } = useFlashSaleRequestQuery({
    variables: {
      id: query?.id as string,
      language: locale as string,
      // TODO : needed
      // shop_id: shopData?.shop?.id!,
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
        <div className="p-10">
          <h3 className="mb-5 text-xl font-semibold text-muted-black">
            Requested products.
          </h3>
          <FlashSaleProductListForVendor
            // products={products}
            // paginatorInfo={paginatorInfo}
            products={
              products?.fetchRequestedProducts?.data as ProductPaginator['data']
            }
            paginatorInfo={
              products?.fetchRequestedProducts
                ?.paginatorInfo as ProductPaginator['paginatorInfo']
            }
            onPagination={handlePagination}
          />
        </div>
      </div>
    </>
  );
};

VendorRequestFlashSaleSinglePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorRequestFlashSaleSinglePage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table'])),
  },
});

export default VendorRequestFlashSaleSinglePage;
