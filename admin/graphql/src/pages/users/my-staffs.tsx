import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import { LIMIT } from '@/utils/constants';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import StaffList from '@/components/shop/staff-list';
import { useMyStaffsQuery } from '@/graphql/user.graphql';
import PageHeading from '@/components/common/page-heading';

export default function MyStaffsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useMyStaffsQuery({
    variables: {
      first: LIMIT,
      page: 1,
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
          <PageHeading title={t('form:input-label-my-staffs')} />
        </div>

        <div className="flex w-full items-center ms-auto md:w-2/4">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />
        </div>
      </Card>

      <StaffList
        staffs={data?.myStaffs}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
MyStaffsPage.authenticate = {
  permissions: adminOnly,
};
MyStaffsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
