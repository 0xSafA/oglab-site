import { FlashSale } from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import invariant from 'tiny-invariant';
import { addApolloState, initializeApollo } from './client';
import { FlashSaleDocument, FlashSaleQuery, FlashSalesDocument, FlashSalesQuery } from './gql/flash_sales.graphql';
import { SettingsDocument } from './gql/settings.graphql';
import { LIMIT_HUNDRED, SHOPS_LIMIT } from '@/lib/constants';


type ParsedQueryParams = {
  slug: string;
};
export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({ locales, defaultLocale }) => {
  invariant(!!locales, 'locales is not defined');
  const apolloClient = initializeApollo();
  const { data: { flashSales } } = await apolloClient.query<FlashSalesQuery>({
    query: FlashSalesDocument,
    variables: {
      language: defaultLocale,
      first: SHOPS_LIMIT,
    },
  });
  invariant(flashSales, 'flashSales is not defined');
  const paths = flashSales?.data.flatMap((flashSale) =>
    locales.map((locale) => ({ params: { slug: flashSale.slug! }, locale }))
  );
  return {
    paths,
    fallback: 'blocking',
  };
};

type PageProps = {
  flashSale: FlashSale;
};


export const getStaticProps: GetStaticProps<
  PageProps,
  ParsedQueryParams
> = async ({ params, locale }) => {
  const apolloClient = initializeApollo();
  const { slug } = params!;
  await apolloClient.query({
    query: SettingsDocument,
    variables: {
      language: locale,
      first: LIMIT_HUNDRED
    },
  });
  const {
    data: { flashSale },
  } = await apolloClient.query<FlashSaleQuery>({
    query: FlashSaleDocument,
    variables: {
      slug,
      language: locale,
    },
  });

  if (!flashSale) {
    return {
      notFound: true,
    };
  }
  return addApolloState(apolloClient, {
    props: {
      flashSale,
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60,
  });
};
