import ShopLayout from '@/components/layouts/shop';
import StoreNoticeCreateOrUpdateForm from '@/components/store-notice/store-notice-form';
import { useTranslation } from 'next-i18next';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { useRouter } from 'next/router';

export default function CreateStoreNotice() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-create-store-notice')}
        </h1>
      </div>
      <StoreNoticeCreateOrUpdateForm />
    </>
  );
}
CreateStoreNotice.authenticate = {
  permissions: adminAndOwnerOnly,
};
CreateStoreNotice.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
