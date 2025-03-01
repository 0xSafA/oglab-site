import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import dayjs from 'dayjs';
import { Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'next-i18next';
import {
  Attachment,
  SortOrder,
  Coupon,
  PaginatorInfo,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import Badge from '../ui/badge/badge';
import { QueryCouponsOrderByColumn } from '@/types/custom-types';
import { useIsRTL } from '@/utils/locals';
import { NoDataFound } from '../icons/no-data-found';
import { useRouter } from 'next/router';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

type IProps = {
  coupons: Coupon[] | undefined;
  paginatorInfo: PaginatorInfo | null;
  onPagination: (current: number) => void;
  refetch: Function;
};

const CouponList = ({
  coupons,
  paginatorInfo,
  onPagination,
  refetch,
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignRight } = useIsRTL();
  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();
  const {
    query: { shop },
  } = router;
  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          orderBy: value,
          sortedBy: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        });
      }, 500),
    [order],
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            order === SortOrder.Asc && column === QueryCouponsOrderByColumn.ID
          }
          isActive={column === QueryCouponsOrderByColumn.ID}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 120,
      onHeaderCell: () => onHeaderClick(QueryCouponsOrderByColumn.ID),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-banner'),
      dataIndex: 'image',
      key: 'image',
      width: 74,
      render: (image: Attachment) => (
        <Image
          src={image?.thumbnail ?? siteSettings.product.placeholder}
          alt="coupon banner"
          width={42}
          height={42}
          className="overflow-hidden rounded"
        />
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-code')}
          ascending={
            order === SortOrder.Asc && column === QueryCouponsOrderByColumn.CODE
          }
          isActive={column === QueryCouponsOrderByColumn.CODE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'code',
      key: 'code',
      align: 'center',
      onHeaderCell: () => onHeaderClick(QueryCouponsOrderByColumn.CODE),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-coupon-amount')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCouponsOrderByColumn.AMOUNT
          }
          isActive={column === QueryCouponsOrderByColumn.AMOUNT}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryCouponsOrderByColumn.AMOUNT),
      render: function Render(amount: number, record: any) {
        const { price } = usePrice({
          amount: amount,
        });
        if (record.type === 'PERCENTAGE_COUPON') {
          return <span>{amount}%</span>;
        }
        return <span>{price}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-minimum-cart-amount')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCouponsOrderByColumn.MINIMUM_CART_AMOUNT
          }
          isActive={column === QueryCouponsOrderByColumn.MINIMUM_CART_AMOUNT}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'minimum_cart_amount',
      key: 'minimum_cart_amount',
      align: 'center',
      width: 150,
      onHeaderCell: () =>
        onHeaderClick(QueryCouponsOrderByColumn.MINIMUM_CART_AMOUNT),
      render: function Render(minimum_cart_amount: number) {
        const { price } = usePrice({
          amount: minimum_cart_amount,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-active')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCouponsOrderByColumn.CREATED_AT
          }
          isActive={column === QueryCouponsOrderByColumn.CREATED_AT}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'active_from',
      key: 'active_from',
      align: 'center',
      onHeaderCell: () => onHeaderClick(QueryCouponsOrderByColumn.CREATED_AT),
      render: (date: string) => (
        <span className="whitespace-nowrap">
          {dayjs().to(dayjs.utc(date).tz(dayjs.tz.guess()))}
        </span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-expired')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCouponsOrderByColumn.EXPIRE_AT
          }
          isActive={column === QueryCouponsOrderByColumn.EXPIRE_AT}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'expire_at',
      key: 'expire_at',
      align: 'center',
      onHeaderCell: () => onHeaderClick(QueryCouponsOrderByColumn.EXPIRE_AT),
      render: (date: string) => (
        <span className="whitespace-nowrap">
          {dayjs().to(dayjs.utc(date).tz(dayjs.tz.guess()))}
        </span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCouponsOrderByColumn.IS_APPROVE
          }
          isActive={column === QueryCouponsOrderByColumn.IS_APPROVE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'is_approve',
      key: 'is_approve',
      align: 'center',
      width: 150,
      onHeaderCell: () => onHeaderClick('is_approve'),
      render: (is_approve: boolean) => (
        <Badge
          textKey={is_approve ? 'Approved' : 'Disapprove'}
          color={
            is_approve
              ? 'bg-accent/10 !text-accent'
              : 'bg-status-failed/10 text-status-failed'
          }
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'code',
      key: 'actions',
      align: alignRight,
      width: 260,
      render: (slug: string, record: Coupon) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_COUPON"
          routes={Routes?.coupon}
          couponApproveButton={true}
          isCouponApprove={Boolean(record?.is_approve)}
          isShop={Boolean(shop)}
          shopSlug={(shop as string) ?? ''}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="pt-6 mb-1 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={coupons}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default CouponList;
