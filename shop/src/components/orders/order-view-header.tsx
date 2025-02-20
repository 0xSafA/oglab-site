import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import StatusColor from '@/components/orders/status-color';
import Badge from '@/components/ui/badge';
import PayNowButton from '@/components/payment/pay-now-button';
import { isPaymentPending } from '@/lib/is-payment-pending';
import { SpinnerLoader } from '@/components/ui/loaders/spinner/spinner';
import ChangeGateway from '@/components/payment/gateway-control/change-gateway';
import { useSettings } from '@/framework/settings';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useModalState } from '@/components/ui/modal/modal.context';
import { Order, PaymentGateway, RefundStatus } from '@/types';

interface OrderViewHeaderProps {
  order: Order;
  wrapperClassName?: string;
  buttonSize?: 'big' | 'medium' | 'small';
  loading?: boolean;
}

export default function OrderViewHeader({
  order,
  wrapperClassName = 'lg:px-11 lg:py-5 p-6',
  buttonSize = 'medium',
  loading = false,
}: OrderViewHeaderProps) {
  const { settings, isLoading } = useSettings();
  const { t } = useTranslation('common');
  const isPaymentActionPending = isPaymentPending(
    //@ts-ignore
    order?.payment_gateway,
    order?.order_status,
    order?.payment_status,
  );
  const paymentGateway = settings?.paymentGateway;
  return (
    <div className={cn(`bg-[#F7F8FA] ${wrapperClassName}`)}>
      <div className="flex flex-col flex-wrap items-center justify-between mb-0 text-base font-bold gap-x-8 text-heading sm:flex-row lg:flex-nowrap">
        <div
          className={`order-2 grid w-full grid-cols-1 gap-6 xs:flex-nowrap sm:order-1 ${
            !isPaymentActionPending
              ? 'max-w-full basis-full justify-between'
              : 'max-w-full basis-full justify-between lg:ltr:mr-auto'
          } ${
            order?.refund?.status === RefundStatus?.APPROVED?.toLowerCase()
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="block text-xs shrink-0 grow-0 basis-auto xs:text-base lg:inline-block">
              {t('text-order-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.order_status)}
                  color={StatusColor(order?.order_status)}
                  className="min-h-[2rem] items-center justify-center text-[9px] !leading-none xs:text-sm"
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 md:ml-auto">
            <span className="block text-xs shrink-0 grow-0 basis-auto xs:text-base lg:inline-block">
              {t('text-payment-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.payment_status)}
                  color={StatusColor(order?.payment_status)}
                  className="min-h-[2rem] items-center justify-center truncate whitespace-nowrap text-[9px] !leading-none xs:text-sm"
                />
              )}
            </div>
          </div>
          {order?.refund?.status === RefundStatus?.APPROVED?.toLowerCase() ? (
            <div className="flex items-center gap-3">
              <span className="block text-xs shrink-0 grow-0 basis-auto xs:text-base lg:inline-block">
                Refund Status
              </span>
              <div className="w-full lg:w-auto">
                {loading ? (
                  <SpinnerLoader />
                ) : (
                  <Badge
                    text={t(order?.refund?.status)}
                    color={StatusColor(order?.payment_status)}
                    className="min-h-[2rem] items-center justify-center truncate whitespace-nowrap text-[9px] capitalize !leading-none xs:text-sm"
                  />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        {!isLoading && !isEmpty(paymentGateway) ? (
          <>
            {isPaymentActionPending && (
              <span className="order-2 w-full max-w-full mt-5 shrink-0 basis-full sm:order-1 lg:mt-0 lg:w-auto lg:max-w-none lg:basis-auto lg:ltr:ml-auto lg:rtl:mr-auto">
                {/* <PayNowButton trackingNumber={order?.tracking_number} /> */}
                <PayNowButton
                  trackingNumber={order?.tracking_number}
                  order={order}
                />
              </span>
            )}
            {/* @ts-ignore */}
            {paymentGateway?.length > 1 && isPaymentActionPending && (
              <span className="order-2 w-full max-w-full mt-5 shrink-0 basis-full sm:order-1 lg:mt-0 lg:w-auto lg:max-w-none lg:basis-auto lg:ltr:ml-auto lg:rtl:mr-auto">
                <ChangeGateway order={order} />
              </span>
            )}
          </>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
