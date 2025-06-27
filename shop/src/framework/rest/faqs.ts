import type { FAQS, FaqsPaginator, FaqsQueryOptions } from '@/types';
import { useQuery } from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { useRouter } from 'next/router';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { useInfiniteQuery } from 'react-query';

export function useFAQs(options?: Partial<FaqsQueryOptions>) {
  const { locale } = useRouter();

  const formattedOptions = {
    ...options,
    language: locale,
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<FaqsPaginator, Error>(
    [API_ENDPOINTS.FAQS, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.faqs.all(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    faqs: data?.pages?.flatMap((page) => page.data) ?? [],
    paginatorInfo: Array.isArray(data?.pages)
      ? mapPaginatorData(data?.pages[data.pages.length - 1])
      : null,
    isLoading,
    error,
    isFetching,
    isLoadingMore: isFetchingNextPage,
    loadMore: handleLoadMore,
    hasMore: Boolean(hasNextPage),
  };
}
