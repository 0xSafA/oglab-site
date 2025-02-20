import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import TagList from '@/components/tag/tag-list';
import { useTagsQuery } from '@/graphql/tags.graphql';
import { adminOnly } from '@/utils/auth-utils';
import { QueryTagsOrderByColumn, SortOrder } from '__generated__/__types__';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';
import TypeFilter from '@/components/category/type-filter';

export default function Tags() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useTagsQuery({
    variables: {
      first: 10,
      language: locale,
      orderBy: [
        {
          column: QueryTagsOrderByColumn.UpdatedAt,
          order: SortOrder.Desc,
        },
      ],
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      text: `%${searchText}%`,
      page: 1,
    });
  }

  function handlePagination(current: any) {
    refetch({
      text: `%${searchTerm}%`,
      page: current,
    });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-tags')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-1/2">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          <TypeFilter refetch={refetch} className="md:ms-6" />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href="/tags/create"
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="block md:hidden xl:block">
                + {t('form:button-label-add-tag')}
              </span>
              <span className="hidden md:block xl:hidden">
                + {t('form:button-label-add')}
              </span>
            </LinkButton>
          )}
        </div>
      </Card>

      <TagList
        tags={data?.tags}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Tags.authenticate = {
  permissions: adminOnly,
};
Tags.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
