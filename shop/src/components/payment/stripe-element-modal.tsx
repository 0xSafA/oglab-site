import {
  useModalState,
} from '@/components/ui/modal/modal.context';
import StripeElementForm from './stripe/stripe-element-form';


const PAYMENTS_FORM_COMPONENTS: any = {
  STRIPE: {
    component: StripeElementForm,
  },
};

const StripeElementModal = () => {
  const {
    data: { paymentGateway, paymentIntentInfo, trackingNumber },
  } = useModalState();
  const PaymentMethod = PAYMENTS_FORM_COMPONENTS[paymentGateway?.toUpperCase()];
  const PaymentComponent = PaymentMethod?.component;

  return (
    <div className="payment-modal relative h-full w-full overflow-hidden rounded-[10px] bg-light md:h-auto md:min-h-0 md:max-w-2xl lg:w-screen lg:max-w-[46rem]">
      <PaymentComponent
        paymentIntentInfo={paymentIntentInfo}
        trackingNumber={trackingNumber}
        paymentGateway={paymentGateway}
      />
    </div>
  );
};

export default StripeElementModal;
