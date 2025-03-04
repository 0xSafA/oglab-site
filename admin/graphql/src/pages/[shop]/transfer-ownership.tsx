import ShopLayout from '@/components/layouts/shop';
import TransferShopOwnershipForm from '@/components/shop/transfer-ownership-shop-form';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import NotFound from '@/components/ui/not-found';
import { Routes } from '@/config/routes';
import { OwnerShipTransferStatus } from '@/types/custom-types';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { OWNERSHIP_TRANSFER_STATUS } from '@/utils/cartesian';
import { Shop, User } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useShopQuery } from '@/graphql/shops.graphql';
import { useMeQuery } from '@/graphql/me.graphql';
import { LIMIT, STORE_OWNER } from '@/utils/constants';
import { useUsersByPermissionQuery } from '@/graphql/user.graphql';

export default function TransferShopOwnershipPage() {
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const { query } = useRouter();
  const { shop } = query;
  const { t } = useTranslation();



  const { data: shopData, loading, error } = useShopQuery({
    
    variables: {
      slug: router.query.shop as string,
    },
  });

  console.log(shopData);
  const { data, loading: vendorLoading, error:vendorError , refetch } = useUsersByPermissionQuery({
    variables: {
      first: LIMIT,
      page: 1,
      is_active: true,
      permission: STORE_OWNER,
      shop_id: shopData?.shop?.id,
      exclude: me?.me?.id
    },
    fetchPolicy: 'network-only',
  });


//   const {
//     vendors,
//     // loading: vendorLoading,
//     error: vendorError,
//   } = useVendorsQuery({
//     is_active: true,
//     shop_id: data?.id!,
//     // exclude: data?.owner_id,
//   });

  if (loading || vendorLoading)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (vendorError) return <ErrorMessage message={vendorError.message} />;
  if (
    !hasAccess(adminOnly, permissions) &&
    !me?.me?.shops?.map((shop) => shop?.id).includes(shopData?.shop?.id) &&
    me?.me?.managed_shop?.id != shopData?.shop?.id
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <div className="flex py-5 border-b border-dashed border-border-base sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-transfer-shop-ownership')}
        </h1>
      </div>
      {OWNERSHIP_TRANSFER_STATUS?.includes(
        shopData?.shop?.ownership_history?.status as OwnerShipTransferStatus,
      ) ? (
        <NotFound
          className="mt-10"
          text={`Shop transfer already in ${shopData?.shop?.ownership_history?.status} state! ✋`}
        />
      ) : (
        <TransferShopOwnershipForm shop={shopData?.shop as Shop} vendors={data?.usersByPermission?.data as User[]} />
      )}
    </>
  );
}
TransferShopOwnershipPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
TransferShopOwnershipPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
