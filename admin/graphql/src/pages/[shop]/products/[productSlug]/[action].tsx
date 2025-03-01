import CreateOrUpdateProductForm from '@/components/product/product-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useProductQuery } from '@/graphql/products.graphql';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { Config } from '@/config';
import { Product } from '../../../../../__generated__/__types__';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
// import Link from '@/components/ui/link';

export default function UpdateProductPage() {
  const { locale, query } = useRouter();
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error } = useProductQuery({
    variables: {
      slug: query.productSlug as string,
      language:
        query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
    },
  });
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
      <div className="flex border-b border-dashed border-border-base py-5 sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-product')}
        </h1>
      </div>
      <CreateOrUpdateProductForm initialValues={data?.product as Product} />
    </>
  );
}
UpdateProductPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
UpdateProductPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
