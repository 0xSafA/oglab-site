import Pagination from '@/components/ui/pagination';
import Image from 'next/image';
import { Table, AlignType } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import Badge from '@/components/ui/badge/badge';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import {
  Product,
  ProductPaginator,
  ProductType,
  Shop,
  SortOrder,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { QueryProductsOrderByColumn } from '@/types/custom-types';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { NoDataFound } from '@/components/icons/no-data-found';

export type IProps = {
  products?: ProductPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const ProductList = ({ products, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = products || {};
  const router = useRouter();
  const {
    query: { shop },
  } = router;
  const { t } = useTranslation();
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
    [order],
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
          title={t('table:table-item-product')}
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
      title: t('table:table-item-product-type'),
      dataIndex: 'product_type',
      key: 'product_type',
      width: 150,
      align: alignLeft,
      render: (product_type: string) => (
        <span className="truncate whitespace-nowrap capitalize">
          {product_type ? product_type?.toLowerCase() : ''}
        </span>
      ),
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop',
      key: 'shop',
      width: 170,
      align: 'left',
      ellipsis: true,
      render: (shop: Shop) => (
        <div className="flex items-center font-medium">
          <div className="relative aspect-square h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-200/80 bg-gray-100 me-2">
            <Image
              src={shop?.logo?.thumbnail ?? siteSettings?.product?.placeholder}
              alt={shop?.name ?? 'Shop Name'}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <span className="truncate">{shop?.name}</span>
        </div>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-unit')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryProductsOrderByColumn.PRICE
          }
          isActive={column === QueryProductsOrderByColumn.PRICE}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'price',
      key: 'price',
      align: alignRight as AlignType,
      width: 180,
      onHeaderCell: () => onHeaderClick(QueryProductsOrderByColumn.PRICE),
      render: function Render(value: number, record: Product) {
        const { price: max_price } = usePrice({
          amount: record?.max_price as number,
        });
        const { price: min_price } = usePrice({
          amount: record?.min_price as number,
        });

        const { price } = usePrice({
          amount: value,
        });

        const renderPrice =
          record?.product_type === ProductType.Variable
            ? `${min_price} - ${max_price}`
            : price;

        return (
          <span className="whitespace-nowrap" title={renderPrice}>
            {renderPrice}
          </span>
        );
      },
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
      align: 'center' as AlignType,
      width: 170,
      onHeaderCell: () => onHeaderClick(QueryProductsOrderByColumn.QUANTITY),
      render: (quantity: number) => {
        if (quantity < 1) {
          return (
            <Badge
              text={t('common:text-out-of-stock')}
              color="bg-status-failed/10 text-status-failed"
              className="capitalize"
            />
          );
        }
        return <span>{quantity}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            order === SortOrder.Asc &&
            column === QueryProductsOrderByColumn.STATUS
          }
          isActive={column === QueryProductsOrderByColumn.STATUS}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'status',
      key: 'status',
      align: 'left' as AlignType,
      width: 200,
      onHeaderCell: () => onHeaderClick(QueryProductsOrderByColumn.STATUS),
      render: (status: string, record: any) => (
        <div
          className={`flex justify-start ${
            record?.quantity > 0 && record?.quantity < 10
              ? 'flex-col items-baseline space-y-2 3xl:flex-row 3xl:space-x-2 3xl:space-y-0 rtl:3xl:space-x-reverse'
              : 'items-center space-x-2 rtl:space-x-reverse'
          }`}
        >
          <Badge
            text={status ? status?.toLowerCase() : ''}
            color={
              status.toLocaleLowerCase() === 'draft'
                ? 'bg-yellow-400/10 text-yellow-500'
                : 'bg-accent bg-opacity-10 !text-accent'
            }
            className="capitalize"
          />
          {record?.quantity > 0 && record?.quantity < 10 && (
            <Badge
              text={t('common:text-low-quantity')}
              color="bg-status-failed/10 text-status-failed"
              animate={true}
              className="capitalize"
            />
          )}
        </div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'slug',
      key: 'actions',
      align: 'right' as AlignType,
      width: 120,
      render: (slug: string, record: Product) => (
        <LanguageSwitcher
          slug={slug}
          record={record}
          deleteModalView="DELETE_PRODUCT"
          routes={Routes?.product}
          enablePreviewMode={true}
          isShop={Boolean(shop)}
          shopSlug={(shop as string) ?? ''}
        />
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((col) => col?.key !== 'shop');
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

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
            showLessItems
          />
        </div>
      )}
    </>
  );
};

export default ProductList;
