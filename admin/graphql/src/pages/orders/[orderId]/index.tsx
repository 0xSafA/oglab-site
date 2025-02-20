import Card from '@/components/common/card';
import { DownloadIcon } from '@/components/icons/download-icon';
import Layout from '@/components/layouts/admin';
import OrderStatusProgressBox from '@/components/order/order-status-progress-box';
import OrderViewHeader from '@/components/order/order-view-header';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import ValidationError from '@/components/ui/form-validation-error';
import Loader from '@/components/ui/loader/loader';
import SelectInput from '@/components/ui/select-input';
import { Table } from '@/components/ui/table';
import { clearCheckoutAtom } from '@/contexts/checkout';
import { useCart } from '@/contexts/quick-cart/cart.context';
import {
  useGenerateInvoiceDownloadUrlMutation,
  useOrderQuery,
  useUpdateOrderMutation,
} from '@/graphql/orders.graphql';
import { siteSettings } from '@/settings/site.settings';
import { OrderStatus, PaymentStatus } from '@/types/custom-types';
import { adminOnly } from '@/utils/auth-utils';
import { formatAddress } from '@/utils/format-address';
import { formatString } from '@/utils/format-string';
import { useIsRTL } from '@/utils/locals';
import { ORDER_STATUS } from '@/utils/order-status';
import usePrice from '@/utils/use-price';
import { Attachment } from '__generated__/__types__';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormValues = {
  order_status: any;
};
export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const { query, locale } = useRouter();
  const { alignLeft, alignRight, isRTL } = useIsRTL();
  const { resetCart } = useCart();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);

  useEffect(() => {
    resetCart();
    //@ts-ignore
    resetCheckout();
  }, [resetCart, resetCheckout]);

  const [updateOrder, { loading: updating }] = useUpdateOrderMutation({
    onCompleted: () => {
      toast.success(t('common:successfully-updated'));
    },
  });

  const [generateInvoiceDownloadUrlMutation] =
    useGenerateInvoiceDownloadUrlMutation();

  const { data, loading, error } = useOrderQuery({
    variables: {
      id: query.orderId as string,
    },
    fetchPolicy: 'network-only',
  });

  async function handleDownloadInvoice() {
    const { data } = await generateInvoiceDownloadUrlMutation({
      variables: {
        input: {
          order_id: query.orderId as string,
          is_rtl: isRTL,
          language: locale!,
          translated_languages: {
            subtotal: t('order-sub-total'),
            discount: t('order-discount'),
            tax: t('order-tax'),
            delivery_fee: t('order-delivery-fee'),
            total: t('order-total'),
            products: t('text-products'),
            quantity: t('text-quantity'),
            invoice_no: t('text-invoice-no'),
            date: t('subtotal'),
            paid_from_wallet: t('text-paid_from_wallet'),
            amount_due: t('text-amount-due'),
          },
        },
      },
    });

    if (data?.generateInvoiceDownloadUrl) {
      let a = document.createElement('a');
      a.href = data?.generateInvoiceDownloadUrl;
      a.setAttribute('download', 'order-invoice');
      a.click();
    }
  }

  const {
    handleSubmit,
    control,

    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { order_status: data?.order?.order_status ?? '' },
  });

  const ChangeStatus = ({ order_status }: FormValues) => {
    updateOrder({
      variables: {
        input: {
          id: data?.order?.id as string,
          order_status: order_status?.status as string,
        },
      },
    });
  };
  const { price: subtotal } = usePrice(
    data && {
      amount: data?.order?.amount!,
    }
  );
  const { price: total } = usePrice(
    data && {
      amount: data?.order?.paid_total!,
    }
  );
  const { price: discount } = usePrice(
    data && {
      amount: data?.order?.discount! ?? 0,
    }
  );
  //@ts-ignore
  const { price: delivery_fee } = usePrice(
    data && {
      amount: data?.order?.delivery_fee!,
    }
  );
  const { price: sales_tax } = usePrice(
    data && {
      amount: data?.order?.sales_tax!,
    }
  );
  const { price: sub_total } = usePrice({ amount: data?.order?.amount! });
  const { price: shipping_charge } = usePrice({
    amount: data?.order?.delivery_fee ?? 0,
  });
  const { price: wallet_total } = usePrice({
    amount: data?.order?.wallet_point?.amount!,
  });

  const amountPayable: number =
    data?.order?.payment_status !== PaymentStatus.SUCCESS
      ? data?.order?.paid_total! - data?.order?.wallet_point?.amount!
      : 0;
  const { price: amountDue } = usePrice({ amount: amountPayable });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const columns = [
    {
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (image: Attachment) => (
        <div className="relative h-[50px] w-[50px]">
          <Image
            src={image?.thumbnail ?? siteSettings.product.placeholder}
            alt="alt text"
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-fill"
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      render: (name: string, item: any) => (
        <div>
          <span>{name}</span>
          <span className="mx-2">x</span>
          <span className="font-semibold text-heading">
            {item.pivot.order_quantity}
          </span>
        </div>
      ),
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'price',
      key: 'price',
      align: alignRight,
      render: function Render(_: any, item: any) {
        const { price } = usePrice({
          amount: item.pivot.subtotal,
        });
        return <span>{price}</span>;
      },
    },
  ];

  return (
    <div>
      <Card>
        <div className="mb-6 -mt-5 -ml-5 -mr-5 md:-mr-8 md:-ml-8 md:-mt-8">
          <OrderViewHeader order={data?.order} wrapperClassName="px-8 py-4" />
        </div>
        <div className="flex w-full">
          <Button
            onClick={handleDownloadInvoice}
            className="mb-5 bg-blue-500 ltr:ml-auto rtl:mr-auto"
          >
            <DownloadIcon className="h-4 w-4 me-3" />
            {t('common:text-download')} {t('common:text-invoice')}
          </Button>
        </div>

        <div className="flex flex-col items-center lg:flex-row">
          <h3 className="mb-8 w-full whitespace-nowrap text-center text-2xl font-semibold text-heading lg:mb-0 lg:w-1/3 lg:text-start">
            {t('form:input-label-order-id')} - {data?.order?.tracking_number}
          </h3>

          {data?.order?.order_status !== OrderStatus.FAILED &&
            data?.order?.order_status !== OrderStatus.CANCELLED && (
              <form
                onSubmit={handleSubmit(ChangeStatus)}
                className="flex w-full items-start ms-auto lg:w-2/4"
              >
                <div className="z-20 w-full me-5">
                  <SelectInput
                    name="order_status"
                    control={control}
                    getOptionLabel={(option: any) => option.name}
                    getOptionValue={(option: any) => option.status}
                    options={ORDER_STATUS.slice(0, 6)}
                    placeholder={t('form:input-placeholder-order-status')}
                  />

                  <ValidationError message={t(errors?.order_status?.message)} />
                </div>
                <Button loading={updating}>
                  <span className="hidden sm:block">
                    {t('form:button-label-change-status')}
                  </span>
                  <span className="block sm:hidden">
                    {t('form:form:button-label-change')}
                  </span>
                </Button>
              </form>
            )}
        </div>

        <div className="my-5 flex items-center justify-center lg:my-10">
          <OrderStatusProgressBox
            orderStatus={data?.order?.order_status as OrderStatus}
            paymentStatus={data?.order?.payment_status as PaymentStatus}
          />
        </div>

        <div className="mb-10">
          {data?.order ? (
            <Table
              //@ts-ignore
              columns={columns}
              emptyText={t('table:empty-table-data')}
              //@ts-ignore
              data={data?.order?.products!}
              rowKey="id"
              scroll={{ x: 300 }}
            />
          ) : (
            <span>{t('common:no-order-found')}</span>
          )}

          {data?.order?.parent_id! ? (
            <div className="flex w-full flex-col space-y-2 border-t-4 border-double border-border-200 px-4 py-4 ms-auto sm:w-1/2 md:w-1/3">
              <div className="flex items-center justify-between text-sm text-body">
                <span>{t('common:order-sub-total')}</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-heading">
                <span>{t('common:order-total')}</span>
                <span>{total}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col space-y-2 border-t-4 border-double border-border-200 px-4 py-4 ms-auto sm:w-1/2 md:w-1/3">
                <div className="flex items-center justify-between text-sm text-body">
                  <span>{t('common:order-sub-total')}</span>
                  <span>{sub_total}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-body">
                  <span> {t('text-shipping-charge')}</span>
                  <span>{shipping_charge}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-body">
                  <span> {t('text-tax')}</span>
                  <span>{sales_tax}</span>
                </div>
                {/* @ts-ignore */}
                {data?.order?.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-body">
                    <span>{t('text-discount')}</span>
                    <span>{discount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-semibold text-heading">
                  <span> {t('text-total')}</span>
                  <span>{total}</span>
                </div>

                {data?.order?.wallet_point?.amount && (
                  <>
                    <div className="flex items-center justify-between text-sm text-body">
                      <span> {t('text-paid-from-wallet')}</span>
                      <span>{wallet_total}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold text-heading">
                      <span> {t('text-amount-due')}</span>
                      <span>{amountDue}</span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="mb-10 w-full sm:mb-0 sm:w-1/2 sm:pe-8">
            <h3 className="mb-3 border-b border-border-200 pb-2 font-semibold text-heading">
              {t('text-order-details')}
            </h3>

            <div className="flex flex-col items-start space-y-1 text-sm text-body">
              <span>
                {formatString(data?.order?.products?.length, t('text-item'))}
              </span>
              <span>{data?.order?.delivery_time}</span>
            </div>
          </div>
          <div className="mb-10 w-full sm:mb-0 sm:w-1/2 sm:pe-8">
            <h3 className="mb-3 border-b border-border-200 pb-2 font-semibold text-heading">
              {t('common:billing-address')}
            </h3>

            <div className="flex flex-col items-start space-y-1 text-sm text-body">
              <span>{data?.order?.customer_name}</span>
              {data?.order?.billing_address && (
                <span>{formatAddress(data?.order.billing_address)}</span>
              )}
              {data?.order?.customer_contact && (
                <span>{data?.order?.customer_contact}</span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/2 sm:ps-8">
            <h3 className="mb-3 border-b border-border-200 pb-2 font-semibold text-heading text-start sm:text-end">
              {t('common:shipping-address')}
            </h3>

            <div className="flex flex-col items-start space-y-1 text-sm text-body text-start sm:items-end sm:text-end">
              <span>{data?.order?.customer_name}</span>
              {data?.order?.shipping_address && (
                <span>{formatAddress(data?.order.shipping_address)}</span>
              )}
              {data?.order?.customer_contact && (
                <span>{data?.order?.customer_contact}</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
OrderDetailsPage.authenticate = {
  permissions: adminOnly,
};
OrderDetailsPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form', 'table'])),
  },
});
