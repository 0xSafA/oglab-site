import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import { siteSettings } from '@/settings/site.settings';
import { QueryProductsOrderByColumn } from '@/types/custom-types';
import { useIsRTL } from '@/utils/locals';
import { Product, ProductPaginator, SortOrder } from '__generated__/__types__';
import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

export type IProps = {
  products: ProductPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const ProductInventoryList = ({ products, onPagination, refetch }: IProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    query: { shop },
  } = router;
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

  let columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 130,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-title')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryProductsOrderByColumn.NAME
          }
          isActive={column === QueryProductsOrderByColumn.NAME}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 280,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick(QueryProductsOrderByColumn.NAME),
      render: (name: string, { image, type }: { image: any; type: any }) => (
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
          <div className="flex flex-col">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate whitespace-nowrap pt-1 pb-0.5 text-[13px] text-body/80">
              {type?.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: t('table:table-item-sku'),
      dataIndex: 'sku',
      key: 'sku',
      width: 200,
      align: alignLeft,
      ellipsis: true,
      render: (sku: any) => (
        <span className="truncate whitespace-nowrap">{sku}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-quantity')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryProductsOrderByColumn.QUANTITY
          }
          isActive={column === QueryProductsOrderByColumn.QUANTITY}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 150,
      onHeaderCell: () => onHeaderClick(QueryProductsOrderByColumn.QUANTITY),
      render: (quantity: number) => {
        if (quantity < 10) {
          return (
            <>
              <div
                className={`flex justify-start ${
                  quantity > 0 && quantity < 10
                    ? 'flex-col items-baseline space-y-3 3xl:flex-row 3xl:space-x-2 3xl:space-y-0 rtl:3xl:space-x-reverse'
                    : 'items-center space-x-2 rtl:space-x-reverse'
                }`}
              >
                {quantity < 1 ? (
                  <Badge
                    text={t('common:text-out-of-stock')}
                    color="bg-status-failed/10 text-status-failed"
                    className="capitalize"
                  />
                ) : (
                  <Badge
                    text={t('common:text-low-quantity')}
                    color="bg-status-failed/10 text-status-failed"
                    animate={true}
                    className="capitalize"
                  />
                )}
                <span>{quantity}</span>
              </div>
            </>
          );
        }
        return <span>{quantity}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-sold-quantity')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryProductsOrderByColumn.SOLD_QUANTITY
          }
          isActive={column === QueryProductsOrderByColumn.SOLD_QUANTITY}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'sold_quantity',
      key: 'sold_quantity',
      width: 120,
      align: 'center',
      onHeaderCell: () =>
        onHeaderClick(QueryProductsOrderByColumn.SOLD_QUANTITY),
      render: (sold_quantity: number) => (
        <span className="truncate whitespace-nowrap">{sold_quantity}</span>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right',
      width: 120,
      render: (slug: string, record: Product) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_PRODUCT"
          routes={Routes?.inventory}
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
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          /* @ts-ignore */
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
          data={products?.data}
          rowKey="id"
          scroll={{ x: 900 }}
        />
      </div>

      {!!products?.paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={products?.paginatorInfo?.total}
            current={products?.paginatorInfo?.currentPage}
            pageSize={products?.paginatorInfo?.perPage}
            onChange={onPagination}
            showLessItems
          />
        </div>
      )}
    </>
  );
};

export default ProductInventoryList;
