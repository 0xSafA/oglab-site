import ShopLayout from '@/components/layouts/shop';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  adminAndOwnerOnly,
  hasAccess,
} from '@/utils/auth-utils';
import CreateOrUpdateTermsForm from '@/components/terms/terms-form';
import { useRouter } from 'next/router';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { Routes } from '@/config/routes';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import Loader from '@/components/ui/loader/loader';

export default function CreateTermsAndConditionsPage() {
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const { query, locale, replace } = useRouter();
  const { data: myShop, loading: myShopLoading } = useMyShopsQuery();
  const { data: shopData, loading: shopDataLoading } = useShopQuery({
    variables: {
      slug: query?.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;

  const { data: settingsData, loading: settingsLoading } = useSettingsQuery({
    variables: {
      language: locale!,
    },
  });

  if (myShopLoading || shopDataLoading || settingsLoading)
    return <Loader text={t('common:text-loading')} />;

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
          {t('text-create-terms-conditions')}
        </h1>
      </div>
      <CreateOrUpdateTermsForm />
    </>
  );
}

CreateTermsAndConditionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

CreateTermsAndConditionsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
