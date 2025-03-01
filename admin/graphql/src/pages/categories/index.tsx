import CategoryList from '@/components/category/category-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useCategoriesQuery } from '@/graphql/categories.graphql';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import TypeFilter from '@/components/category/type-filter';
import {
  CategoryPaginator,
  QueryCategoriesOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import PageHeading from '@/components/common/page-heading';

export default function Categories() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useCategoriesQuery({
    variables: {
      language: locale,
      first: 10,
      orderBy: [
        {
          column: QueryCategoriesOrderByColumn.CreatedAt,
          order: SortOrder.Desc,
        },
      ],
      page: 1,
      parent: null,
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
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <PageHeading title={t('form:input-label-categories')} />
          </div>

          <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-3/4">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-name')}
            />
            <TypeFilter refetch={refetch} className="md:ms-6" />

            {locale === Config.defaultLanguage && (
              <LinkButton
                href={`${Routes.category.create}`}
                className="h-12 w-full md:w-auto md:ms-6"
              >
                <span className="block md:hidden xl:block">
                  + {t('form:button-label-add-categories')}
                </span>
                <span className="hidden md:block xl:hidden">
                  + {t('form:button-label-add')}
                </span>
              </LinkButton>
            )}
          </div>
        </div>
      </Card>

      <CategoryList
        categories={data?.categories as CategoryPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Categories.authenticate = {
  permissions: adminOnly,
};
Categories.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
