import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import TaxList from '@/components/tax/tax-list';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { useTaxesQuery } from '@/graphql/tax.graphql';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import {
  QueryTaxClassesOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { Routes } from '@/config/routes';
import PageHeading from '@/components/common/page-heading';

export default function TaxesPage() {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useTaxesQuery({
    variables: {
      orderBy: [
        {
          column: QueryTaxClassesOrderByColumn.UpdatedAt,
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
          <PageHeading title={t('form:input-label-taxes')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:flex-row md:space-y-0 xl:w-1/2">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          <LinkButton
            href={`${Routes.tax.create}`}
            className="h-12 w-full md:w-auto md:ms-6"
          >
            <span>+ {t('form:button-label-add-tax')}</span>
          </LinkButton>
        </div>
      </Card>

      <TaxList taxes={data?.taxClasses} refetch={refetch} />
    </>
  );
}
TaxesPage.authenticate = {
  permissions: adminOnly,
};
TaxesPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
