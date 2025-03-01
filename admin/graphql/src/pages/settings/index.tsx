import Layout from '@/components/layouts/admin';
import GeneralSettingsForm from '@/components/settings/general';
import SettingsPageHeader from '@/components/settings/settings-page-header';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useShippingClassesQuery } from '@/graphql/shipping.graphql';
import { useTaxesQuery } from '@/graphql/tax.graphql';
import { adminOnly } from '@/utils/auth-utils';
import { Settings, Shipping } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { locale }: any = useRouter();
  const { data, loading, error } = useSettingsQuery({
    fetchPolicy: 'network-only',
    variables: {
      language: locale,
    },
  });

  const { data: taxes, loading: taxLoading } = useTaxesQuery();
  const { data: shippingClasses, loading: shippingClassesLoading } = useShippingClassesQuery();

  if (loading || taxLoading || shippingClassesLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <SettingsPageHeader pageTitle="form:form-title-settings" />
      <GeneralSettingsForm
        settings={data?.settings! as Settings}
        shippingClasses={shippingClasses?.shippingClasses as Shipping[]}
        taxClasses={taxes?.taxClasses}
      />
    </>
  );
}
SettingsPage.authenticate = {
  permissions: adminOnly,
};
SettingsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
