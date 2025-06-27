import type {
  RefundQueryOptions
} from '@/types';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRefundReasonsQuery } from './gql/refunds.graphql';

export function useRefundReason(options?: Partial<RefundQueryOptions>) {
  const { query, locale } = useRouter();
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useRefundReasonsQuery({
    variables: {
      language: locale,
      first: options?.limit,
    },
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.refundReasons?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.refundReasons?.paginatorInfo?.currentPage + 1,
          // first: limit,
        },
      });
    }
  }
  return {
    refundReasons: data?.refundReasons?.data ?? [],
    paginatorInfo: data?.refundReasons?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.refundReasons?.paginatorInfo?.hasMorePages),
  };
}