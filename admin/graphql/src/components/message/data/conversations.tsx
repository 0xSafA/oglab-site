import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import {
  useConversationsQuery,
  ConversationsQueryVariables,
  useConversationQuery,
  ConversationQueryVariables,
  useCreateConversationMutation,
} from '@/graphql/conversion.graphql';
import {
  useCreateMessageMutation,
  useMessagesQuery,
  MessagesQueryVariables,
  useSeenMessageMutation,
} from '@/graphql/message.graphql';
import { NetworkStatus } from '@apollo/client';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';

export function useConversations(options: ConversationsQueryVariables) {
  let { data, error, fetchMore, refetch, networkStatus } =
    useConversationsQuery({
      variables: options,
      notifyOnNetworkStatusChange: true,
    });

  function handleLoadMore() {
    if (data?.conversations?.paginatorInfo?.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.conversations?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }
  return {
    conversations: data?.conversations?.data ?? [],
    paginatorInfo: data?.conversations?.paginatorInfo,
    isLoading: networkStatus === NetworkStatus.loading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    refetch,
    hasMore: Boolean(data?.conversations?.paginatorInfo?.hasMorePages),
  };
}

export function useMessages(options: MessagesQueryVariables) {
  let { data, error, fetchMore, refetch, networkStatus } = useMessagesQuery({
    variables: options,
    notifyOnNetworkStatusChange: true,
  });
  function handleLoadMore() {
    if (data?.messages?.paginatorInfo?.hasMorePages) {
      fetchMore({
        variables: {
          page: Number(data?.messages?.paginatorInfo?.currentPage) + 1,
        },
      });
    }
  }
  return {
    messages: data?.messages?.data ?? [],
    paginatorInfo: data?.messages?.paginatorInfo,
    isLoading: networkStatus === NetworkStatus.loading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    refetch,
    fetchMore,
    hasMore: Boolean(data?.messages?.paginatorInfo?.hasMorePages),
  };
}

export function useConversation(options: ConversationQueryVariables) {
  let { data, loading, error } = useConversationQuery({
    variables: options,
  });

  return {
    data: data?.conversation ?? [],
    loading,
    error,
  };
}

export function useSendMessage() {
  const { t } = useTranslation();
  const [createMessageMutation, { data, loading, error }] =
    useCreateMessageMutation({
      onCompleted: async () => {
        toast.success(t('common:successfully-created'));
      },
      refetchQueries: ['Messages', 'Conversations'],
      onError: (error) => {
        toast.error(t(error?.message));
      },
    });

  return {
    createMessage: createMessageMutation,
    data,
    isLoading: loading,
    error,
  };
}

export function useCreateConversation() {
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);
  const { closeModal } = useModalAction();
  const router = useRouter();
  const [createConversationMutation, { data, loading, error }] =
    useCreateConversationMutation({
      onCompleted: async (item) => {
        if (item?.createConversation?.id) {
          const routes = permission
            ? Routes?.message?.details(item?.createConversation?.id)
            : Routes?.shopMessage?.details(item?.createConversation?.id);
          toast.success(t('common:successfully-created'));
          router.push(`${routes}`);
          closeModal();
        } else {
          // @ts-ignore
          toast.error(t(data?.errors[0]?.message));
        }
      },
      refetchQueries: ['Messages', 'Conversation'],
      onError: (error) => {
        toast.error(t(error?.message));
      },
    });

  return {
    createConversation: createConversationMutation,
    data,
    isLoading: loading,
    error,
  };
}

export const useMessageSeen = () => {
  const { t } = useTranslation();
  const [seenMessageMutation, { data, loading, error }] =
    useSeenMessageMutation({
      refetchQueries: ['Messages', 'Conversations'],
      onError: (error) => {
        toast.error(t(error?.message));
      },
    });

  return {
    createSeenMessage: seenMessageMutation,
    data,
    isLoading: loading,
    error,
  };
};
