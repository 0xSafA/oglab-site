import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import { useState } from 'react';
import Search from '@/components/common/search';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import LinkButton from '@/components/ui/link-button';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useStoreNoticesQuery } from '@/graphql/store-notice.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import StoreNoticeList from '@/components/store-notice/store-notice-list';
import { LIMIT } from '@/utils/constants';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { Permission, StoreNoticePaginator } from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';
import { formatSearchParams } from '@/utils/format-search-params';
export default function StoreNotice() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    query: { shop },
  } = useRouter();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: { slug: shop as string },
  });
  const shopId = shopData?.shop?.id!;

  const isSuperAdmin = permissions?.includes(
    Permission.SuperAdmin.toLocaleLowerCase()
  );

  const { data, loading, error, refetch } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      sortedBy: 'DESC',
      page: 1,
      search: formatSearchParams({
        shops: shop as string,
      }),
      orderBy: 'effective_from',
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      text: `%${searchText}%`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      text: `%${searchTerm}%`,
      page: current,
    });
  }

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/3">
          <PageHeading title={t('form:input-label-store-notices')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          {locale === Config.defaultLanguage && !isSuperAdmin && (
            <LinkButton
              href={`/${shop}/store-notices/create`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('form:button-label-add-store-notice')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <StoreNoticeList
        storeNotices={data?.storeNotices as StoreNoticePaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

StoreNotice.authenticate = {
  permissions: adminAndOwnerOnly,
};
StoreNotice.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
