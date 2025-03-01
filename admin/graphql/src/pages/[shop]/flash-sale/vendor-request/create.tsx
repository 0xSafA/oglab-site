import CreateOrUpdateVendorProductsRequestFlashSaleForm from '@/components/flash-sale/vendor-request/flash-sale-vendor-product-request-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useMeQuery } from '@/graphql/me.graphql';
import { useRouter } from 'next/router';
import { useShopQuery, useMyShopsQuery } from '@/graphql/shops.graphql';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';

export default function VendorProductsRequestForFlashSale() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
  } = useRouter();
  const { permissions } = getAuthCredentials();

  const { data: myShop, loading, error } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: { slug: shop as string },
    fetchPolicy: 'network-only',
  });
  const shopId = shopData?.shop?.id!;

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <div className="flex pb-5 border-b border-dashed border-border-base md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:create-new-vendor-request')}
        </h1>
      </div>
      <CreateOrUpdateVendorProductsRequestFlashSaleForm />
    </>
  );
}
VendorProductsRequestForFlashSale.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
VendorProductsRequestForFlashSale.Layout = ShopLayout;
export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
