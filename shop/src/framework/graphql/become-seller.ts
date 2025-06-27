import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from './client';
import {
  BecameSellerDocument,
  BecameSellerQuery,
} from './gql/become-seller.graphql';
import { SettingsDocument } from './gql/settings.graphql';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const apolloClient = initializeApollo();

  try {
    await apolloClient.query({
      query: SettingsDocument,
      variables: {
        language: locale,
      },
    });

    const { data } = await apolloClient.query<BecameSellerQuery>({
      query: BecameSellerDocument,
      variables: {
        language: locale,
      },
    });

    return addApolloState(apolloClient, {
      props: {
        data: data.becameSeller,
        ...(await serverSideTranslations(locale!, ['common'])),
      },
    });
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
