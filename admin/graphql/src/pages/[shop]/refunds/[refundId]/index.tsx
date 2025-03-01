import ShopLayout from '@/components/layouts/shop';
import { useRouter } from 'next/router';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRefundQuery } from '@/graphql/refunds.graphql';
import RefundDetailsView from '@/components/refund/refund-details-view';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

export default function RefundDetailsPage() {
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

  const { data, loading, error } = useRefundQuery({
    variables: {
      id: query.refundId as string,
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

  return <RefundDetailsView refund={data?.refund} canChangeStatus={false} />;
}
RefundDetailsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
RefundDetailsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
