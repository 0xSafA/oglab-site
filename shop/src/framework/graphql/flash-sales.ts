import type {
  FlashSaleQueryOptions
} from '@/types';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { useFlashSaleQuery, useFlashSalesQuery } from './gql/flash_sales.graphql';

export function useFlashSales(options?: Partial<FlashSaleQueryOptions>) {
  const { query, locale } = useRouter();
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useFlashSalesQuery({
    variables: {
      language: locale,
      first: options?.limit,
    },
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.flashSales?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.flashSales?.paginatorInfo?.currentPage + 1,
          // first: limit,
        },
      });
    }
  }
  return {
    flashSales: data?.flashSales?.data ?? [],
    paginatorInfo: data?.flashSales?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.flashSales?.paginatorInfo?.hasMorePages),
  };
}


export function useFlashSale({
  slug,
  language,
}: {
  slug: string;
  language: string;
}) {
  
  const {
    data,
    loading: isLoading,
    error,
  } = useFlashSaleQuery({
    variables: {
      slug,
      language: language,
    },
  });
  return {
    flashSale: data?.flashSale,
    loading: isLoading,
    error,
  };
}