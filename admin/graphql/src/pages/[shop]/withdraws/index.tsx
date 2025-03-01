import Card from '@/components/common/card';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useWithdrawsQuery } from '@/graphql/withdraws.graphql';
import WithdrawList from '@/components/withdraw/withdraw-list';
import LinkButton from '@/components/ui/link-button';
import ShopLayout from '@/components/layouts/shop';
import { useRouter } from 'next/router';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { WithdrawPaginator } from '../../../../__generated__/__types__';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';

export default function WithdrawsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const {
    query: { shop },
  } = useRouter();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData, loading: fetchingShop } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });

  const shopId = shopData?.shop?.id!;
  const { data, error, refetch } = useWithdrawsQuery({
    skip: !Boolean(shopId),
    variables: {
      shop_id: shopId,
      first: 10,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (fetchingShop) return <Loader text={t('common:text-loading')} />;
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
          <PageHeading title={t('common:sidebar-nav-item-withdraws')} />
        </div>

        <LinkButton
          href={`/${shop}/withdraws/create`}
          className="w-full h-12 md:w-auto md:ms-auto"
        >
          <span>+ {t('form:button-label-add-withdraw')}</span>
        </LinkButton>
      </Card>

      <WithdrawList
        withdraws={data?.withdraws as WithdrawPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
WithdrawsPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
WithdrawsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
