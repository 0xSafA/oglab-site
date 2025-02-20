import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import cn from 'classnames';
import isEmpty from 'lodash/isEmpty';
import UserMessageView from './views/message-view';
import {
  useMessages,
  useConversation,
} from '@/components/message/data/conversations';
import { LIMIT } from '@/utils/constants';
import SelectConversation from '@/components/message/views/select-conversation';
import BlockedView from '@/components/message/views/blocked-view';
import CreateMessageForm from '@/components/message/views/form-view';
import HeaderView from '@/components/message/views/header-view';
import { useRef } from 'react';
import MessageCardLoader from '@/components/message/content-loader';
import { useWindowSize } from '@/utils/use-window-size';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import { useMessageSeen } from '@/components/message/data/conversations';

interface Props {
  className?: string;
}

const UserMessageIndex = ({ className, ...rest }: Props) => {
  const { t } = useTranslation();
  const { createSeenMessage } = useMessageSeen();
  const loadMoreRef = useRef(null);
  const router = useRouter();
  const { query } = router;
  const { data, loading } = useConversation({
    conversation_id: query.id as string,
  });
  const { width } = useWindowSize();
  let {
    error: messageError,
    messages,
    isLoading: messageLoading,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useMessages({
    conversation_id: query?.id as string,
    first: LIMIT,
  });
  const seenMessage = (unseen: boolean) => {
    if (unseen) {
      createSeenMessage({
        variables: {
          input: {
            conversation_id: query?.id as string,
          },
        },
      });
    }
  };
  messages = [...messages].reverse();
  const classes = {
    common:
      'inline-block rounded-[8px] px-4 py-2 break-all leading-[150%] text-sm',
    default: 'bg-[#FAFAFA] text-left text-base-dark',
    reverse: 'bg-accent text-white',
  };
  if (!isEmpty(query?.id) && messageError)
    return (
      <div className="flex !h-full flex-1 items-center justify-center bg-[#F3F4F6]">
        <ErrorMessage message={messageError?.message} />
      </div>
    );

  return (
    <>
      <div
        className={cn(
          'flex h-full max-h-[calc(100%-51px)] flex-1 items-stretch bg-[#F3F4F6]',
          width >= RESPONSIVE_WIDTH ? '2xl:max-w-[calc(100%-26rem)]' : '',
          className
        )}
        {...rest}
      >
        {!isEmpty(query?.id) ? (
          <>
            {!messageLoading && !loading ? (
              <>
                <div
                  className={cn(
                    'flex h-full w-full flex-col overflow-hidden rounded-xl bg-white p-6'
                  )}
                  onFocus={() => {
                    // @ts-ignore
                    seenMessage(Boolean(data?.unseen));
                  }}
                >
                  {/* @ts-ignore */}
                  <HeaderView shop={data?.shop} />
                  <UserMessageView
                    // @ts-ignore
                    messages={messages ?? []}
                    id="chatBody"
                    error={messageError}
                    loading={messageLoading}
                    classes={classes}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                    loadMore={loadMore}
                  >
                    {hasMore ? (
                      <div ref={loadMoreRef} className="mb-4">
                        {isLoadingMore ? (
                          <MessageCardLoader
                            classes={classes}
                            limit={LIMIT / 2}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                  </UserMessageView>

                  <div className="relative mt-auto">
                    {/* @ts-ignore */}
                    {Boolean(data?.shop?.is_active) ? (
                      <>
                        {/* @ts-ignore */}
                        <CreateMessageForm shop={data?.shop} />
                      </>
                    ) : (
                      <>
                        {/* @ts-ignore */}
                        <BlockedView name={data?.shop?.name} />
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Loader className="!h-full" text={t('common:text-loading')} />
            )}
          </>
        ) : (
          <>{width >= RESPONSIVE_WIDTH ? <SelectConversation /> : ''}</>
        )}
      </div>
    </>
  );
};

export default UserMessageIndex;
