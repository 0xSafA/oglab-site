import { useConversations } from '@/components/message/data/conversations';
import UserListNotFound from '@/components/message/views/conversation-not-found';
import ListView from '@/components/message/views/list-view';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Scrollbar from '@/components/ui/scrollbar';
import { LIMIT } from '@/utils/constants';
import cn from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useRef } from 'react';
import { Waypoint } from 'react-waypoint';
import { SortOrder } from '__generated__/__types__';

interface Props {
  className?: string;
  filterText?: any;
  permission: boolean;
}

const UserList = ({ className, filterText, permission, ...rest }: Props) => {
  const { t } = useTranslation();
  const loadMoreRef = useRef(null);
  let {
    conversations,
    isLoading,
    error,
    loadMore,
    hasMore,
    isLoadingMore,
    refetch,
  } = useConversations({
    ...(filterText &&
      filterText?.length >= 3 && {
        search: `%${filterText?.toLowerCase()}%`,
      }),
    first: LIMIT,
    sortedBy: SortOrder.Desc,
    orderBy: 'updated_at',
  });
  let filterTimeout: any;

  useEffect(() => {
    // filter text
    clearTimeout(filterTimeout);
    if (
      Boolean(filterText?.length >= 3) &&
      (filterText || isEmpty(filterText))
    ) {
      filterTimeout = setTimeout(() => {
        refetch();
      }, 500);
    }
  }, [filterText]);

  if (isLoading && isEmpty(conversations)) {
    return (
      <Loader
        className="!h-full flex-grow"
        showText={false}
        text={t('common:text-loading')}
      />
    );
  }
  if (!isLoading && isEmpty(conversations)) {
    return <UserListNotFound />;
  }
  if (error) return <ErrorMessage message={error?.message} />;
  return (
    <>
      <div className={cn('flex-auto', permission ? 'pb-6' : '')} {...rest}>
        {!isEmpty(conversations) ? (
          <>
            <Scrollbar
              className="w-full h-full"
              options={{
                scrollbars: {
                  autoHide: 'never',
                },
              }}
            >
              {conversations?.map((conversation: any, key: number) => (
                <React.Fragment key={key}>
                  {hasMore && key === conversations?.length / (LIMIT / 2) && (
                    <>
                      <Waypoint onEnter={loadMore} />
                    </>
                  )}
                  <ListView conversation={conversation} className={className} />
                </React.Fragment>
              ))}
              {hasMore ? (
                <div className="mt-4 text-center loader" ref={loadMoreRef}>
                  {isLoadingMore ? (
                    <Loader className="!h-auto" showText={false} />
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
            </Scrollbar>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default UserList;
