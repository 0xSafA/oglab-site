import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import TypeList from '@/components/group/group-list';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTypesQuery } from '@/graphql/type.graphql';
import { adminOnly } from '@/utils/auth-utils';
import { QueryTypesOrderByColumn, SortOrder } from '__generated__/__types__';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';

export default function GroupsPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data, loading, error, refetch } = useTypesQuery({
    variables: {
      language: locale,
      orderBy: [
        {
          column: QueryTypesOrderByColumn.UpdatedAt,
          order: SortOrder.Desc,
        },
      ],
    },
    fetchPolicy: 'network-only',
  });
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    refetch({
      text: `%${searchText}%`,
    });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-groups')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-1/2">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.type.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="block md:hidden xl:block">
                + {t('form:button-label-add-group')}
              </span>
              <span className="hidden md:block xl:hidden">
                + {t('form:button-label-add')}
              </span>
            </LinkButton>
          )}
        </div>
      </Card>
      <TypeList types={data?.types} refetch={refetch} />
    </>
  );
}
GroupsPage.authenticate = {
  permissions: adminOnly,
};
GroupsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
