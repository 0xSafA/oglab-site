import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import {
  adminOnly,
  getAuthCredentials,
  adminAndOwnerOnly,
  adminOwnerAndStaffOnly,
  hasAccess,
} from '@/utils/auth-utils';
import { useTermsConditionQuery } from '@/graphql/terms.graphql';
import TermsAndConditionsDetails from '@/components/terms/details-view';
import { TermsAndConditions } from '__generated__/__types__';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { Routes } from '@/config/routes';

const TermsAndConditionsPage = () => {
  const { query, locale, replace } = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();

  const { data, loading, error } = useTermsConditionQuery({
    variables: {
      slug: query.termSlug as string,
      language: locale as string,
    },
  });
  const { data: myShop, loading: myShopLoading } = useMyShopsQuery();
  const { data: shopData, loading: shopDataLoading } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;

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
    <TermsAndConditionsDetails
      termsAndConditions={data?.termsCondition as TermsAndConditions}
    />
  );
};

TermsAndConditionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
TermsAndConditionsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default TermsAndConditionsPage;
