import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { siteSettings } from '@/settings/site.settings';
import ReviewCard from './review-card';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  Product,
  ReviewPaginator,
  SortOrder,
  QueryReviewsOrderByColumn,
} from '__generated__/__types__';
import TitleWithSort from '@/components/ui/title-with-sort';
import { StarIcon } from '@/components/icons/star-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Link from 'next/link';
import { NoDataFound } from '@/components/icons/no-data-found';

export type IProps = {
  reviews: ReviewPaginator | undefined | null;
  onPagination: (key: number) => void;
  refetch: Function;
};
const ReviewList = ({ reviews, onPagination, refetch }: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, paginatorInfo } = reviews!;
  const { alignLeft } = useIsRTL();
  const { openModal } = useModalAction();

  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          orderBy: [
            {
              column: value,
              order: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
            },
          ],
        });
      }, 500),
    [order]
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  function openAbuseReportModal(id: string) {
    openModal('ABUSE_REPORT', {
      model_id: id,
      model_type: 'Review',
    });
  }

  let columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            order === SortOrder.Asc && column === QueryReviewsOrderByColumn.Id
          }
          isActive={column === QueryReviewsOrderByColumn.Id}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 120,
      onHeaderCell: () => onHeaderClick(QueryReviewsOrderByColumn.Id),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-product'),
      dataIndex: 'product',
      key: 'product-image',
      align: alignLeft,
      width: 220,
      render: (product: Product) => (
        <div className="flex items-center">
          <div className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
            <Image
              src={
                product?.image?.thumbnail ?? siteSettings.product.placeholder
              }
              alt={product?.name}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <Link
            href={`${process.env.NEXT_PUBLIC_SHOP_URL}/products/${product?.slug}`}
          >
            <span className="truncate whitespace-nowrap font-medium">
              {product?.name}
            </span>
          </Link>
        </div>
      ),
    },
    {
      title: t('table:table-item-customer-review'),
      key: 'review',
      align: alignLeft,
      width: 350,
      render: (record: any) => <ReviewCard review={record} />,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-ratings')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryReviewsOrderByColumn.Rating
          }
          isActive={column === QueryReviewsOrderByColumn.Rating}
        />
      ),
      key: 'rating',
      className: 'cursor-pointer',
      align: 'center',
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryReviewsOrderByColumn.Rating),
      render: (record: any) => (
        <div className="inline-flex shrink-0 items-center rounded-full border border-accent px-3 py-0.5 text-base text-accent">
          {record?.rating}
          <StarIcon className="h-3 w-3 ms-1" />
        </div>
      ),
    },
    {
      title: t('table:table-item-reports'),
      key: 'report',
      align: 'center',
      width: 150,
      render: (record: any) => {
        if (router.query.shop) {
          return (
            <span className="font-bold">{record?.abusive_reports_count}</span>
          );
        }
        return (
          <>
            <span className="font-bold">{record?.abusive_reports_count}</span>
            {record?.abusive_reports_count > 0 && (
              <a
                href={`${router.asPath}/${record?.id}`}
                className="text-sm transition-colors ms-2 hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                ({t('text-details')})
              </a>
            )}
          </>
        );
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-date')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryReviewsOrderByColumn.CreatedAt
          }
          isActive={column === QueryReviewsOrderByColumn.CreatedAt}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'created_at',
      key: 'created_at',
      align: alignLeft,
      width: 120,
      onHeaderCell: () => onHeaderClick(QueryReviewsOrderByColumn.CreatedAt),
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
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 100,
      render: (id: string) => {
        if (router?.query?.shop) {
          return (
            <button onClick={() => openAbuseReportModal(id)}>
              {t('common:text-report')}
            </button>
          );
        }
        return <ActionButtons id={id} deleteModalView="DELETE_REVIEW" />;
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          // rowClassName="align-top"
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
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
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

export default ReviewList;
