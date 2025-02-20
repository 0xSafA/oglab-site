import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import { LIMIT, STORE_OWNER } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import AdminsList from '@/components/user/user-admin-list';
import { useUsersByPermissionQuery } from '@/graphql/user.graphql';
import PageHeading from '@/components/common/page-heading';
export default function PendingVendors() {
  const { t } = useTranslation();

  const { data, loading, error, refetch } = useUsersByPermissionQuery({
    variables: {
      first: LIMIT,
      is_active: false,
      permission: STORE_OWNER,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    refetch({
      page: current,
    });
  }

  return (
    <>
      <Card className="mb-8 flex items-center">
        <div className="w-1/4">
          <PageHeading title={t('text-vendors')} />
        </div>
      </Card>

      <AdminsList
        customers={data?.usersByPermission}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
PendingVendors.authenticate = {
  permissions: adminOnly,
};
PendingVendors.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
