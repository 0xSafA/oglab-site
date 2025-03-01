import AdminLayout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Card from '@/components/common/card';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import BecameSellerInfoForm from '@/components/become-seller/became-seller-form';
import { useBecameSellerQuery } from '@/graphql/became-seller.graphql';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { Settings } from '__generated__/__types__';
import { BackToTopProvider } from '@/components/ui/back-to-top/back-to-top-context';

export default function BecameSeller() {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const {
    data: becameSellerData,
    loading,
    error,
  } = useBecameSellerQuery({
    variables: {
      language: locale!,
    },
  });

  const {
    data: settings,
    loading: loadingSettings,
    error: errorSettings,
  } = useSettingsQuery({
    variables: {
      language: locale!,
    },
  });

  if (loading || loadingSettings)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col items-center xl:flex-row">
        <div className="mb-4 md:w-1/4 xl:mb-0">
          <h1 className="before:content-'' relative text-lg font-semibold text-heading before:absolute before:-top-0.5 before:h-8 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-8 rtl:before:-right-8 xl:before:w-1">
            How to be a seller? Fill out all the information.
          </h1>
        </div>
      </Card>

      <BackToTopProvider>
        <BecameSellerInfoForm
          becameSellerData={becameSellerData?.becameSeller as any}
          settings={settings?.settings as Settings}
        />
      </BackToTopProvider>
    </>
  );
}
BecameSeller.authenticate = {
  permissions: adminOnly,
};
BecameSeller.Layout = AdminLayout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
