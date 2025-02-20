import { NotifyLogs } from '@/types';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';
import { useNotificationRead } from '@/framework/notify-logs';
import dayjs from 'dayjs';
import { CheckedIconWithCircle } from '@/components/icons/checked';
import { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';

type NotificationListsProps = {
  notifications: NotifyLogs[];
  className?: string;
  character?: number;
  showButton?: React.ReactNode;
};

const NotificationLists: React.FC<NotificationListsProps> = ({
  notifications,
  className,
  character = 35,
  showButton = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const { readNotification, isLoading } = useNotificationRead();
  const [loadingId, setLoadingId] = useState<string>();
  const readingNotification = useCallback(({ id }: { id: string }) => {
    readNotification({ id });
    setLoadingId(id);
  }, []);

  return notifications?.map((notification: NotifyLogs) => {
    const currentButtonLoading = !!isLoading && loadingId === notification?.id;
    return (
      <>
        <div
          className={twMerge(
            classNames(
              "relative py-3.5 px-4 text-sm font-semibold capitalize transition duration-200 hover:text-accent group hover:bg-gray-100/70 overflow-hidden block border-b border-dashed border-gray-200 before:absolute before:top-5 before:h-2 before:w-2 before:rounded-full before:bg-accent before:opacity-0 before:content-[''] before:start-4",
              !Boolean(notification?.is_read)
                ? 'before:opacity-100 pl-8'
                : 'bg-[#F9FAFB]',
              className,
            ),
          )}
          key={notification?.id}
        >
          <Link
            href={Routes?.notifyLogsSingle(notification?.id)}
            className={showButton ? 'shrink-0 2xl:mr-6 2xl:w-4/5' : ''}
            {...(!Boolean(notification?.is_read) && {
              onClick: () => readingNotification({ id: notification?.id }),
            })}
            {...rest}
          >
            <h3 className="relative text-sm font-medium">
              {notification?.notify_text?.length > character
                ? notification?.notify_text?.substring(0, character) + '...'
                : notification?.notify_text}
            </h3>
            <span className="mt-2 block text-xs font-medium text-[#666666]">
              {dayjs(notification?.created_at).format('MMM DD, YYYY')} at{' '}
              {dayjs(notification?.created_at).format('hh:mm A')}
            </span>
          </Link>
          {showButton ? (
            <div
              className={twMerge(
                classNames(
                  'cursor-pointer border text-heading border-[#D1D5DB] rounded-lg flex items-center gap-2 px-4 py-3 transition-colors duration-300',
                  !Boolean(notification?.is_read) || currentButtonLoading
                    ? 'hover:bg-gray-200'
                    : 'cursor-not-allowed select-none',
                ),
              )}
              {...(!Boolean(notification?.is_read) && {
                onClick: () => readingNotification({ id: notification?.id }),
              })}
            >
              <CheckedIconWithCircle className="text-[#6B7280]" />
              {!Boolean(notification?.is_read)
                ? t('text-mark-as-read')
                : t('text-marked-as-read')}
              {currentButtonLoading ? (
                <span className="h-4 w-4 ltr:ml-2 rtl:mr-2 rounded-full border-2 border-transparent border-t-2 border-t-current animate-spin" />
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </>
    );
  });
};

export default NotificationLists;
