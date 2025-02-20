import LanguageSwitcher from '@/components/ui/lang-action/action';
import { Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import { useIsRTL } from '@/utils/locals';
import {
  Attribute,
  QueryAttributesOrderByColumn,
  SortOrder
} from '__generated__/__types__';
import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { NoDataFound } from '@/components/icons/no-data-found';

export type IProps = {
  attributes: Attribute[] | undefined;
  refetch: Function;
};
const AttributeList = ({ attributes, refetch }: IProps) => {
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

  let columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryAttributesOrderByColumn.Id
          }
          isActive={column === QueryAttributesOrderByColumn.Id}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 140,
      onHeaderCell: () => onHeaderClick(QueryAttributesOrderByColumn.Id),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryAttributesOrderByColumn.Name
          }
          isActive={column === QueryAttributesOrderByColumn.Name}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 180,
      onHeaderCell: () => onHeaderClick(QueryAttributesOrderByColumn.Name),
      render: (name: any) => <span className="whitespace-nowrap">{name}</span>,
    },
    {
      title: t('table:table-item-values'),
      dataIndex: 'values',
      key: 'values',
      align: alignLeft,
      width: 320,
      render: (values: any) => {
        return (
          <div className="flex flex-wrap gap-1.5 whitespace-nowrap">
            {values?.map((singleValues: any, index: number) => (
              <span key={index} className="rounded bg-gray-200/50 px-2.5 py-1">
                {singleValues.value}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: t('table:table-item-slug'),
      dataIndex: 'slug',
      key: 'slug',
      align: alignLeft,
      width: 180,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: alignRight,
      width: 120,
      render: (slug: string, record: Attribute) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_ATTRIBUTE"
          routes={Routes?.attribute}
          isShop={Boolean(shop)}
          shopSlug={(shop as string) ?? ''}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((column) => column?.key !== 'shop');
  }

  return (
    <div className="rounded overflow-hidden shadow mb-8">
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
        data={attributes}
        rowKey="id"
        scroll={{ x: 900 }}
      />
    </div>
  );
};

export default AttributeList;
