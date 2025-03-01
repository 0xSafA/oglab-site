import CreateOrUpdateAttributeForm from '@/components/attribute/attribute-form';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { useRouter } from 'next/router';

export default function CreateAttributePage() {
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
      <div className="flex py-5 border-b border-dashed sm:py-8 border-border-base">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:create-new-attribute')}
        </h1>
      </div>
      <CreateOrUpdateAttributeForm />
    </>
  );
}
CreateAttributePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
CreateAttributePage.Layout = ShopLayout;
export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
