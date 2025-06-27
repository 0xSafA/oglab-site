import {
  Elements,
} from '@stripe/react-stripe-js';
import { PaymentGateway, PaymentIntentInfo } from '@/types';
import getStripe from '@/lib/get-stripejs';
import StripeElementBaseForm from '@/components/payment/stripe/stripe-element-base-form';
import { StripeElementsOptions } from '@stripe/stripe-js';
interface Props {
  paymentIntentInfo: PaymentIntentInfo;
  trackingNumber: string;
  paymentGateway: PaymentGateway;
}

const StripeElementForm: React.FC<Props> = ({
  paymentGateway,
  paymentIntentInfo,
  trackingNumber,
}) => {
  // let onlyCard = false; // eita ashbe settings theke

  const clientSecret = paymentIntentInfo?.client_secret;

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <>
      {clientSecret && (
        <Elements options={options} stripe={getStripe()}>
          <StripeElementBaseForm
            paymentIntentInfo={paymentIntentInfo}
            trackingNumber={trackingNumber}
            paymentGateway={paymentGateway}
          />
        </Elements>
      )}
    </>
  );
};

export default StripeElementForm;