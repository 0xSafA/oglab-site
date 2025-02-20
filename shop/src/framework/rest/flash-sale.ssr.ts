import type {
  FlashSale,
  Product,
  ProductPaginator,
  SingleFlashSale,
} from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import invariant from 'tiny-invariant';
import client from './client';
import { dehydrate } from 'react-query/hydration';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { QueryClient } from 'react-query';
import { SettingsQueryOptions } from '@/types';
import { SHOPS_LIMIT } from '@/lib/constants';

// This function gets called at build time
type ParsedQueryParams = {
  slug: string;
};
export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({
  locales,
  defaultLocale
}) => {
  invariant(locales, 'locales is not defined');
  const { data } = await client?.flashSale?.all({ language: defaultLocale, limit: SHOPS_LIMIT });
  const paths = data?.flatMap((flashSale) =>
    locales?.map((locale) => ({ params: { slug: flashSale?.slug }, locale }))
  );
  return {
    paths,
    fallback: 'blocking',
  };
};

type PageProps = {};

export const getStaticProps: GetStaticProps<
  PageProps,
  ParsedQueryParams
> = async ({ params, locale }) => {
  const queryClient = new QueryClient();

  try {
    return {
      props: {
        ...(await serverSideTranslations(locale!, ['common'])),
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
