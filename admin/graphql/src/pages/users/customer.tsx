import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { CUSTOMER, LIMIT } from '@/utils/constants';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useUsersByPermissionQuery } from '@/graphql/user.graphql';
import AdminsList from '@/components/user/user-admin-list';
import PageHeading from '@/components/common/page-heading';

export default function CustomersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useUsersByPermissionQuery({
    variables: {
      first: LIMIT,
      // is_active: true,
      permission: CUSTOMER,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `%${searchText}%`,
      page: 1,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: `%${searchTerm}%`,
      page: current,
    });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('form:input-label-customers')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 md:w-3/4 md:flex-row md:space-y-0 md:ms-auto xl:w-1/2">
          <Search onSearch={handleSearch} />
          <LinkButton
            href={`${Routes.user.create}`}
            className="h-12 w-full md:w-auto md:ms-6"
          >
            <span>+ {t('form:button-label-add-customer')}</span>
          </LinkButton>
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
CustomersPage.authenticate = {
  permissions: adminOnly,
};
CustomersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
