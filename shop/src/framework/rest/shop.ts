import type {
  Shop,
  ShopMapLocation,
  ShopPaginator,
  ShopQueryOptions,
  ShopMaintenanceEvent,
} from '@/types';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/framework/utils/data-mappers';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

export function useShops(options?: Partial<ShopQueryOptions>) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<ShopPaginator, Error>(
    [API_ENDPOINTS.SHOPS, options],
    ({ queryKey, pageParam }) =>
      client.shops.all(Object.assign({}, queryKey[1], pageParam)),
    {
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    shops: data?.pages?.flatMap((page) => page.data) ?? [],
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

export const useShop = (
  { slug, enabled }: { slug: string; enabled?: boolean },
  options?: any,
) => {
  return useQuery<Shop, Error>(
    [API_ENDPOINTS.SHOPS, { slug }],
    () => client.shops.get(slug),
    { enabled: enabled },
  );
};

export const useSearchNearShops = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { closeModal } = useModalAction();
  return useMutation(client.shops.searchNearShops, {
    onSuccess: (data) => {
      if (data.length > 0) {
        toast.success(`${t('Show Result')}`);
        queryClient.invalidateQueries(API_ENDPOINTS.NEAR_SHOPS);
        closeModal();
      }
    },
    onError: (error) => {
      toast.error(`${t('error-something-wrong')}`);
    },
  });
};

export const useGetSearchNearShops = ({ lat, lng }: ShopMapLocation) => {
  const { data, isLoading, error } = useQuery<Shop[], Error>(
    [API_ENDPOINTS.NEAR_SHOPS, { lat, lng }],
    () => client.shops.getSearchNearShops({ lat, lng }),
  );
  return {
    data: data ?? [],
    isLoading,
    error,
  };
};

export const useShopMaintenanceEvent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reload } = router;
  const { mutate: ShopMaintenanceEventRequest, isLoading } = useMutation(
    client.shops.shopMaintenanceEvent,
    {
      onSuccess: () => {
        reload();
      },
      onError: (error) => {
        toast.error(`${t('error-something-wrong')}`);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SHOPS);
        queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
      },
    },
  );
  function createShopMaintenanceEventRequest(input: ShopMaintenanceEvent) {
    ShopMaintenanceEventRequest(input);
  }
  return {
    createShopMaintenanceEventRequest,
    isLoading,
  };
};
