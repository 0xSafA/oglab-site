import type { TermsAndConditionsQueryOptions } from '@/types';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTermsAndConditionsQuery } from './gql/terms_and_conditions.graphql';
import { formatSearchParams } from './utils/query-helpers';

export function useTermsAndConditions({
  type,
  issued_by,
  limit,
  shop_id,
  is_approved,
  ...params
}: Partial<TermsAndConditionsQueryOptions>) {
  const { locale } = useRouter();
  const option = {
    language: locale,
    first: limit,
    is_approved: is_approved,
    search: `type:${type};${formatSearchParams({ issued_by })}`,
    shop_id: shop_id,
  };
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useTermsAndConditionsQuery({
    variables: option,
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.termsConditions?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.termsConditions?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }
  return {
    termsAndConditions: data?.termsConditions?.data ?? [],
    paginatorInfo: data?.termsConditions?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.termsConditions?.paginatorInfo?.hasMorePages),
  };
}
