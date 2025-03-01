import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import usePrice from '@/utils/use-price';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import Badge from '@/components/ui/badge/badge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PaginatorInfo, Shop, WithdrawPaginator } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import Image from 'next/image';
import { siteSettings } from '@/settings/site.settings';
import { NoDataFound } from '@/components/icons/no-data-found';
import Pagination from '@/components/ui/pagination';
import cn from 'classnames';
import PageHeading from '@/components/common/page-heading';

type IProps = {
  withdraws: WithdrawPaginator | null | undefined;
  title?: string;
  paginatorInfo: PaginatorInfo | null;
  onPagination: (current: number) => void;
  className?: string;
};

const WithdrawTable = ({
  withdraws,
  paginatorInfo,
  onPagination,
  title,
  className,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

  const router = useRouter();

  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return (
          <Badge
            text={t('text-approved')}
            color="bg-accent bg-opacity-10 !text-accent"
          />
        );
      case 'PENDING':
        return (
          <Badge
            text={t('text-pending')}
            color="bg-purple-500 bg-opacity-10 text-purple-500"
          />
        );
      case 'ON_HOLD':
        return (
          <Badge
            text={t('text-on-hold')}
            color="bg-pink-500 bg-opacity-10 text-pink-500"
          />
        );
      case 'REJECTED':
        return (
          <Badge
            text={t('text-rejected')}
            color="bg-red-500 bg-opacity-10 text-red-500"
          />
        );
      case 'PROCESSING':
        return (
          <Badge
            text={t('text-processing')}
            color="bg-yellow-500 bg-opacity-10 text-yellow-600"
          />
        );
    }
  };

  let columns = [
    {
      title: t('table:table-item-shop-id'),
      dataIndex: 'shop_id',
      key: 'shop_id',
      align: alignLeft,
      width: 190,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop',
      key: 'shop',
      align: alignLeft,
      width: 250,
      render: (shop: Shop) => (
        <div className="flex items-center font-medium">
          <div className="relative aspect-square h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-200/80 bg-gray-100 me-2">
            <Image
              src={shop?.logo?.thumbnail ?? siteSettings.product.placeholder}
              alt={shop?.name ?? 'Shop Name'}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <span className="truncate">{shop?.name}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: function Render(amount: number) {
        const { price } = usePrice({
          amount: amount as number,
        });
        return <div className="font-medium">{price}</div>;
      },
    },
    {
      title: t('table:table-item-created-at'),
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-payment-method'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: alignLeft,
      width: 200,
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'center',
      render: (id: string) => {
        const { permissions } = getAuthCredentials();
        if (hasAccess(adminOnly, permissions)) {
          return (
            <ActionButtons
              detailsUrl={`${Routes.withdraw.details(id)}`}
              id={id}
            />
          );
        }
        return null;
      },
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((column) => column?.key !== 'actions');
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-white p-5 md:p-8',
        className
      )}
    >
      <div className="mb-7 mt-1.5 flex items-center justify-between">
        <PageHeading title={title as string} />
        {/* {searchElement} */}
      </div>
      <Table
        //@ts-ignore
        columns={columns}
        emptyText={() => (
          <div className="flex flex-col items-center py-7">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
        // @ts-ignore
        data={withdraws?.data || []}
        rowKey="id"
        scroll={{ x: 700 }}
      />
      {!!paginatorInfo?.total ? (
        <div className="flex items-center justify-between py-2">
          <div className="mt-2 text-sm text-gray-500">
            {paginatorInfo?.currentPage} of {paginatorInfo?.lastPage} pages
          </div>
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      ) : null}
    </div>
  );
};

export default WithdrawTable;
