import Layout from '@/components/layouts/admin';
import RefundPolicyDetails from '@/components/refund-policy/details-view';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useRefundPolicyQuery } from '@/graphql/refund-policies.graphql';
import { adminOnly } from '@/utils/auth-utils';
import { RefundPolicy } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

const ViewRefundPolicyPage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();

  const { data, loading, error } = useRefundPolicyQuery({variables:{
    slug: query.refundPolicySlug as string,
    language: locale as string,
  }});

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <RefundPolicyDetails
      refundPolicy={data?.refundPolicy as RefundPolicy}
    />
  );
};

ViewRefundPolicyPage.authenticate = {
  permissions: adminOnly,
};
ViewRefundPolicyPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default ViewRefundPolicyPage;
