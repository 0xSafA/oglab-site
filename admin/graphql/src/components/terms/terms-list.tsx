// import ActionButtons from '@/components/common/action-buttons';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import { useIsRTL } from '@/utils/locals';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { NoDataFound } from '../icons/no-data-found';
import {
  TermsAndConditions,
  PaginatorInfo,
  SortOrder,
} from '__generated__/__types__';
import { debounce } from 'lodash';
import { QueryTermsOrderByColumn } from '@/types/custom-types';
import Badge from '../ui/badge/badge';
import ActionButtons from '../common/action-buttons';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

type IProps = {
  terms: TermsAndConditions[] | undefined;
  paginatorInfo: PaginatorInfo | null;
  onPagination: (current: number) => void;
  refetch: Function;
};
const TermsAndConditionsLists = ({
  terms,
  paginatorInfo,
  onPagination,
  refetch,
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { alignLeft, alignRight } = useIsRTL();
  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);
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
    [order]
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
            order === SortOrder.Asc && column === QueryTermsOrderByColumn.ID
          }
          isActive={column === QueryTermsOrderByColumn.ID}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 120,
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.ID),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc && column === QueryTermsOrderByColumn.NAME
          }
          isActive={column === QueryTermsOrderByColumn.NAME}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'title',
      key: 'title',
      align: alignLeft,
      ellipsis: true,
      width: 200,
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.NAME),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-description')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryTermsOrderByColumn.DESCRIPTION
          }
          isActive={column === QueryTermsOrderByColumn.DESCRIPTION}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'description',
      key: 'description',
      align: alignLeft,
      width: 300,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.DESCRIPTION),
      render: (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text?.length < 100 ? text : text?.substring(0, 100) + '...',
          }}
        />
      ),
    },

    {
      title: (
        <TitleWithSort
          title={t('table:table-item-type')}
          ascending={
            order === SortOrder.Asc && column === QueryTermsOrderByColumn.TYPE
          }
          isActive={column === QueryTermsOrderByColumn.TYPE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 100,
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.TYPE),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },

    {
      title: (
        <TitleWithSort
          title={t('table:table-item-issued-by')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryTermsOrderByColumn.ISSUED_BY
          }
          isActive={column === QueryTermsOrderByColumn.ISSUED_BY}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'issued_by',
      key: 'issued_by',
      align: 'center',
      width: 200,
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.ISSUED_BY),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryTermsOrderByColumn.IS_APPROVED
          }
          isActive={column === QueryTermsOrderByColumn.IS_APPROVED}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'is_approved',
      key: 'is_approved',
      align: 'center',
      onHeaderCell: () => onHeaderClick(QueryTermsOrderByColumn.IS_APPROVED),
      render: (is_approved: boolean) => (
        <Badge
          textKey={is_approved ? 'Approved' : 'Waiting for approval'}
          color={
            is_approved
              ? 'bg-accent/10 text-accent'
              : 'bg-red-500/10 text-red-500'
          }
        />
      ),
    },
    {
      title: t('text-approval-action'),
      dataIndex: 'id',
      key: 'actions',
      align: 'center',
      render: (
        id: string,
        { slug, is_approved }: { slug: string; is_approved: boolean },
      ) => {
        return (
          <ActionButtons
            id={id}
            termApproveButton={permission}
            detailsUrl={
              shop
                ? `/${shop}/terms-and-conditions/${slug}`
                : `/terms-and-conditions/${slug}`
            }
            isTermsApproved={is_approved}
          />
        );
      },
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (slug: string, record: TermsAndConditions) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_TERMS"
          routes={Routes?.termsAndCondition}
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
          data={terms}
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

export default TermsAndConditionsLists;
