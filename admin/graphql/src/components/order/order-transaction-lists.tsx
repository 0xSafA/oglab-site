import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/utils/locals';
import { useMemo, useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
// import { useRouter } from 'next/router';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import { NoDataFound } from '@/components/icons/no-data-found';
import { OrderPaginator, SortOrder } from '__generated__/__types__';
// import { useCreateConversation } from '../message/data/conversations';
import { debounce } from 'lodash';

type IProps = {
  orders: OrderPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const OrderTransactionList = ({ orders, onPagination, refetch }: IProps) => {
  const { t } = useTranslation();
  const { data, paginatorInfo } = orders! ?? {};
  const rowExpandable = (record: any) => record.children?.length;
  const { alignLeft } = useIsRTL();

  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();
  // const [loading, setLoading] = useState<boolean | string | undefined>(false);
  // const { createConversation } = useCreateConversation();

  // const onSubmit = async (shop_id: string | undefined) => {
  //   setLoading(shop_id);
  //   createConversation({
  //     variables: {
  //       input: {
  //         // @ts-ignore
  //         shop_id,
  //       },
  //     },
  //   });
  // };

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          sortedBy: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
          orderBy: value,
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
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: 'center',
      width: 150,
    },
    // {
    //   title: 'Customer',
    //   dataIndex: 'customer_name',
    //   key: 'customer_name',
    //   align: 'center',
    //   width: 150,
    //   render: (customer_name: string) => <div>{customer_name}</div>,
    // },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-total')}
          ascending={order === SortOrder.Asc && column === 'paid_total'}
          isActive={column === 'paid_total'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'paid_total',
      key: 'paid_total',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('paid_total'),
      render: function Render(paid_total: any) {
        const paid_total_amount = paid_total ? paid_total : 0;
        const { price } = usePrice({
          amount: paid_total_amount,
        });
        return <span className="whitespace-nowrap">{price}</span>;
      },
    },
    {
      title: t('table:table-item-product-price'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: function Render(amount: any) {
        const sales_tax_amount = amount ? amount : 0;
        const { price } = usePrice({
          amount: sales_tax_amount,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-delivery-fee'),
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      align: 'center',
      render: function Render(value: any) {
        const delivery_fee = value ? value : 0;
        const { price } = usePrice({
          amount: delivery_fee,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-taxable-amount'),
      dataIndex: 'sales_tax',
      key: 'sales_tax',
      align: 'center',
      render: function Render(sales_tax: any) {
        const sales_tax_amount = sales_tax ? sales_tax : 0;
        const { price } = usePrice({
          amount: sales_tax_amount,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-discount'),
      dataIndex: 'discount',
      key: 'discount',
      align: 'center',
      render: function Render(discount: any) {
        const sales_tax_amount = discount ? discount : 0;
        const { price } = usePrice({
          amount: sales_tax_amount,
        });
        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-payment-gateway'),
      dataIndex: 'payment_gateway',
      key: 'payment_gateway',
      align: alignLeft,
      render: (payment_gateway: string) => <div>{payment_gateway}</div>,
    },
    {
      title: t('table:table-item-payment-status'),
      dataIndex: 'payment_status',
      key: 'payment_status',
      align: 'center',
      render: (payment_status: string) => (
        <Badge text={t(payment_status)} color={StatusColor(payment_status)} />
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
          data={data}
          rowKey="id"
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderTransactionList;
