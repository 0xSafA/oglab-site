import Card from '@/components/common/card';
import Search from '@/components/common/search';
import CouponList from '@/components/coupon/coupon-list';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LIMIT, STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly, getAuthCredentials } from '@/utils/auth-utils';
import { STAFF } from '@/utils/constants';
import { SortOrder } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';
import ShopLayout from '@/components/layouts/shop';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useShopQuery } from '@/graphql/shops.graphql';
import { useCouponsQuery } from '@/graphql/coupons.graphql';
import { QueryTermsOrderByColumn } from '@/types/custom-types';

export default function Coupons() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { role } = getAuthCredentials();
  const {
    query: { shop },
  } = useRouter();

  const { data: shopData, loading: shopDataLoading } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });

  const shopId = shopData?.shop?.id!;

  const { data: settings, loading: settingsLoading } = useSettingsQuery({
    variables: {
      language: locale!,
    },
  });

  const { data, loading, error, refetch } = useCouponsQuery({
    variables: {
      language: locale,
      first: LIMIT,
      shop_id: shopId,
      page: 1,
      orderBy: QueryTermsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
    },
    fetchPolicy: 'network-only',
  });

  if (loading || shopDataLoading || settingsLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `code:${searchText?.toLowerCase()}`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      search: `code:${searchTerm?.toLowerCase()}`,
      page: current,
    });
  }

  const { data: coupons, paginatorInfo } = data?.coupons!;

  (role === STAFF || role === STORE_OWNER || role === SUPER_ADMIN) &&
  settings?.settings?.options?.enableCoupons
    ? ' '
    : router.replace(Routes.dashboard);

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="mb-4 md:w-1/4 md:mb-0">
          <PageHeading title={t('form:input-label-coupons')} />
        </div>

        <div className="flex flex-col items-center w-full space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-1/2">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-code')}
          />
          {locale === Config.defaultLanguage && role !== STAFF && (
            <LinkButton
              href={`/${shop}/coupons/create`}
              className="w-full h-12 md:w-auto md:ms-6"
            >
              <span>+ {t('form:button-label-add-coupon')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <CouponList
        coupons={coupons}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

Coupons.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
Coupons.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
