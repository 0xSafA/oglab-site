import { GetStaticProps } from 'next';
import { QueryClient, dehydrate } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import client from './client';
import { QueryOptions, SettingsQueryOptions } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();

  try {
    const settingsData = await queryClient.fetchQuery(
      [API_ENDPOINTS.SETTINGS, { language: locale }],
      ({ queryKey }) =>
        client.settings.all(queryKey[1] as SettingsQueryOptions),
    );

    const data = await queryClient.fetchQuery(
      [API_ENDPOINTS.BECAME_SELLER, { language: locale }],
      ({ queryKey }) => client.becomeSeller.get(queryKey[1] as QueryOptions),
    );

    return {
      props: {
        data: {
          ...data,
          page_options: {
            ...data.page_options,
            page_options: {
              ...data.page_options.page_options,
              isMultiCommissionRate: settingsData.options.isMultiCommissionRate,
            },
          },
        },
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
