import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOnly } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { Config } from '@/config';
import { SortOrder } from '__generated__/__types__';
import { useTermsAndConditionsQuery } from '@/graphql/terms.graphql';
import TermsAndConditionsLists from '@/components/terms/terms-list';
import { QueryTermsOrderByColumn } from '@/types/custom-types';
import { LIMIT } from '@/utils/constants';
import PageHeading from '@/components/common/page-heading';

// import Pusher from 'pusher-js';

export default function TermsAndConditions() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  // const [message, setMessage] = useState([]);
  // const [orderBy, setOrder] = useState('created_at');
  // const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useTermsAndConditionsQuery({
    variables: {
      language: locale,
      orderBy: QueryTermsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
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
      search: `title:${searchText?.toLowerCase()}`,
      page: 1,
      language: locale,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: `title:${searchTerm?.toLowerCase()}`,
      page: current,
      language: locale,
    });
  }

  const { data: terms, paginatorInfo } = data?.termsConditions!;

  return (
    <>
      <Card className="flex flex-col items-center mb-8 lg:flex-row">
        <div className="mb-4 lg:mb-0 lg:w-1/4">
          <PageHeading
            className="before:md:hidden"
            title={t('text-terms-conditions')}
          />
        </div>

        <div className="flex flex-col items-center w-full space-y-4 ms-auto lg:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href="/terms-and-conditions/create"
              className="w-full h-12 md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('text-add-terms-conditions')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <TermsAndConditionsLists
        terms={terms}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

TermsAndConditions.authenticate = {
  permissions: adminOnly,
};

TermsAndConditions.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
