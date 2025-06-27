// Import React and React Query
import { useNotifyLogs } from '@/framework/notify-logs';
import { NotifyLogs } from '@/types';
import React, { createContext, useContext } from 'react';

type NotificationProps = {
  notifyLogs: NotifyLogs[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: any;
  loadMore: () => void;
};

// Create a custom context
export const NotificationContext = createContext<NotificationProps | undefined>(
  undefined,
);

// Create a custom context provider component
export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Use the useNotifyLogs hook to fetch notification data
  const { notifyLogs, isLoading, isLoadingMore, hasMore, error, loadMore } =
    useNotifyLogs({
      limit: 7,
      sortedBy: 'DESC',
      orderBy: 'created_at',
    });

  // Return the context provider component with the query client and the notification query data
  return (
    <NotificationContext.Provider
      value={{
        notifyLogs,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Create a custom hook that consumes the notification context
export const useNotification = () => {
  const notification = useContext(NotificationContext);
  if (notification === undefined) {
    throw new Error(
      `useNotification must be used within a NotificationProvider`,
    );
  }
  return notification;
};
