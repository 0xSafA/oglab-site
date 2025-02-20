import { useMemo, useState } from 'react';
import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table, AlignType } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import { useTranslation } from 'next-i18next';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Switch } from '@headlessui/react';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';

import {
  Attachment,
  Manufacturer,
  ManufacturerPaginator,
  QueryManufacturersOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { useUpdateManufacturerMutation } from '@/graphql/manufacturers.graphql';
import { NoDataFound } from '@/components/icons/no-data-found';
import { toast } from 'react-toastify';

type IProps = {
  manufacturers: ManufacturerPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const ManufacturerList = ({ manufacturers, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = manufacturers!;
  const { t } = useTranslation();
  const router = useRouter();

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
            column === QueryManufacturersOrderByColumn.Id
          }
          isActive={column === QueryManufacturersOrderByColumn.Id}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 160,
      onHeaderCell: () => onHeaderClick(QueryManufacturersOrderByColumn.Id),
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryManufacturersOrderByColumn.Name
          }
          isActive={column === QueryManufacturersOrderByColumn.Name}
        />
      ),
      dataIndex: 'name',
      key: 'name',
      width: 220,
      align: 'left',
      className: 'cursor-pointer',
      onHeaderCell: () => onHeaderClick(QueryManufacturersOrderByColumn.Name),
      render: (name: string, { image }: { image: Attachment }) => {
        return (
          <div className="flex items-center">
            <div className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded border border-border-200/80 bg-gray-100 me-2.5">
              <Image
                src={image?.thumbnail ?? siteSettings?.product?.placeholder}
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
      title: t('table:table-item-products'),
      dataIndex: 'products_count',
      key: 'products_count',
      width: 120,
      align: 'center' as AlignType,
    },
    {
      title: t('table:table-item-approval-action'),
      dataIndex: 'is_approved',
      key: 'approve',
      align: 'center' as AlignType,
      width: 150,
      render: function Render(is_approved: boolean, record: any) {
        const [updateManufacturer] = useUpdateManufacturerMutation({
          onCompleted: () => {
            toast.success(t('common:successfully-updated'));
          }
        });

        function handleOnClick() {
          updateManufacturer({
            variables: {
              input: {
                slug: record?.slug,
                language: router.locale,
                id: record?.id,
                name: record?.name,
                is_approved: !is_approved,
                type_id: record?.type.id,
              },
            },
          });
        }

        return (
          <>
            <Switch
              checked={is_approved}
              onChange={handleOnClick}
              className={`${
                is_approved ? 'bg-accent' : 'bg-gray-300'
              } relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none`}
              dir="ltr"
            >
              <span className="sr-only">Enable</span>
              <span
                className={`${
                  is_approved ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-light`}
              />
            </Switch>
          </>
        );
      },
    },
    {
      title: t('table:table-item-slug'),
      dataIndex: 'slug',
      key: 'slug',
      align: 'center',
      width: 200,
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right' as AlignType,
      width: 120,
      render: (slug: string, record: Manufacturer) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_MANUFACTURER"
          routes={Routes?.manufacturer}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter(
      (col) => col?.key !== 'approve' && col?.key !== 'actions'
    );
  }

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

export default ManufacturerList;
