import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import FlashSaleProductListForVendor from '@/components/flash-sale/flash-sale-product-list-for-vendor';
import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { Routes } from '@/config/routes';
import { useProductsQuery } from '@/graphql/products.graphql';
import { useShopQuery } from '@/graphql/shops.graphql';
import { useMeQuery } from '@/graphql/me.graphql';
import { Product, ProductPaginator, SortOrder } from '__generated__/__types__';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { QueryProductsOrderByColumn } from '@/types/custom-types';
// import { formatSearchParams } from '@/utils/format-search-params';

export default function VendorFlashSalePage() {
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const { t } = useTranslation();
  const {
    query: { shop },
    locale,
  } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: shopData } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });

  const shopId = shopData?.shop?.id!;

  const { data, loading, error, refetch } = useProductsQuery({
    // skip: !Boolean(shopId),
    variables: {
      language: locale,
      first: 20,
      search: `shop_id: ${shopId}`,
      shop_id: shopId,
      orderBy: QueryProductsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      page: 1,
      flash_sale_builder: Boolean(true),
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `name:${searchText?.toLowerCase()};shop_id: ${shopId}`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      search: `name:${searchTerm?.toLowerCase()};shop_id: ${shopId}`,
      page: current,
    });
  }

  if (
    !hasAccess(adminOnly, permissions) &&
    !me?.me?.shops?.map((shop: any) => shop?.id).includes(shopId) &&
    me?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/3">
          <PageHeading title={t('form:form-title-my-products-flash-sales')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-2/4">
          <Search onSearch={handleSearch} />
        </div>
      </Card>

      <FlashSaleProductListForVendor
        products={data?.products?.data as Product[]}
        paginatorInfo={
          data?.products?.paginatorInfo as ProductPaginator['paginatorInfo']
        }
        onPagination={handlePagination}
      />
    </>
  );
}
VendorFlashSalePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorFlashSalePage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
