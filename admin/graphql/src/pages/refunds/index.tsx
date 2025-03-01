import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { LIMIT } from '@/utils/constants';
import { useRefundsQuery } from '@/graphql/refunds.graphql';
import RefundList from '@/components/refund/refund-list';
import PageHeading from '@/components/common/page-heading';
import Select from '@/components/ui/select/select';
import { useEffect, useState } from 'react';
import { formatSearchParams } from '@/utils/format-search-params';
import { useRefundReasonsQuery } from '@/graphql/refund-reason.graphql';
import { QueryRefundReasonsOrderByColumn } from '@/types/custom-types';
import { SortOrder } from '__generated__/__types__';
import { useRouter } from 'next/router';

export default function RefundsPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  // const [filter, setFilter] = useState('');
  const [reason, setReason] = useState('');
  const { data, loading, error, refetch } = useRefundsQuery({
    variables: {
      first: LIMIT,
      page: 1,
      orderBy: 'created_at',
      sortedBy: 'DESC',
    },
    fetchPolicy: 'network-only',
  });

  const {
    data: refundReason,
    loading: refundReasonLoading,
    error: refundReasonError,
  } = useRefundReasonsQuery({
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
          refund_reason: reason,
        }),
      });
    }
  }, [reason]);

  if (loading || refundReasonLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error || refundReasonError)
    return (
      <ErrorMessage message={error?.message || refundReasonError?.message} />
    );

  function handlePagination(current: any) {
    refetch({
      page: current,
    });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/2">
          <PageHeading title={t('common:sidebar-nav-item-refunds')} />
        </div>
        <div className="w-full md:w-1/2">
          <Select
            options={refundReason?.refundReasons?.data}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.slug}
            placeholder={t('common:filter-by-reason-placeholder')}
            isLoading={loading}
            isSearchable={false}
            isClearable={true}
            onChange={(reason: any) => {
              setReason(reason?.slug!);
            }}
          />
        </div>
      </Card>

      <RefundList
        refunds={data?.refunds}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
RefundsPage.authenticate = {
  permissions: adminOnly,
};
RefundsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
