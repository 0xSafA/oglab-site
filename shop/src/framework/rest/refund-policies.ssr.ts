import { LIMIT } from '@/lib/constants';
import { RefundPolicyQueryOptions, SettingsQueryOptions } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';

export const getCustomerStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.REFUND_POLICIES, { target: 'customer', status: 'approved', limit: LIMIT, language: locale, }],
    ({ queryKey }) => client.refundPolicies.all(queryKey[1] as RefundPolicyQueryOptions)
  );
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export const getVendorStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.REFUND_POLICIES, { target: 'vendor', status: 'approved', limit: LIMIT, language: locale, }],
    ({ queryKey }) => client.refundPolicies.all(queryKey[1] as RefundPolicyQueryOptions)
  );
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 10,
  };
};

