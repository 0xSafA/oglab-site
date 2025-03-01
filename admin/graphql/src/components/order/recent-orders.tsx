import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import usePrice from '@/utils/use-price';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ActionButtons from '@/components/common/action-buttons';
import { useTranslation } from 'next-i18next';
import Badge from '@/components/ui/badge/badge';
import StatusColor from '@/components/order/status-color';
import Avatar from '../common/avatar';
import Pagination from '@/components/ui/pagination';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useIsRTL } from '@/utils/locals';
import { Routes } from '@/config/routes';
import cn from 'classnames';
import { Order, OrderStatus, PaginatorInfo, Product, User } from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';

type IProps = {
  orders: Order[];
  paginatorInfo: PaginatorInfo | null;
  onPagination: (current: number) => void;
  searchElement: React.ReactNode;
  title?: string;
  className?: string;
};

const RecentOrders = ({
  orders,
  paginatorInfo,
  onPagination,
  searchElement,
  title,
  className,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();
  const rowExpandable = (record: any) => record.children?.length;

  const columns = [
    {
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: alignLeft,
      width: 200,
    },
    {
      title: t('table:table-item-customer'),
      dataIndex: 'customer',
      key: 'name',
      align: alignLeft,
      width: 250,
      render: (customer: User) => {
        return (
          <div className="flex items-center">
            <Avatar
              name={customer?.name!}
              src={customer?.profile?.avatar?.thumbnail!}
            />
            <div className="flex flex-col whitespace-nowrap font-medium ms-2">
              {customer?.name}
              <span className="text-[13px] font-normal text-gray-500/80">
                {customer?.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'products',
      key: 'products',
      align: 'center',
      render: (products: Product) => <span>{products?.length}</span>,
    },

    {
      // title: t('table:table-item-order-date'),
      title: t('table:table-item-order-date'),
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
      title: t('table:table-item-total'),
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      render: function Render(value: any) {
        const { price } = usePrice({
          amount: value,
        });
        return <span className="whitespace-nowrap font-medium">{price}</span>;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'order_status',
      key: 'order_status',
      align: 'center',
      render: (order_status: OrderStatus) => (
        <Badge
          text={t(order_status)}
          color={StatusColor(order_status)}
          className="!rounded py-1.5 font-medium"
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (id: string, order: Order) => {
        return (
          <>
            <ActionButtons
              id={id}
              detailsUrl={`${Routes.order.list}/${id}`}
              customLocale={order?.language!}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-lg bg-white p-6 md:p-8',
          className
        )}
      >
        <div className="flex items-center justify-between pb-6 md:pb-7">
          <PageHeading title={t(title)} />
          {searchElement}
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
          data={orders}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
        {!!paginatorInfo?.total && (
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
        )}
      </div>
    </>
  );
};

export default RecentOrders;
