import LanguageSwitcher from '@/components/ui/lang-action/action';
import Pagination from '@/components/ui/pagination';
import { AlignType, Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import {
  RefundReasonPaginator,
  RefundReason,
  SortOrder,
} from '__generated__/__types__';
import { useIsRTL } from '@/utils/locals';
import { useTranslation } from 'next-i18next';
// import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { QueryRefundReasonsOrderByColumn } from '@/types/custom-types';
import { NoDataFound } from '@/components/icons/no-data-found';

type IProps = {
  refundReasons: RefundReasonPaginator | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const RefundReasonList = ({ refundReasons, onPagination, refetch }: IProps) => {
  const { t } = useTranslation();
  const { data, paginatorInfo } = refundReasons!;
  // const router = useRouter();
  const { alignLeft } = useIsRTL();
  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          orderBy: value,
          sortBy: order,
        });
      }, 300),
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
          title={t('table:table-item-id')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryRefundReasonsOrderByColumn.NAME
          }
          isActive={column === QueryRefundReasonsOrderByColumn.NAME}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 120,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => `#ID: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryRefundReasonsOrderByColumn.NAME
          }
          isActive={column === QueryRefundReasonsOrderByColumn.NAME}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      width: 400,
      ellipsis: true,
      align: alignLeft,
      render: (name: string) => <span className="font-medium">{name}</span>,
      onHeaderCell: () => onHeaderClick('name'),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-slug')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryRefundReasonsOrderByColumn.SLUG
          }
          isActive={column === QueryRefundReasonsOrderByColumn.SLUG}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'slug',
      key: 'slug',
      width: 400,
      ellipsis: true,
      align: alignLeft,
      onHeaderCell: () => onHeaderClick('slug'),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      width: 120,
      align: 'right' as AlignType,
      render: (slug: string, record: RefundReason) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_REFUND_REASON"
          routes={Routes?.refundReasons}
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
              <div className="mb-1 pt-6 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={data}
          rowKey="id"
          scroll={{ x: 900 }}
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

export default RefundReasonList;
