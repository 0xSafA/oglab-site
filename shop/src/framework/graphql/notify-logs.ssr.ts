import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import { NotifyLogsDocument } from './gql/notify_log.graphql';
import { SettingsDocument } from './gql/settings.graphql';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: SettingsDocument,
    variables: {
      language: locale,
    },
  });
  // await apolloClient.query({
  //   query: NotifyLogsDocument,
  //   variables: {
  //     language: locale,
  //   },
  // });
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  });
};
