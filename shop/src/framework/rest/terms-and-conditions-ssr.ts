import { LIMIT_HUNDRED } from '@/lib/constants';
import type { TermsAndConditionsQueryOptions, TypeQueryOptions } from '@/types';
import { SettingsQueryOptions } from '@/types';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { TYPES_PER_PAGE } from './client/variables';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.TYPES, { limit: TYPES_PER_PAGE, language: locale }],
    ({ queryKey }) => client.types.all(queryKey[1] as TypeQueryOptions)
  );
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.TERMS_AND_CONDITIONS, {
      type: 'global',
      issued_by: 'Super Admin',
      limit: LIMIT_HUNDRED,
      is_approved: true,
      language: locale,
    }],
    ({ queryKey }) => client.termsAndConditions.all(queryKey[1] as TermsAndConditionsQueryOptions)
  );
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'terms'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};