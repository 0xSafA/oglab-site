import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Routes } from '@/config/routes';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { PaymentGateway, PaymentIntentInfo } from '@/types';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useOrderPayment } from '@/framework/order';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface Props {
  paymentIntentInfo: PaymentIntentInfo;
  trackingNumber: string;
  paymentGateway: PaymentGateway;
}

export default function StripeElementBaseForm({
  paymentIntentInfo,
  trackingNumber,
  paymentGateway,
}: Props) {
  const { t } = useTranslation('common');
  const stripe = useStripe();
  const elements = useElements();
  const { openModal, closeModal } = useModalAction();
  const { createOrderPayment } = useOrderPayment();
  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          toast.success(t('payment-successful'));
          setMessage('Your payment is Successful.');
          closeModal();
          break;
        case 'processing':
          toast.success(t('payment-processing'));
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          toast.success(t('payment-not-successful'));
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          toast.success(t('something-wrong'));
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${Routes.orders}/${trackingNumber}`,
      },
      redirect: 'if_required',
    });

    // Send card response to the api
    await createOrderPayment({
      tracking_number: trackingNumber,
      payment_gateway: 'stripe' as string,
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error?.type === 'card_error' || error?.type === 'validation_error') {
      setMessage(error?.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success(t('payment-successful'));
      setMessage('Your payment is Successful.');
      closeModal();
    } else if (paymentIntent && paymentIntent.status === 'processing') {
      toast.success(t('payment-processing'));
      setMessage('Your payment is Pending.');
      closeModal();
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs',
    defaultCollapsed: false,
  } as StripePaymentElementOptions;

  const backModal = () => {
    openModal('USE_NEW_PAYMENT', {
      paymentGateway,
      paymentIntentInfo,
      trackingNumber,
    });
  };

  return (
    <div className="stripe-payment-modal relative h-full w-screen max-w-md overflow-hidden rounded-[10px] bg-light md:h-auto md:min-h-0 lg:max-w-[46rem]">
      <div className="p-6 lg:p-12">
        <form id="payment-form" onSubmit={handleSubmit}>
          {/* <LinkAuthenticationElement
            id="link-authentication-element"
            onChange={(e) => setEmail(e.value.email)}
            // options={{ defaultValues: { email: 'youremail@email.com' } }}
          /> */}
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
          <div className="mb-4 space-x-4 lg:mt-4">
            <Button
              id="submit"
              disabled={isLoading || !stripe || !elements}
              type="submit"
              className="StripePay px-11 text-sm shadow-none"
            >
              <span id="button-text">{t('text-pay')}</span>
            </Button>

            <Button
              type="submit"
              variant="outline"
              disabled={!!isLoading}
              className="px-11 text-sm shadow-none"
              onClick={closeModal}
            >
              {t('pay-latter')}
            </Button>

            <Button
              disabled={!!isLoading}
              variant="outline"
              className="cursor-pointer"
              onClick={backModal}
            >
              {t('text-back')}
            </Button>
          </div>
          {/* Show any error or success messages */}
          {message && <div id="payment-message">{message}</div>}
        </form>
      </div>
    </div>
  );
}
