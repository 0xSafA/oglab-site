import ActionButtons from '@/components/common/action-buttons';
import Badge from '@/components/ui/badge/badge';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import Pagination from '@/components/ui/pagination';
import { AlignType, Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import {
  RefundPolicy,
  RefundPolicyPaginator,
  SortOrder,
} from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
// import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useIsRTL } from '@/utils/locals';
import { debounce } from 'lodash';
import { QueryRefundPolicyOrderByColumn } from '@/types/custom-types';

type IProps = {
  refundPolicies: RefundPolicyPaginator | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const RefundPolicyList = ({
  refundPolicies,
  onPagination,
  refetch,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();
  const { data, paginatorInfo } = refundPolicies!;

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
            column === QueryRefundPolicyOrderByColumn.TITLE
          }
          isActive={column === QueryRefundPolicyOrderByColumn.TITLE}
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
          title={t('table:table-item-heading')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryRefundPolicyOrderByColumn.TITLE
          }
          isActive={column === QueryRefundPolicyOrderByColumn.TITLE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'title',
      key: 'title',
      align: 'left' as AlignType,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      render: (title: string) => <span className="font-medium">{title}</span>,
      onHeaderCell: () => onHeaderClick('title'),
    },
    {
      title: t('table:table-item-description'),
      className: 'cursor-pointer',
      dataIndex: 'description',
      key: 'description',
      width: 350,
      ellipsis: true,
      align: alignLeft,
      render: (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text?.length < 130 ? text : text?.substring(0, 130) + '...',
          }}
        />
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-target')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryRefundPolicyOrderByColumn.TITLE
          }
          isActive={column === QueryRefundPolicyOrderByColumn.TITLE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'target',
      key: 'target',
      width: 200,
      align: 'center' as AlignType,
      onHeaderCell: () => onHeaderClick('target'),
      render: (text: string) => text.toUpperCase(),
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center' as AlignType,
      width: 180,
      render: (status: string) => (
        <div
          className={`flex items-center justify-center space-x-3 rtl:space-x-reverse`}
        >
          <Badge
            text={status}
            color={
              status.toLocaleLowerCase() === 'pending'
                ? 'bg-yellow-400/10 text-yellow-400'
                : 'bg-accent/10 text-accent'
            }
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right' as AlignType,
      render: (slug: string, record: RefundPolicy) => (
        <div className="inline-flex w-auto items-center gap-3">
          <ActionButtons
            id={slug}
            detailsUrl={`${Routes.refundPolicies.details(slug)}`}
            previewUrl={`${Routes.refundPolicies.details(slug)}`}
          />
          <LanguageSwitcher
            slug={slug}
            record={record}
            deleteModalView="DELETE_REFUND_POLICY"
            routes={Routes?.refundPolicies}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
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

export default RefundPolicyList;
