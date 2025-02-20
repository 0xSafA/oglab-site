import Card from '@/components/common/card';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import RefundReasonList from '@/components/refund-reason/refund-reason-list';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { useRefundReasonsQuery } from '@/graphql/refund-reason.graphql';
import { RefundReasonPaginator, SortOrder } from '__generated__/__types__';
import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LIMIT } from '@/utils/constants';
import { formatSearchParams } from '@/utils/format-search-params';
import { QueryRefundReasonsOrderByColumn } from '@/types/custom-types';
import PageHeading from '@/components/common/page-heading';

export default function RefundReasons() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useRefundReasonsQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: QueryRefundReasonsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!loading) {
      refetch({
        search: formatSearchParams({
          name: searchTerm,
        }),
        page,
      });
    }
  }, [searchTerm, page]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:text-refund-reasons')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-2/3 2xl:w-2/4">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.refundReasons.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span>+ {t('form:button-label-add-refund-reason')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <RefundReasonList
        refundReasons={data?.refundReasons as RefundReasonPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
RefundReasons.authenticate = {
  permissions: adminOnly,
};
RefundReasons.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
