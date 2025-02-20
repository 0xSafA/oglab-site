import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import { useCreateOrder } from '@/framework/order';
import ValidationError from '@/components/ui/validation-error';
import Button from '@/components/ui/button';
import { formatOrderedProduct } from '@/lib/format-ordered-product';
import { useCart } from '@/store/quick-cart/cart.context';
import { checkoutAtom, discountAtom, walletAtom } from '@/store/checkout';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/store/quick-cart/cart.utils';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useLogout, useUser } from '@/framework/user';
import { PaymentGateway } from '@/types';
import { useSettings } from '@/framework/settings';
import Cookies from 'js-cookie';
import { REVIEW_POPUP_MODAL_KEY } from '@/lib/constants';

export const PlaceOrderAction: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = (props) => {
  const { t } = useTranslation('common');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { createOrder, isLoading } = useCreateOrder();
  const { locale }: any = useRouter();
  const { items } = useCart();
  const { me } = useUser();

  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      verified_response,
      customer_contact,
      customer_name,
      payment_gateway,
      payment_sub_gateway,
      note,
      token,
      payable_amount,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [use_wallet_points] = useAtom(walletAtom);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id),
  );

  const subtotal = calculateTotal(available_items);
  const { settings } = useSettings();
  const freeShippingAmount = settings?.freeShippingAmount;
  const freeShipping = settings?.freeShipping;
  let freeShippings = freeShipping && Number(freeShippingAmount) <= subtotal;
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: verified_response?.shipping_charge!,
    },
    Number(discount),
  );
  const handlePlaceOrder = () => {
    if (!customer_contact) {
      setErrorMessage('Contact Number Is Required');
      return;
    }
    if (!use_wallet_points && !payment_gateway) {
      setErrorMessage('Gateway Is Required');
      return;
    }

    const isFullWalletPayment =
      use_wallet_points && payable_amount == 0 ? true : false;
    const gateWay = isFullWalletPayment
      ? PaymentGateway.FULL_WALLET_PAYMENT
      : payment_gateway;

    let input = {
      //@ts-ignore
      products: available_items?.map((item) => formatOrderedProduct(item)),
      amount: subtotal,
      coupon_id: Number(coupon?.id),
      discount: discount ?? 0,
      paid_total: total,
      sales_tax: verified_response?.total_tax,
      delivery_fee: freeShippings ? 0 : verified_response?.shipping_charge,
      total,
      delivery_time: delivery_time?.title,
      customer_contact,
      customer_name,
      note,
      payment_gateway: gateWay,
      payment_sub_gateway,
      use_wallet_points,
      isFullWalletPayment,
      billing_address: {
        ...(billing_address?.address && billing_address.address),
      },
      shipping_address: {
        ...(shipping_address?.address && shipping_address.address),
      },
    };
    delete input.billing_address.__typename;
    delete input.shipping_address.__typename;
    //@ts-ignore
    createOrder(input);
    Cookies.remove(REVIEW_POPUP_MODAL_KEY);
  };
  const isDigitalCheckout = available_items.find((item) =>
    Boolean(item.is_digital),
  );

  let formatRequiredFields = isDigitalCheckout
    ? [customer_contact, payment_gateway, available_items]
    : [
        customer_contact,
        payment_gateway,
        billing_address,
        shipping_address,
        delivery_time,
        available_items,
      ];
  if (!isDigitalCheckout && !me) {
    formatRequiredFields.push(customer_name);
  }

  const isAllRequiredFieldSelected = formatRequiredFields.every(
    (item) => !isEmpty(item),
  );
  return (
    <>
      <Button
        loading={isLoading}
        className={classNames('mt-5 w-full', props.className)}
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected || !!isLoading}
        {...props}
      />
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
      {!isAllRequiredFieldSelected && (
        <div className="mt-3">
          <ValidationError message={t('text-place-order-helper-text')} />
        </div>
      )}
    </>
  );
};
