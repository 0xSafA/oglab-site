import { Table } from '@/components/ui/table';
import ActionButtons from '@/components/common/action-buttons';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  Shipping,
  QueryShippingClassesOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import { NoDataFound } from '@/components/icons/no-data-found';

export type IProps = {
  shippings: Shipping[] | undefined;
  refetch: Function;
};

const ShippingList = ({ shippings, refetch }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

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
      }, 300),
    [order]
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 150,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryShippingClassesOrderByColumn.Name
          }
          isActive={column === QueryShippingClassesOrderByColumn.Name}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryShippingClassesOrderByColumn.Name),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-amount')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryShippingClassesOrderByColumn.Amount
          }
          isActive={column === QueryShippingClassesOrderByColumn.Amount}
        />
      ),
      className: 'cursor-pointer',
      onHeaderCell: () =>
        onHeaderClick(QueryShippingClassesOrderByColumn.Amount),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
    },
    {
      title: t('table:table-item-global'),
      className: 'cursor-pointer',
      dataIndex: 'is_global',
      key: 'is_global',
      align: 'center',
      // onHeaderCell: () =>
      //   onHeaderClick(QueryShippingClassesOrderByColumn.IsGlobal),
      render: (value: boolean) => (
        <span className="capitalize">{value?.toString()}</span>
      ),
    },
    {
      title: t('table:table-item-type'),
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      // onHeaderCell: () => onHeaderClick(QueryShippingClassesOrderByColumn.Type),
      render: (value: boolean) => (
        <span className="capitalize">{value?.toString()}</span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      render: (id: string) => (
        <ActionButtons
          id={id}
          editUrl={`${Routes.shipping.list}/${id}/edit`}
          deleteModalView="DELETE_SHIPPING"
        />
      ),
      width: 200,
    },
  ];

  return (
    <div className="mb-8 overflow-hidden rounded shadow">
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
        data={shippings}
        rowKey="id"
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default ShippingList;
