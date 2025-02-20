import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { adminOnly } from '@/utils/auth-utils';
import { useTermsConditionQuery } from '@/graphql/terms.graphql';
import TermsAndConditionsDetails from '@/components/terms/details-view';
import { TermsAndConditions } from '__generated__/__types__';

const TermsAndConditionsPage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();

  const { data, loading, error } = useTermsConditionQuery({
    variables: {
      slug: query.termSlug as string,
      language: locale as string,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <TermsAndConditionsDetails
      termsAndConditions={data?.termsCondition as TermsAndConditions}
    />
  );
};

TermsAndConditionsPage.authenticate = {
  permissions: adminOnly,
};
TermsAndConditionsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default TermsAndConditionsPage;
