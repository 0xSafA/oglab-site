import { NotifyLogsQueryOptions } from '@/types';
import {
  useNotifyLogQuery,
  useNotifyLogsQuery,
  useReadNotifyLogsMutation,
  useNotifyLogAllReadMutation,
} from './gql/notify_log.graphql';
import { NetworkStatus } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { UpdateNotifyLogInput } from '__generated__/__types__';
import { useUser } from '@/framework/user';
import { useSettings } from '@/framework/settings';

export function useNotifyLogs(options?: Partial<NotifyLogsQueryOptions>) {
  const { isAuthorized } = useUser();
  const { settings } = useSettings();
  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useNotifyLogsQuery({
    variables: { ...options, first: options?.limit },
    skip: !isAuthorized && !Boolean(settings?.enableEmailForDigitalProduct),
    notifyOnNetworkStatusChange: true,
  });

  function handleLoadMore() {
    if (data?.notifyLogs?.paginatorInfo?.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.notifyLogs?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }

  return {
    notifyLogs: data?.notifyLogs?.data ?? [],
    paginatorInfo: data?.notifyLogs?.paginatorInfo,
    isLoading,
    isFetching: networkStatus === NetworkStatus.refetch,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasMore: Boolean(data?.notifyLogs?.paginatorInfo?.hasMorePages),
  };
}

export function useNotifyLog({ id }: { id: string }) {
  const { isAuthorized } = useUser();
  const { settings } = useSettings();
  const {
    data,
    loading: isLoading,
    error,
  } = useNotifyLogQuery({
    skip: !isAuthorized && !Boolean(settings?.enableEmailForDigitalProduct),
    variables: {
      id,
    },
  });
  return {
    notification: data?.notifyLog,
    isLoading,
    error,
  };
}

export function useNotificationRead() {
  const { t } = useTranslation('common');
  const [readNotifyLogsMutation, { loading: isLoading }] =
    useReadNotifyLogsMutation({
      refetchQueries: ['NotifyLogs'],
      onCompleted: (data: any) => {
        toast.success(t('text-notification-read-message'));
      },
    });

  function readNotification({ id }: { id: string }) {
    readNotifyLogsMutation({ variables: { id } });
  }

  return {
    readNotification,
    isLoading,
  };
}

export function useNotifyLogAllRead() {
  const { t } = useTranslation('common');
  const [notifyLogAllReadMutation, { loading: isLoading }] =
    useNotifyLogAllReadMutation({
      refetchQueries: ['NotifyLogs'],
      onCompleted: (data: any) => {
        toast.success(t('text-notification-read-message'));
      },
      onError: (error: any) => {
        toast.error(t(`common:${error?.response?.data.message}`));
      },
    });

  function readAllNotifyLogs({
    notify_type,
    receiver,
    set_all_read,
  }: UpdateNotifyLogInput) {
    notifyLogAllReadMutation({
      variables: {
        input: {
          set_all_read,
          receiver,
          notify_type,
        },
      },
    });
  }

  return {
    mutate: readAllNotifyLogs,
    isLoading,
  };
}
