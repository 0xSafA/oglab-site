import type { ShopQueryOptions } from '@/types';
import {
  useShopsQuery,
  useShopQuery,
  useNearShopsQuery,
  useCreateShopMaintenanceEventMutation,
  CreateShopMaintenanceEventDocument,
} from './gql/shops.graphql';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import { CreateShopMaintenanceEventInput } from '__generated__/__types__';

export function useShops(options?: Partial<ShopQueryOptions>) {
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useShopsQuery({
    variables: {
      is_active: true,
    },
    notifyOnNetworkStatusChange: true,
  });

  function handleLoadMore() {
    if (data?.shops?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.shops?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }
  return {
    shops: data?.shops?.data ?? [],
    paginatorInfo: data?.shops?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.shops?.paginatorInfo?.hasMorePages),
  };
}

export const useShop = ({
  slug,
  enabled,
}: {
  slug: string;
  enabled?: boolean;
}) => {
  const { data, loading, error } = useShopQuery({
    variables: {
      slug: slug,
    },
    skip: !enabled,
    notifyOnNetworkStatusChange: true,
  });
  return {
    data: data?.shop! ?? {},
    isLoading: loading,
    error,
  };
};

export const useGetSearchNearShops = ({
  lat,
  lng,
}: {
  lat: string;
  lng: string;
}) => {
  const {
    data,
    loading: isLoading,
    error,
  } = useNearShopsQuery({
    variables: {
      lat: lat,
      lng: lng,
    },
    notifyOnNetworkStatusChange: true,
  });

  return {
    data: data?.findShopDistance,
    isLoading,
    error,
  };
};

export function useShopMaintenanceEvent() {
  const router = useRouter();
  const { reload } = router;
  const [createShopMaintenanceEventMutation, { data, loading, error }] =
    useCreateShopMaintenanceEventMutation({
      onCompleted: () => {
        setTimeout(() => {
          reload();
        }, 1000);
      },
    });
  function createShopMaintenanceEventRequest(
    input: CreateShopMaintenanceEventInput,
  ) {
    createShopMaintenanceEventMutation({
      variables: {
        input,
      },
    });
  }

  return {
    createShopMaintenanceEventRequest,
    isLoading: loading,
  };
}
