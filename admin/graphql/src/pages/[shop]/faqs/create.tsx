import CreateOrUpdateFaqsForm from '@/components/faqs/faqs-form';
import ShopLayout from '@/components/layouts/shop';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';

export default function CreateFAQsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { query } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop, loading, error } = useMyShopsQuery();

  const { data: shopData, loading: shopDataLoading } = useShopQuery({
    variables: {
      slug: query?.shop as string,
    },
  });

  const shopId = shopData?.shop?.id!;

  if (loading || shopDataLoading)
    return <Loader text={t('common:text-loading')} />;

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
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('text-non-translated-title')} {t('text-faq')}
        </h1>
      </div>
      <CreateOrUpdateFaqsForm />
    </>
  );
}

CreateFAQsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

CreateFAQsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
