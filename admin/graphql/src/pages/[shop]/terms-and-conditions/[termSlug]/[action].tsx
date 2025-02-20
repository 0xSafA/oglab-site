import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Config } from '@/config';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  adminAndOwnerOnly,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useTermsConditionQuery } from '@/graphql/terms.graphql';
import CreateOrUpdateTermsForm from '@/components/terms/terms-form';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { useSettingsQuery } from '@/graphql/settings.graphql';

export default function UpdateTermsAndConditionsPage() {
  const { t } = useTranslation();
  const { query, locale, replace } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop, loading: myShopLoading } = useMyShopsQuery();
  const { data: shopData, loading: shopDataLoading } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error } = useTermsConditionQuery({
    variables: {
      slug: query.termSlug as string,
      language:
        query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
    },
  });

  const { data: settingsData, loading: settingsLoading } = useSettingsQuery({
    variables: {
      language: locale!,
    },
  });

  if (loading || myShopLoading || shopDataLoading || settingsLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  let currentUser = 'vendor';

  if (currentUser === 'vendor') {
    const isEnableTermsRoute = settingsData?.settings?.options?.enableTerms;
    const routePermission = isEnableTermsRoute ? adminAndOwnerOnly : adminOnly;

    const hasPermission = hasAccess(routePermission, permissions);
    const vendorHasShop =
      myShop?.me?.shops?.map((shop: any) => shop?.id).includes(shopId) ?? true;

    if (!hasPermission) {
      replace(Routes?.dashboard);
    } else {
      vendorHasShop ? '' : replace(Routes?.dashboard);
    }
  }

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-store-notice')}
        </h1>
      </div>
      <CreateOrUpdateTermsForm initialValues={data?.termsCondition} />
    </>
  );
}

UpdateTermsAndConditionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

UpdateTermsAndConditionsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
