import OwnerLayout from '@/components/layouts/owner';
import { Details } from '@/components/shop-transfer/details';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useMeQuery } from '@/graphql/me.graphql';
import { useOwnershipTransferQuery } from '@/graphql/ownership-transfer.graphql';
import { adminAndOwnerOnly } from '@/utils/auth-utils';
import { OwnershipTransfer } from '__generated__/__types__';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const OwnershipTransferSinglePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { data, loading, error } = useOwnershipTransferQuery({
    variables: {
      transaction_identifier: query?.transaction_identifier as string,
      request_view_type: 'detail',
    },
  });

  const { data: me, loading: meLoading, error: meError } = useMeQuery();

  // Loading control area
  if (loading || meLoading) return <Loader text={t('common:text-loading')} />;
  if (error || meError)
    return <ErrorMessage message={error?.message || meError?.message} />;

  return <Details data={data?.ownershipTransfer as OwnershipTransfer} userId={me?.me?.id as string} />;
};

OwnershipTransferSinglePage.authenticate = {
  permissions: adminAndOwnerOnly,
};

OwnershipTransferSinglePage.Layout = OwnerLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});

export default OwnershipTransferSinglePage;
