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
  adminAndOwnerOnly,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import { SortOrder } from '__generated__/__types__';
import { useTermsAndConditionsQuery } from '@/graphql/terms.graphql';
import TermsAndConditionsLists from '@/components/terms/terms-list';
import { QueryTermsOrderByColumn } from '@/types/custom-types';
import { LIMIT } from '@/utils/constants';
import PageHeading from '@/components/common/page-heading';
// import { useMeQuery } from '@/graphql/me.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { Routes } from '@/config/routes';
import { useSettingsQuery } from '@/graphql/settings.graphql';

export default function TermsAndConditions() {
  // at first fetch related data (e.g. settings, shop, user, terms etc)
  // then check if the current user is admin or vendor
  // if admin then there will be no restrictions
  // if vendor then it will run through permission code

  const { t } = useTranslation();
  const { locale, replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { permissions } = getAuthCredentials();

  const { data: myShop, loading: myShopLoading } = useMyShopsQuery();
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

  const { data, loading, error, refetch } = useTermsAndConditionsQuery({
    variables: {
      language: locale,
      orderBy: QueryTermsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      first: LIMIT,
      page: 1,
      shop_id: shopId,
    },
    fetchPolicy: 'network-only',
  });

  if (loading || myShopLoading || shopDataLoading || settingsLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `title:${searchText?.toLowerCase()}`,
      page: 1,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: `title:${searchTerm?.toLowerCase()}`,
      page: current,
    });
  }

  const { data: terms, paginatorInfo } = data?.termsConditions!;

  let currentUser = 'vendor';

  if (currentUser === 'vendor') {
    const isEnableTermsRoute = settings?.settings?.options?.enableTerms;
    const routePermission = isEnableTermsRoute ? adminAndOwnerOnly : adminOnly;

    const hasPermission = hasAccess(routePermission, permissions);
    const vendorHasShop =
      myShop?.me?.shops?.map((shop: any) => shop?.id).includes(shopId) ?? true;

    if (!hasPermission) {
      replace(Routes?.dashboard);
    } else {
      vendorHasShop ? '' : replace(Routes?.dashboard);
    }
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center lg:flex-row">
        <div className="mb-4 md:mb-0 lg:w-1/4">
          <PageHeading
            className="before:md:hidden"
            title={t('text-terms-conditions')}
          />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 lg:w-2/3 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`/${shop}${Routes.termsAndCondition.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('text-add-terms-conditions')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <TermsAndConditionsLists
        terms={terms}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

TermsAndConditions.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

TermsAndConditions.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
