import type {
  RefundPolicyQueryOptions
} from '@/types';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { useRefundPoliciesQuery } from './gql/refund-policies.graphql';
import { formatSearchParams } from './utils/query-helpers';

export function useRefundPolicies({ target, status, ...params }: Partial<RefundPolicyQueryOptions>) {
  const { query, locale } = useRouter();
  const formattedOptions = {
    language: locale,
    first: params?.limit,
    search: formatSearchParams({ target, status }),
  };

  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useRefundPoliciesQuery({
    variables: formattedOptions,
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.refundPolicies?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.refundPolicies?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }
  return {
    refundPolicies: data?.refundPolicies?.data ?? [],
    paginatorInfo: data?.refundPolicies?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.refundPolicies?.paginatorInfo?.hasMorePages),
  };
}