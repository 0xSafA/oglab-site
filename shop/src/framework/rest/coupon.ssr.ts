import type {
  CouponQueryOptions,
  SettingsQueryOptions,
  TypeQueryOptions,
} from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { TYPES_PER_PAGE } from './client/variables';
import { LIMIT } from '@/lib/constants';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions),
  );
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPES, { limit: TYPES_PER_PAGE, language: locale }],
    ({ queryKey }) => client.types.all(queryKey[1] as TypeQueryOptions),
  );
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.COUPONS, { language: locale }],
    ({ queryKey }) => client.coupons.all(queryKey[1] as CouponQueryOptions),
  );
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
