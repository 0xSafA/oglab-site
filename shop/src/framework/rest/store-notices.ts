import { StoreNoticePaginator, StoreNoticeQueryOptions } from '@/types';
import { useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useStoreNotices = (options: Partial<StoreNoticeQueryOptions>) => {
  const { data, error, isLoading } = useQuery<StoreNoticePaginator, Error>(
    [API_ENDPOINTS.STORE_NOTICES, options],
    ({ queryKey, pageParam }) =>
      client.storeNotice.all(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      retry: false
    }
  );

  return {
    storeNotices: data?.data ?? [],
    error,
    loading: isLoading,
  };
};
