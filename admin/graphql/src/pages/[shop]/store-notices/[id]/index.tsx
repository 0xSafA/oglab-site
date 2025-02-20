import Layout from '@/components/layouts/owner';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useStoreNoticeQuery } from '@/graphql/store-notice.graphql';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { IosGhostArrowLeft } from '@/components/icons/ios-arrow-left';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import Badge from '@/components/ui/badge/badge';
import classNames from 'classnames';
import { StoreNoticePriorityType } from '@/types/custom-types';
import * as socialIcons from '@/components/icons/store-notice-social';
import { getIcon } from '@/utils/get-icon';
import { isEmpty } from 'lodash';
import { EditGhostIcon } from '@/components/icons/edit';
import { CalendarGhostIcon } from '@/components/icons/calendar';
import { useSettingsQuery } from '@/graphql/settings.graphql';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const OwnerStoreNoticePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error } = useStoreNoticeQuery({
    variables: {
      id: query.id as string,
      language: locale,
    },
    fetchPolicy: 'network-only',
  });

  const { data: options, loading: settingsLoading } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <div className="rounded-lg bg-white p-7">
      <div className="mb-4 flex flex-col gap-5 lg:mb-2 lg:flex-row">
        <div className="flex-1">
          <div className="mb-6">
            <Link
              href={`${Routes?.ownerDashboardNotice}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize text-accent transition-colors duration-300 hover:text-accent-hover"
            >
              <IosGhostArrowLeft className="text-base" />
              {t('common:text-back-to-home')}
            </Link>
          </div>

          {data?.storeNotice?.notice ? (
            <h3 className="text-lg font-semibold leading-[150%] text-muted-black 2xl:text-xl">
              {data?.storeNotice?.notice}
            </h3>
          ) : (
            ''
          )}
        </div>

        {data?.storeNotice?.priority ? (
          <div className="lg:self-end">
            <Badge
              text={data?.storeNotice?.priority}
              className={classNames(
                `rounded-full border border-current bg-opacity-10 py-2 px-3 text-sm font-medium capitalize leading-none`,
                {
                  'bg-[#30947F] text-[#30947F]':
                    StoreNoticePriorityType.High ===
                    data?.storeNotice?.priority,
                  'bg-[#43A5FF] text-[#43A5FF]':
                    StoreNoticePriorityType.Medium ===
                    data?.storeNotice?.priority,
                  'bg-[#F75159] text-[#F75159]':
                    StoreNoticePriorityType.Low === data?.storeNotice?.priority,
                }
              )}
            />
          </div>
        ) : (
          ''
        )}
      </div>

      <ul className="group mb-7 flex flex-col space-y-3 text-xs capitalize text-[#666] md:flex-row md:space-y-0 md:space-x-4 md:divide-x md:divide-[#E7E7E7] md:[&>li:not(li:first-child)]:pl-4 [&>li]:flex [&>li]:items-center [&>li]:gap-2">
        <li>
          <EditGhostIcon className="text-base" />
          <div>
            <span className="inline-block pr-1 font-semibold">
              {t('notice-created-by')} :{' '}
            </span>
            {data?.storeNotice?.creator_role}
          </div>
        </li>
        <li>
          <CalendarGhostIcon className="text-base" />
          <div>
            <span className="inline-block pr-1 font-semibold">From :</span>
            {dayjs(data?.storeNotice?.effective_from).format(
              'DD MMM YYYY'
            )} - {dayjs(data?.storeNotice?.expired_at).format('DD MMM YYYY')}
          </div>
        </li>
      </ul>

      {data?.storeNotice?.description ? (
        <p className="leading-8 text-base-dark">
          {data?.storeNotice?.description}
        </p>
      ) : (
        ''
      )}

      {!settingsLoading &&
      !isEmpty(options?.settings?.options?.contactDetails?.socials) ? (
        <div className="mt-10 flex items-center gap-4 lg:mt-20">
          <i className="text-base font-medium leading-8 text-base-dark">
            {t('text-follow-us-on')} :{' '}
          </i>
          <ul className="flex items-center gap-3">
            {options?.settings?.options?.contactDetails?.socials?.map(
              (social, index) => {
                return social?.url ? (
                  <li key={index}>
                    <Link
                      href={social?.url as string}
                      target="_blank"
                      className="block text-2xl"
                    >
                      {getIcon({
                        iconList: socialIcons,
                        iconName: social?.icon as string,
                      })}
                    </Link>
                  </li>
                ) : (
                  ''
                );
              }
            )}
          </ul>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

OwnerStoreNoticePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
OwnerStoreNoticePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default OwnerStoreNoticePage;
