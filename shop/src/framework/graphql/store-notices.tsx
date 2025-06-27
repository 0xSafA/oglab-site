import { StoreNoticeQueryOptions } from '@/types';
import { useRouter } from 'next/router';
import { useStoreNoticesQuery } from './gql/store-notice.graphql';
import { formatSearchParams } from './utils/query-helpers';

export const useStoreNotices = ({
  shops,
}: Partial<StoreNoticeQueryOptions>) => {
  const { locale } = useRouter();
  const { data, loading, error } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: 10,
      orderBy: 'effective_from',
      sortedBy: 'ASC',
      page: 1,
      search: formatSearchParams({ shops }),
    },
    notifyOnNetworkStatusChange: true,
  });

  return {
    storeNotices: data?.storeNotices?.data ?? [],
    error,
    loading,
  };
};
