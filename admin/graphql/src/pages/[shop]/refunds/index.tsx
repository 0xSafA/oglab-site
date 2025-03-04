import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
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
import { LIMIT } from '@/utils/constants';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { useRefundsQuery } from '@/graphql/refunds.graphql';
import RefundList from '@/components/refund/refund-list';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';

export default function RefundsPage() {
  const router = useRouter();
  const {
    query: { shop },
  } = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData, loading: fetchingShop } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });

  const shopId = shopData?.shop?.id!;

  const { data, loading, error, refetch } = useRefundsQuery({
    skip: !Boolean(shopId),
    variables: {
      shop_id: Number(shopId),
      first: LIMIT,
      page: 1,
      orderBy: 'updated_at',
      sortedBy: 'DESC',
    },
    fetchPolicy: 'network-only',
  });

  if (loading || fetchingShop)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    refetch({
      page: current,
    });
  }

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="flex flex-col items-center justify-between mb-8 md:flex-row">
        <div className="mb-4 md:w-1/3 md:mb-0">
          <PageHeading title={t('common:sidebar-nav-item-refunds')} />
        </div>
      </Card>

      <RefundList
        refunds={data?.refunds}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
RefundsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
RefundsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
