import { mapPaginatorData } from '@/framework/utils/data-mappers';
import {
  NotifyLogs,
  NotifyLogsPaginator,
  NotifyLogsQueryOptions,
} from '@/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useUser } from '@/framework/user';
import { useSettings } from '@/framework/settings';

export function useNotifyLogs(options?: Partial<NotifyLogsQueryOptions>) {
  const { isAuthorized } = useUser();
  const { settings } = useSettings();
  const formattedOptions = {
    ...options,
  };
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery<NotifyLogsPaginator, Error>(
    [API_ENDPOINTS.NOTIFY_LOGS, formattedOptions],
    ({ queryKey, pageParam }) =>
      client.notifyLogs.all(Object.assign({}, queryKey[1], pageParam)),
    {
      enabled: isAuthorized && Boolean(settings?.enableEmailForDigitalProduct),
      retry: false,
      getNextPageParam: ({ current_page, last_page }) =>
        last_page > current_page && { page: current_page + 1 },
      refetchOnWindowFocus: false,
    },
  );

  function handleLoadMore() {
    fetchNextPage();
  }

  return {
    notifyLogs: data?.pages?.flatMap((page) => page.data) ?? [],
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

export function useNotifyLog({ id }: { id: string }) {
  const { isAuthorized } = useUser();
  const { settings } = useSettings();
  const { data, isLoading, error } = useQuery<NotifyLogs, Error>(
    [API_ENDPOINTS.NOTIFY_LOGS, id],
    () => client?.notifyLogs?.get({ id }),
    {
      enabled: isAuthorized && Boolean(settings?.enableEmailForDigitalProduct),
      retry: false,
    },
  );

  return {
    notification: data,
    isLoading,
    error,
  };
}

export function useNotificationRead() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const {
    mutate: readNotification,
    isLoading,
    isSuccess,
  } = useMutation(client?.notifyLogs?.readNotifyLog, {
    onSuccess: () => {
      toast.success(t('text-notification-read-message'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
    },
  });

  return { readNotification, isLoading, isSuccess };
}

export const useNotifyLogAllRead = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  return useMutation(client?.notifyLogs?.readAllNotifyLogs, {
    onSuccess: () => {
      toast.success(t('text-notifications-read-message'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.NOTIFY_LOGS);
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message}`));
    },
  });
};
