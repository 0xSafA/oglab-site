import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import { GroupsDocument } from './gql/groups.graphql';
import { SettingsDocument } from './gql/settings.graphql';
import { LIMIT, LIMIT_HUNDRED } from '@/lib/constants';
import { FaqsDocument, FaqsQuery } from './gql/faqs.graphql';

export const getStaticProps: GetStaticProps = async ({ locale, ...rest }) => {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: SettingsDocument,
    variables: {
      language: locale,
    },
  });
  await apolloClient.query({
    query: GroupsDocument,
    variables: {
      language: locale,
    },
  });
  await apolloClient.query<FaqsQuery>({
    query: FaqsDocument,
    variables: {
      language: locale,
      first: LIMIT_HUNDRED,
      search: 'faq_type:global;issued_by:Super Admin',
    },
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
