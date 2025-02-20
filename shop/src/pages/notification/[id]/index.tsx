import { CalendarGhostIcon } from '@/components/icons/calendar';
import { IosGhostArrowLeft } from '@/components/icons/chevron-left';
import Card from '@/components/ui/cards/card';
import Link from '@/components/ui/link';
import { NotifySingleContentLoader } from '@/components/ui/loaders/notify-loader';
import NotFound from '@/components/ui/not-found';
import { Routes } from '@/config/routes';
import { useNotifyLog } from '@/framework/notify-logs';
import DashboardLayout from '@/layouts/_dashboard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useSettings } from '@/framework/settings';
import { FeatureNotAvailable } from '@/components/common/feature-not-available';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const NotifyLogPage = () => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const { settings } = useSettings();
  const { notification, isLoading } = useNotifyLog({
    id: query?.id as string,
  });

  if (!Boolean(settings?.enableEmailForDigitalProduct)) {
    return (
      <Card className="w-full shadow-none sm:shadow flex flex-col">
        <div className="m-auto">
          <FeatureNotAvailable />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-none sm:shadow flex flex-col">
      {isLoading ? (
        <NotifySingleContentLoader className="h-full w-full" />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-5 lg:mb-2 lg:flex-row">
            <div className="flex-1">
              <div className="mb-6">
                <Link
                  href={Routes?.notifyLogs}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize text-accent transition-colors duration-300 hover:text-accent-hover"
                >
                  <IosGhostArrowLeft className="text-base" />
                  {t('text-back-to-home')}
                </Link>
              </div>
            </div>
          </div>
          {notification ? (
            <>
              <ul className="group mb-7 flex flex-col space-y-3 text-xs capitalize text-[#666] md:flex-row md:space-y-0 md:space-x-4 md:divide-x md:divide-[#E7E7E7] md:[&>li:not(li:first-child)]:pl-4 [&>li]:flex [&>li]:items-center [&>li]:gap-2">
                <li>
                  <CalendarGhostIcon className="text-base" />
                  <div>
                    <span className="inline-block pr-1 font-semibold">
                      {t('text-created-at')} :
                    </span>
                    {dayjs(notification?.created_at).format('DD MMM YYYY')}
                  </div>
                </li>
              </ul>

              {notification?.notify_text ? (
                <p className="leading-8 text-base-dark">
                  {notification?.notify_text}
                </p>
              ) : (
                ''
              )}
            </>
          ) : (
            <div className="flex flex-col h-full w-full">
              <NotFound
                text={t('text-notification-not-found')}
                className="m-auto"
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

NotifyLogPage.authenticationRequired = true;
NotifyLogPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
  };
};

export default NotifyLogPage;
