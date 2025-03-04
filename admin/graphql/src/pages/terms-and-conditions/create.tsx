import Layout from '@/components/layouts/admin';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import CreateOrUpdateTermsForm from '@/components/terms/terms-form';

export default function CreateTermsAndConditionsPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
        {t('text-create-terms-conditions')}
        </h1>
      </div>
      <CreateOrUpdateTermsForm />
    </>
  );
}

CreateTermsAndConditionsPage.authenticate = {
  permissions: adminOnly,
};

CreateTermsAndConditionsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
