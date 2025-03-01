import Search from '@/components/common/search';
import { NoDataFound } from '@/components/icons/no-data-found';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { AlignType, Table } from '@/components/ui/table';
import { siteSettings } from '@/settings/site.settings';
import { useIsInvalidPrice } from '@/utils/is-invalid-price';
import { useIsRTL } from '@/utils/locals';
import usePrice from '@/utils/use-price';
import {
  Attachment,
  Product,
  ProductPaginator,
  ProductType,
} from '__generated__/__types__';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';

export type IProps = {
  products: Product[] | undefined;
  type: string;
  rate: number;
  paginatorInfo: ProductPaginator['paginatorInfo'] | null;
  onPagination: (current: number) => void;
  handleSearch: (data: SearchValue) => void;
};

type SearchValue = {
  searchText: string;
};

const FlashSaleProductList = ({
  products,
  handleSearch,
  onPagination,
  paginatorInfo,
  type,
  rate,
}: IProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

  let columns = [
    {
      title: t('table:table-item-image'),
      dataIndex: 'image',
      key: 'image',
      align: alignLeft as AlignType,
      width: 280,
      render: (image: Attachment, { name }: { name: string }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image
              src={image?.thumbnail ?? siteSettings.product.placeholder}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw"
              className="block h-full w-full rounded-full"
            />
          </div>
          <h2 className="truncate">{name}</h2>
        </div>
      ),
    },
    {
      title: t('table:table-item-sku'),
      dataIndex: 'sku',
      key: 'sku',
      align: alignLeft as AlignType,
      render: (sku: string) => {
        return <span className="truncate whitespace-nowrap">{sku}</span>;
      },
    },
    {
      title: t('table:table-item-product-type'),
      dataIndex: 'product_type',
      key: 'product_type',
      align: alignLeft as AlignType,
      render: (product_type: string) => (
        <span className="truncate whitespace-nowrap capitalize">
          {product_type}
        </span>
      ),
    },
    {
      title: t('table:table-item-unit'),
      dataIndex: 'price',
      key: 'price',
      align: alignLeft as AlignType,
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
    // {
    //   title: t('table:table-item-deal-offering'),
    //   dataIndex: 'price',
    //   key: 'price',
    //   align: alignLeft as AlignType,
    //   render: function Render(value: number, record: Product) {
    //     let discountedPrice: number,
    //       discountedMaxPrice: number,
    //       discountedMindPrice: number,
    //       warningText: string,
    //       renderPrice: string;

    //     // calculating percentage
    //     if (type === 'percentage') {
    //       if (record?.product_type === ProductType.Variable) {
    //         const minPrice = record?.min_price as number;
    //         const maxPrice = record?.max_price as number;

    //         discountedMindPrice = minPrice - minPrice * (Number(rate) / 100);
    //         discountedMaxPrice = maxPrice - maxPrice * (Number(rate) / 100);
    //       }

    //       if (record?.product_type === ProductType.Simple) {
    //         discountedPrice = value - value * (Number(rate) / 100);
    //       }
    //     }

    //     // calculating fixed rate
    //     if (type === 'fixed_rate') {
    //       if (record?.product_type === ProductType.Variable) {
    //         const minPrice = record?.min_price as number;
    //         const maxPrice = record?.max_price as number;

    //         discountedMindPrice = minPrice - Number(rate);
    //         discountedMaxPrice = maxPrice - Number(rate);
    //       }

    //       if (record?.product_type === ProductType.Simple) {
    //         discountedPrice = value - Number(rate);
    //       }
    //     }

    //     // formatting pricing markup
    //     const { price: max_price } = usePrice({
    //       amount: discountedMaxPrice!,
    //     });
    //     const { price: min_price } = usePrice({
    //       amount: discountedMindPrice!,
    //     });

    //     const { price } = usePrice({
    //       amount: discountedPrice!,
    //     });

    //     // preparing for display
    //     switch (type) {
    //       case 'percentage':
    //         renderPrice =
    //           record?.product_type === ProductType?.Variable
    //             ? `${min_price} - ${max_price}`
    //             : price;
    //         break;

    //       case 'fixed_rate':
    //         if (record?.product_type === ProductType?.Variable) {
    //           if ((discountedMaxPrice! || discountedMindPrice!) <= 0) {
    //             warningText = 'Invalid price';
    //           }
    //         }

    //         if (record?.product_type === ProductType?.Simple) {
    //           if (discountedPrice! <= 0) {
    //             warningText = 'Invalid price';
    //           }
    //         }

    //         renderPrice =
    //           record?.product_type === ProductType?.Variable
    //             ? `${min_price} - ${max_price}`
    //             : `${price}`;
    //         break;
    //     }

    //     return (
    //       <>
    //         <span className="whitespace-nowrap" title={renderPrice!}>
    //           {renderPrice!}
    //         </span>{' '}
    //         {type === 'fixed_rate' && warningText! == 'Invalid price' ? (
    //           <>
    //             <Badge text={warningText!} color="bg-red-600" animate={true} />
    //           </>
    //         ) : (
    //           ''
    //         )}
    //       </>
    //     );
    //   },
    // },
    {
      title: t('table:table-item-deal-offering'),
      dataIndex: 'price',
      key: 'price',
      align: alignLeft as AlignType,
      render: function Render(record: Product) {
        let renderPrice: string, warningText: string;

        const { price: minPrice } = usePrice({
          amount: Number(record?.min_price),
        });
        const { price: maxPrice } = usePrice({
          amount: Number(record?.max_price),
        });
        const { price } = usePrice({
          amount: record?.sale_price
            ? Number(record?.sale_price)
            : Number(record?.price),
          baseAmount: Number(record?.price),
        });

        const isInvalidPrice = useIsInvalidPrice({
          type,
          product_type: record?.product_type,
          min_price: Number(record?.min_price),
          max_price: Number(record?.max_price),
          rate: Number(rate),
        });

        // preparing for display
        switch (type) {
          case 'percentage':
            renderPrice =
              record?.product_type === ProductType?.Variable
                ? `${minPrice} - ${maxPrice}`
                : price;
            break;

          case 'fixed_rate':
            if (record?.product_type === ProductType?.Variable) {
              if (isInvalidPrice?.isInvalidPrice) {
                warningText = 'Invalid price';
              }
            }

            if (record?.product_type === ProductType?.Simple) {
              if (isInvalidPrice?.isInvalidPrice) {
                warningText = 'Invalid price';
              }
            }

            renderPrice =
              record?.product_type === ProductType?.Variable
                ? `${minPrice} - ${maxPrice}`
                : `${price}`;
            break;
        }

        return (
          <>
            <span className="whitespace-nowrap" title={renderPrice!}>
              {renderPrice!}
            </span>{' '}
            {type === 'fixed_rate' && warningText! == 'Invalid price' ? (
              <>
                <Badge text={warningText!} color="bg-red-600" animate={true} />
              </>
            ) : (
              ''
            )}
          </>
        );
      },
    },
    {
      title: t('table:table-item-quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      align: alignLeft as AlignType,
      render: (quantity: number) => {
        if (quantity < 1) {
          return (
            <Badge
              text={t('common:text-out-of-stock')}
              color="bg-red-500 text-white"
            />
          );
        }
        return <span>{quantity}</span>;
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'status',
      key: 'status',
      align: 'left' as AlignType,
      render: (status: string, record: any) => (
        <div
          className={`flex justify-start ${
            record?.quantity > 0 && record?.quantity < 10
              ? 'flex-col items-baseline space-y-3 3xl:flex-row 3xl:space-x-3 3xl:space-y-0 rtl:3xl:space-x-reverse'
              : 'items-center space-x-3 rtl:space-x-reverse'
          }`}
        >
          <Badge
            text={status}
            className={classNames(
              'bg-opacity-10 capitalize',
              status?.toLocaleLowerCase() === 'draft'
                ? 'bg-[#F3AF00] text-[#F3AF00]'
                : 'bg-accent text-accent'
            )}
          />
          {record?.quantity > 0 && record?.quantity < 10 && (
            <Badge
              text={t('common:text-low-quantity')}
              color="bg-red-600"
              animate={true}
              className="capitalize"
            />
          )}
        </div>
      ),
    },
  ];

  if (router?.query?.shop) {
    columns = columns?.filter((column) => column?.key !== 'shop');
  }

  return (
    <>
      <div className="rounded-lg bg-white p-7">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:gap-0">
          <h2 className="pr-4 text-lg font-semibold">
            {t('common:text-deals')}
          </h2>
          <div className="w-[20.8125rem]">
            <Search
              onSearch={handleSearch}
              placeholderText={t('form:input-placeholder-search-deals')}
              inputClassName="h-auto py-2 px-3 border-[#DFDFDF] rounded-md"
            />
          </div>
        </div>
        <Table
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
          data={products}
          rowKey="id"
          scroll={{ x: 900 }}
          className="flash-sale-table"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 md:flex-nowrap md:gap-0">
          {!!paginatorInfo?.total && (
            <div className="ml-auto w-full md:w-auto">
              <Pagination
                total={paginatorInfo?.total}
                current={paginatorInfo?.currentPage}
                pageSize={paginatorInfo?.perPage}
                onChange={onPagination}
                showLessItems
                className="flash-sale-pagination"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FlashSaleProductList;
