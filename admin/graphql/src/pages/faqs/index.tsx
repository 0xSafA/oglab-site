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
import { useFaqsQuery } from '@/graphql/faqs.graphql';
import FaqsLists from '@/components/faqs/faqs-list';
// import { formatSearchParams } from '@/utils/format-search-params';
import { QueryFaqsOrderByColumn } from '@/types/custom-types';
import { LIMIT } from '@/utils/constants';
import PageHeading from '@/components/common/page-heading';
// import Pusher from 'pusher-js';

export default function Faqs() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  // const [message, setMessage] = useState([]);
  // const [orderBy, setOrder] = useState('created_at');
  // const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [searchTerm, setSearchTerm] = useState('');
  // const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFaqsQuery({
    variables: {
      language: locale,
      orderBy: QueryFaqsOrderByColumn.CREATED_AT,
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
      search: `faq_title:${searchText?.toLowerCase()}`,
      page: 1,
      language: locale,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: `faq_title:${searchTerm?.toLowerCase()}`,
      page: current,
      language: locale,
    });
  }

  const { data: faqs, paginatorInfo } = data?.faqs!;

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('form:form-title-faqs')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href="/faqs/create"
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('form:button-label-add-faq')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <FaqsLists
        faqs={faqs}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

Faqs.authenticate = {
  permissions: adminOnly,
};

Faqs.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
