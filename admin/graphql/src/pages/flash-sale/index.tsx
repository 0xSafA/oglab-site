import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import FlashSaleList from '@/components/flash-sale/flash-sale-list';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { useFlashSalesQuery } from '@/graphql/flash_sale.graphql';
import { adminOnly } from '@/utils/auth-utils';
import { LIMIT } from '@/utils/constants';
import { FlashSalePaginator } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function FlashSales() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useFlashSalesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: 'created_at',
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: `title:${searchText?.toLowerCase()}`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      search: `title:${searchTerm?.toLowerCase()}`,
      page: current,
    });
  }

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="mb-4 md:mb-0 xl:w-1/4">
          <PageHeading title={t('form:form-title-flash-sale-campaigns')} />
        </div>

        <div className="flex flex-col items-center w-full space-y-4 ms-auto md:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={Routes?.flashSale?.create}
              className="w-full h-12 md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('text-non-translated-title')} {t('text-campaign')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <FlashSaleList
        flashSale={data?.flashSales?.data as FlashSalePaginator['data']}
        onPagination={handlePagination}
        paginatorInfo={
          data?.flashSales?.paginatorInfo as FlashSalePaginator['paginatorInfo']
        }
        refetch={refetch}
      />
    </>
  );
}

FlashSales.authenticate = {
  permissions: adminOnly,
};

FlashSales.Layout = Layout;
export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
