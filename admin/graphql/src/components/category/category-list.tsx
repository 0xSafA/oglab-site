import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { getIcon } from '@/utils/get-icon';
import * as categoriesIcon from '@/components/icons/category';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  Category,
  CategoryPaginator,
  SortOrder,
  QueryCategoriesOrderByColumn,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import debounce from 'lodash/debounce';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { siteSettings } from '@/settings/site.settings';
import { NoDataFound } from '@/components/icons/no-data-found';

export type IProps = {
  categories: CategoryPaginator | undefined | null;
  onPagination: (key: number) => void;
  refetch: Function;
};

const CategoryList = ({ categories, onPagination, refetch }: IProps) => {
  const { t } = useTranslation();
  const { data, paginatorInfo } = categories!;
  const rowExpandable = (record: any) => record.children?.length;
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
      align: 'left',
      width: 120,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCategoriesOrderByColumn.Name
          }
          isActive={column === QueryCategoriesOrderByColumn.Name}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 180,
      onHeaderCell: () => onHeaderClick(QueryCategoriesOrderByColumn.Name),
      render: (name: string, { image }: { image: any }) => {
        return (
          <div className="flex items-center">
            <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
              <Image
                src={image?.thumbnail ?? siteSettings.product.placeholder}
                alt={name}
                fill
                priority={true}
                sizes="(max-width: 768px) 100vw"
              />
            </div>
            <span className="truncate font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      title: t('table:table-item-details'),
      dataIndex: 'details',
      key: 'details',
      align: alignLeft,
      ellipsis: true,
      width: 200,
    },
    {
      title: t('table:table-item-icon'),
      dataIndex: 'icon',
      key: 'icon',
      align: 'center',
      width: 120,
      render: (icon: string) => {
        if (!icon) return null;
        return (
          <span className="flex items-center justify-center">
            {getIcon({
              iconList: categoriesIcon,
              iconName: icon,
              className: 'w-5 h-5 max-h-full max-w-full',
            })}
          </span>
        );
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-slug')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryCategoriesOrderByColumn.Slug
          }
          isActive={column === QueryCategoriesOrderByColumn.Slug}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'slug',
      key: 'slug',
      align: alignLeft,
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryCategoriesOrderByColumn.Slug),
    },
    {
      title: t('table:table-item-group'),
      dataIndex: 'type',
      key: 'type',
      align: alignLeft,
      width: 120,
      render: (type: any) => (
        <div
          className="overflow-hidden truncate whitespace-nowrap"
          title={type?.name}
        >
          {type?.name}
        </div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (slug: string, record: Category) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_CATEGORY"
          routes={Routes?.category}
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
          //@ts-ignore
          data={data}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo.total && (
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

export default CategoryList;
