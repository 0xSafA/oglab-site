import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import CouponList from '@/components/coupon/coupon-list';
import LinkButton from '@/components/ui/link-button';
import { useCouponsQuery } from '@/graphql/coupons.graphql';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { SortOrder } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';
import { QueryCouponsOrderByColumn } from '@/types/custom-types';

export default function Coupons() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useCouponsQuery({
    variables: {
      language: locale,
      orderBy: QueryCouponsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      first: LIMIT,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `code:${searchText?.toLowerCase()}`,
      page: 1,
      language: locale,
    });
  }

  function handlePagination(current: number) {
    refetch({
      search: `code:${searchTerm?.toLowerCase()}`,
      page: current,
      language: locale,
    });
  }

  const { data: coupons, paginatorInfo } = data?.coupons!;

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

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.coupon.create}`}
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
  permissions: adminOnly,
};

Coupons.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
