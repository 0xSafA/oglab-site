import type { FaqsQueryOptions } from '@/types';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { LIMIT, LIMIT_HUNDRED } from '@/lib/constants';
import { useFaqsQuery } from './gql/faqs.graphql';

export function useFAQs({
  issued_by,
  limit,
  shop_id,
  faq_type,
  ...params
}: Partial<FaqsQueryOptions>) {
  const { query, locale } = useRouter();
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useFaqsQuery({
    variables: {
      language: locale,
      first: LIMIT_HUNDRED,
      search: `faq_type:${faq_type};issued_by:${issued_by}`,
      shop_id: shop_id,
    },
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.faqs?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.faqs?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }
  return {
    faqs: data?.faqs?.data ?? [],
    paginatorInfo: data?.faqs?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.faqs?.paginatorInfo?.hasMorePages),
  };
}
