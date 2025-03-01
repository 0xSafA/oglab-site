import ShopLayout from '@/components/layouts/shop';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Config } from '@/config';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import CreateOrUpdateFaqsForm from '@/components/faqs/faqs-form';
import { useFaqQuery } from '@/graphql/faqs.graphql';
import { Routes } from '@/config/routes';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

export default function UpdateFAQsPage() {
  const { t } = useTranslation();
  const { query, locale, replace } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error } = useFaqQuery({
    variables: {
      id: query?.id as string,
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
    replace(Routes.dashboard);
  }

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-store-notice')}
        </h1>
      </div>
      <CreateOrUpdateFaqsForm initialValues={data?.faq} />
    </>
  );
}

UpdateFAQsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

UpdateFAQsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
