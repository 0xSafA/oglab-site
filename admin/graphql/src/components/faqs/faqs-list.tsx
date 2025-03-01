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
import { Faqs, PaginatorInfo, SortOrder } from '__generated__/__types__';
import { debounce } from 'lodash';
import { QueryFaqsOrderByColumn } from '@/types/custom-types';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

type IProps = {
  faqs: Faqs[] | undefined;
  paginatorInfo: PaginatorInfo | null;
  onPagination: (current: number) => void;
  refetch: Function;
};
const FaqsLists = ({
  faqs,
  paginatorInfo,
  onPagination,
  refetch
}: IProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { alignLeft, alignRight } = useIsRTL();
  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();

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
            order === SortOrder.Asc && column === QueryFaqsOrderByColumn.ID
          }
          isActive={column === QueryFaqsOrderByColumn.ID}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 120,
      onHeaderCell: () => onHeaderClick(QueryFaqsOrderByColumn.ID),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title-title')}
          ascending={
            order === SortOrder.Asc && column === QueryFaqsOrderByColumn.NAME
          }
          isActive={column === QueryFaqsOrderByColumn.NAME}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'faq_title',
      key: 'faq_title',
      align: alignLeft,
      ellipsis: true,
      width: 200,
      onHeaderCell: () => onHeaderClick(QueryFaqsOrderByColumn.NAME),
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
            column === QueryFaqsOrderByColumn.DESCRIPTION
          }
          isActive={column === QueryFaqsOrderByColumn.DESCRIPTION}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'faq_description',
      key: 'faq_description',
      align: alignLeft,
      width: 300,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick(QueryFaqsOrderByColumn.DESCRIPTION),
      render: (text: string) => (
        <span
          dangerouslySetInnerHTML={{
            __html: text?.length < 140 ? text : text?.substring(0, 140) + '...',
          }}
        />
      ),
    },

    {
      title: (
        <TitleWithSort
          title={t('table:table-item-type')}
          ascending={
            order === SortOrder.Asc && column === QueryFaqsOrderByColumn.TYPE
          }
          isActive={column === QueryFaqsOrderByColumn.TYPE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'faq_type',
      key: 'faq_type',
      align: 'center',
      width: 100,
      onHeaderCell: () => onHeaderClick(QueryFaqsOrderByColumn.TYPE),
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
            column === QueryFaqsOrderByColumn.ISSUED_BY
          }
          isActive={column === QueryFaqsOrderByColumn.ISSUED_BY}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'issued_by',
      key: 'issued_by',
      align: 'center',
      width: 100,
      onHeaderCell: () => onHeaderClick(QueryFaqsOrderByColumn.ISSUED_BY),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },

    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (slug: string, record: Faqs) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_FAQ"
          routes={Routes?.faqs}
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
          data={faqs}
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

export default FaqsLists;
