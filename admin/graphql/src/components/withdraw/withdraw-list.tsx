import Pagination from '@/components/ui/pagination';
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
import { Shop, SortOrder, WithdrawPaginator } from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';

type IProps = {
  withdraws: WithdrawPaginator | null | undefined;
  onPagination?: (current: number) => void;
  refetch: Function;
};

const WithdrawList = ({ withdraws, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = withdraws! ?? {};
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

  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });
  const [column, setColumn] = useState<string>();

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        setSortingObj({
          sort:
            sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
          column: value,
        });
        refetch({
          sortedBy: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
          orderBy: value,
        });
      }, 500),
    [order]
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  let columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-shop-id')}
          ascending={
            sortingObj.sort === SortOrder.Asc && column === 'shop_id'
          }
          isActive={sortingObj.column === 'shop_id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'shop_id',
      key: 'shop_id',
      align: alignLeft,
      width: 170,
      onHeaderCell: () => onHeaderClick('shop_id'),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-shop-name'),
      dataIndex: 'shop',
      key: 'shop',
      align: alignLeft,
      render: (shop: Shop) => shop.name,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-amount')}
          ascending={order === SortOrder.Asc && column === 'amount'}
          isActive={column === 'amount'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      onHeaderCell: () => onHeaderClick('amount'),
      render: function Render(amount: number) {
        const { price } = usePrice({
          amount: amount as number,
        });
        return <div>{price}</div>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-created-at')}
          ascending={order === SortOrder.Asc && column === 'created_at'}
          isActive={column === 'created_at'}
        />
      ),
      className: 'cursor-pointer',
      onHeaderCell: () => onHeaderClick('created_at'),
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
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={order === SortOrder.Asc && column === 'status'}
          isActive={column === 'status'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      onHeaderCell: () => onHeaderClick('status'),
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
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
    <>
      <div className="rounded overflow-hidden shadow mb-6">
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
          data={data}
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex justify-end items-center">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default WithdrawList;
