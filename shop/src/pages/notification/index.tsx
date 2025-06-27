import NotificationLists from '@/components/notifications/notification-lists';
import Card from '@/components/ui/cards/card';
import ErrorMessage from '@/components/ui/error-message';
import { NotifyLoader } from '@/components/ui/loaders/notify-loader';
import NotFound from '@/components/ui/not-found';
import { useNotification } from '@/context/notify-content';
import DashboardLayout from '@/layouts/_dashboard';
import rangeMap from '@/lib/range-map';
import { NotifyLogs } from '@/types';
import { isEmpty } from 'lodash';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@/framework/settings';
import { FeatureNotAvailable } from '@/components/common/feature-not-available';
export { getStaticProps } from '@/framework/notify-logs.ssr';

export default function NotifyLogsPage() {
  const limit: number = 6;
  const data = useNotification();
  const { t } = useTranslation();
  const { settings } = useSettings();

  if (!Boolean(settings?.enableEmailForDigitalProduct)) {
    return (
      <Card className="w-full shadow-none sm:shadow flex flex-col">
        <div className="m-auto">
          <FeatureNotAvailable />
        </div>
      </Card>
    );
  }

  if (data?.error) return <ErrorMessage message={data?.error?.message} />;

  return (
    <Card className="w-full shadow-none sm:shadow flex flex-col">
      <h1 className="text-lg font-semibold text-heading sm:text-xl mb-8 sm:mb-10">
        {t('profile-sidebar-notifications')}
      </h1>
      {data?.isLoading ? (
        <div className="flex flex-col gap-4">
          {rangeMap(limit, (i) => (
            <div
              className="border border-[#E5E7EB] rounded-md bg-white px-8 py-5"
              key={i}
            >
              <NotifyLoader
                uniqueKey={`notify-${i}`}
                className="w-full h-[3.125rem]"
              />
            </div>
          ))}
        </div>
      ) : isEmpty(data?.notifyLogs) ? (
        <div className="m-auto">
          <NotFound text={t('text-notification-not-found')} />
        </div>
      ) : (
        <>
          <div className="relative w-full flex flex-col gap-4">
            <NotificationLists
              character={150}
              notifications={data?.notifyLogs as NotifyLogs[]}
              className="border border-[#E5E7EB] border-solid rounded-md before:bg-[#F2B926] flex 2xl:justify-between 2xl:items-center 2xl:flex-row flex-col justify-start items-start gap-y-4 2xl:gap-y-0"
              showButton
            />
          </div>
          {data?.hasMore && (
            <div className="flex items-center justify-center mt-8 lg:mt-12">
              <Button
                onClick={data?.loadMore}
                loading={data?.isLoadingMore}
                disabled={data?.isLoadingMore}
              >
                {t('text-load-more')}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
NotifyLogsPage.authenticationRequired = true;
NotifyLogsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
