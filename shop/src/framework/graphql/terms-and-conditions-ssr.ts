import { LIMIT_HUNDRED } from '@/lib/constants';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import { GroupsDocument } from './gql/groups.graphql';
import { SettingsDocument } from './gql/settings.graphql';
import { TermsAndConditionsDocument, TermsAndConditionsQuery } from './gql/terms_and_conditions.graphql';
import { formatSearchParams } from './utils/query-helpers';

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
  await apolloClient.query<TermsAndConditionsQuery>({
    query: TermsAndConditionsDocument,
    variables: {
      first: LIMIT_HUNDRED,
      language: rest.defaultLocale,
      is_approved: true,
      search: "type:global;issued_by:Super Admin"
  },
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['terms', 'common'])),
    },
  });
};
