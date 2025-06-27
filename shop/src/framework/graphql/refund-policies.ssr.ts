import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import { GroupsDocument } from './gql/groups.graphql';
import { SettingsDocument } from './gql/settings.graphql';
import { LIMIT } from '@/lib/constants';
import { RefundPoliciesDocument, RefundPoliciesQuery } from './gql/refund-policies.graphql';
import { formatSearchParams } from './utils/query-helpers';

export const getCustomerStaticProps: GetStaticProps = async ({ locale }) => {
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
  await apolloClient.query<RefundPoliciesQuery>({
    query: RefundPoliciesDocument,
    variables: {
      language: locale,
      first: LIMIT,
      search: formatSearchParams({ target: 'customer', status: 'approved' }),
    },
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
export const getVendorStaticProps: GetStaticProps = async ({ locale }) => {
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
  await apolloClient.query<RefundPoliciesQuery>({
    query: RefundPoliciesDocument,
    variables: {
      language: locale,
      first: LIMIT,
      search: formatSearchParams({ target: 'vendor', status: 'approved' }),
    },
  });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
