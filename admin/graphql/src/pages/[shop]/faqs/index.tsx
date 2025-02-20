import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import { SortOrder } from '__generated__/__types__';
import { useFaqsQuery } from '@/graphql/faqs.graphql';
import FaqsLists from '@/components/faqs/faqs-list';
// import { formatSearchParams } from '@/utils/format-search-params';
import { QueryFaqsOrderByColumn } from '@/types/custom-types';
import { LIMIT } from '@/utils/constants';
import PageHeading from '@/components/common/page-heading';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
// import { useMeQuery } from '@/graphql/me.graphql';
import { Routes } from '@/config/routes';
// import Pusher from 'pusher-js';

export default function Faqs() {
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  // const { data: me } = useMeQuery();
  const {
    query: { shop },
    locale,
    replace,
  } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error, refetch } = useFaqsQuery({
    variables: {
      language: locale,
      orderBy: QueryFaqsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      first: LIMIT,
      page: 1,
      shop_id: shopId,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `faq_title:${searchText?.toLowerCase()}`,
      page: 1,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: `faq_title:${searchTerm?.toLowerCase()}`,
      page: current,
    });
  }

  const { data: faqs, paginatorInfo } = data?.faqs!;

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop?.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('form:form-title-faqs')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`/${shop}${Routes.faqs.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('form:button-label-add-faq')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <FaqsLists
        faqs={faqs}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

Faqs.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

Faqs.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
