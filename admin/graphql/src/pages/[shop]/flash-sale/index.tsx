import Card from '@/components/common/card';
import Search from '@/components/common/search';
import { useState } from 'react';
import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import {
  FlashSale,
  FlashSalePaginator,
  SortOrder,
} from '__generated__/__types__';
import { useMeQuery } from '@/graphql/me.graphql';
import { useShopQuery } from '@/graphql/shops.graphql';
import { useFlashSalesQuery } from '@/graphql/flash_sale.graphql';
import VendorFlashSaleLists from '@/components/flash-sale/flash-sale-list-for-vendors';
import PageHeading from '@/components/common/page-heading';

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

  const {
    data: flashSale,
    loading,
    error,
    refetch,
  } = useFlashSalesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: 'created_at',
      sortedBy: SortOrder.Desc,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  const { data: shopData } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `title:${searchText?.toLowerCase()}`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      search: `title:${searchTerm?.toLowerCase()}`,
      page: current,
    });
  }

  if (
    !hasAccess(adminOnly, permissions) &&
    !me?.me?.shops?.map((shop: any) => shop?.id).includes(shopData?.shop?.id) &&
    me?.me?.managed_shop?.id != shopData?.shop?.id
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:w-1/3 md:mb-0">
          <PageHeading title={t('form:form-title-currently-flash-sales')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-2/4">
          <Search onSearch={handleSearch} />
        </div>
      </Card>

      <VendorFlashSaleLists
        flashSale={flashSale?.flashSales?.data as FlashSale[]}
        paginatorInfo={
          flashSale?.flashSales
            ?.paginatorInfo as FlashSalePaginator['paginatorInfo']
        }
        onPagination={handlePagination}
        refetch={refetch}
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
