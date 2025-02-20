import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import { useStoreNotices } from '@/framework/store-notices';
import { StoreNotice } from '@/types';
import NoticeCountdown from '@/components/ui/countdown';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useSessionStorage } from 'react-use';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

dayjs.extend(utc);

const HighlightedBar = ({ notice }: { notice: StoreNotice }) => {
  const { t } = useTranslation();
  const [highlightedBar, setHighlightedBar] = useSessionStorage(
    'highlightedBar',
    'false',
  );
  const durationTime = new Date(notice?.expired_at!);
  durationTime.setHours(durationTime.getHours() + 6);
  return (
    <>
      {highlightedBar !== 'true' && (
        <div className="relative w-full items-center justify-center bg-accent px-4 pt-3 pb-3.5 text-sm text-white md:px-6 lg:px-8">
          <div className="text-center ltr:pr-4 rtl:pl-4">
            {notice.description}{' '}
            {notice?.expired_at && (
              <>
                {'-'} {t('text-expired-at')}
                <NoticeCountdown date={durationTime} />
              </>
            )}
          </div>
          <button
            onClick={() => setHighlightedBar('true')}
            aria-label="Close Button"
            className="absolute flex items-center justify-center transition-colors duration-200 rounded-full outline-none top-3 h-7 w-7 hover:bg-white hover:bg-opacity-10 focus:bg-opacity-10 focus:text-white ltr:right-0 ltr:mr-2 rtl:left-0 rtl:ml-2 md:h-8 md:w-8 md:ltr:mr-3 md:rtl:ml-3"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              className="w-6 h-6"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

// TODO : render multiple times with infinite loop

const NoticeHighlightedBar = () => {
  const {
    query: { slug },
  } = useRouter();

  const { storeNotices } = useStoreNotices({
    shops: slug as string,
  });

  return (
    <>
      {storeNotices.length > 0 ? (
        <div className="relative">
          {
            //@ts-ignore
            storeNotices.map((notice: StoreNotice, idx: number) => (
              <HighlightedBar key={idx} notice={notice} />
            ))
          }
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default NoticeHighlightedBar;
