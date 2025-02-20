import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Config } from '@/config';
import { useRouter } from 'next/router';
import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
// import { useShopQuery } from '@/graphql/shops.graphql';
// import { useMeQuery } from '@/graphql/me.graphql';
import CreateOrUpdateVendorProductsRequestFlashSaleForm from '@/components/flash-sale/vendor-request/flash-sale-vendor-product-request-form';
import { useFlashSaleRequestQuery } from '@/graphql/flash_sale_requests.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

export default function UpdateFlashSaleProductRequestsPage() {
  const { t } = useTranslation();
  const { query, locale, replace } = useRouter();
  const { permissions } = getAuthCredentials();
  // const { data: me } = useMeQuery();
  // const { data: shopData } = useShopQuery({
  //   variables: {
  //     slug: query?.shop as string,
  //   },
  // });
  // const shopId = shopData?.id!;

  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;

  const {
    data: flashSaleRequest,
    loading,
    error,
  } = useFlashSaleRequestQuery({
    variables: {
      id: query.id as string,
      language:
        query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  // if (
  //   !hasAccess(adminOnly, permissions) &&
  //   !me?.shops?.map((shop) => shop.id).includes(shopId) &&
  //   me?.managed_shop?.id != shopId
  // ) {
  //   router.replace(Routes.dashboard);
  // }

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    replace(Routes.dashboard);
  }

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-store-notice')}
        </h1>
      </div>
      <CreateOrUpdateVendorProductsRequestFlashSaleForm
        initialValues={flashSaleRequest}
      />
    </>
  );
}
UpdateFlashSaleProductRequestsPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
UpdateFlashSaleProductRequestsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
