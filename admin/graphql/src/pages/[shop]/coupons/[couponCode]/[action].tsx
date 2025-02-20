import CouponCreateOrUpdateForm from '@/components/coupon/coupon-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useCouponQuery } from '@/graphql/coupons.graphql';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly, getAuthCredentials } from '@/utils/auth-utils';
import { Config } from '@/config';
import ShopLayout from '@/components/layouts/shop';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { Routes } from '@/config/routes';
import { STAFF, STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';

export default function UpdateCouponPage() {
  const { t } = useTranslation();
  const { query, locale } = useRouter();
  const router = useRouter();
  const { role } = getAuthCredentials();

  const { data, loading, error } = useCouponQuery({
    variables: {
      code: query.couponCode as string,
      language:
        query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
    },
  });

  const { data: settingsData, loading: settingsLoading } = useSettingsQuery({
    variables: {
      language: locale!,
    },
  });

  if (loading || settingsLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  (role === STAFF || role === STORE_OWNER || role === SUPER_ADMIN) &&
  settingsData?.settings?.options?.enableCoupons
    ? ' '
    : router.replace(Routes.dashboard);

  return (
    <>
      <div className="flex pb-5 border-b border-dashed border-border-base md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-coupon')}
        </h1>
      </div>
      <CouponCreateOrUpdateForm initialValues={data?.coupon} />
    </>
  );
}

UpdateCouponPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

UpdateCouponPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
