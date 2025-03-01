import { Table } from '@/components/ui/table';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useIsRTL } from '@/utils/locals';
import { CategoryWiseProduct } from '__generated__/__types__';
import PageHeading from '@/components/common/page-heading';

export type IProps = {
  products: CategoryWiseProduct[] | undefined;
  title: string;
  className?: string;
};

const ProductCountByCategory = ({ products, title, className }: IProps) => {
  // const router = useRouter();
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

  let columns = [
    {
      title: t('table:table-item-category-id'),
      dataIndex: 'category_id',
      key: 'category_id',
      align: alignLeft,
      width: 120,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-category-name'),
      className: 'cursor-pointer',
      dataIndex: 'category_name',
      key: 'category_name',
      align: alignLeft,
      width: 220,
      ellipsis: true,
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop_name',
      key: 'shop',
      align: alignLeft,
      ellipsis: true,
      width: 200,
      render: (shop_name: string) => (
        <span className="truncate whitespace-nowrap">{shop_name}</span>
      ),
    },
    {
      title: t('table:table-item-Product-count'),
      className: 'cursor-pointer',
      dataIndex: 'product_count',
      key: 'product_count',
      width: 180,
      align: 'center',
      render: (product_count: number) => {
        return <span>{product_count}</span>;
      },
    },
  ];

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-lg bg-white p-5 md:p-8',
          className
        )}
      >
        <div className="flex items-center justify-between pb-7">
          <PageHeading title={t(title)} />
          {/* <Search
            onSearch={() => null}
            placeholderText={t('form:input-placeholder-search-tracking-number')}
            className="max-w-sm"
          /> */}
        </div>
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
          data={products!}
          rowKey="category_id"
          scroll={{ x: 200 }}
        />
      </div>
    </>
  );
};

export default ProductCountByCategory;
