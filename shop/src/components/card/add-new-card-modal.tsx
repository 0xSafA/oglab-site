import StripeCardForm from '@/components/card/stripe/stripe-card-form';
import { useModalState } from '@/components/ui/modal/modal.context';
import { PaymentGateway as PG } from '@/types';
import { useSettings } from '@/framework/settings';
import { isStripeAvailable } from '@/lib/is-stripe-available';

const StripeNotAvailable = () => {
  return (
    <div className="payment-modal relative h-full w-screen max-w-md overflow-hidden rounded-[10px] bg-light md:h-auto md:min-h-0 lg:max-w-[46rem]">
      <div className="p-6 lg:p-12">
        <span className="mb-2 block text-sm font-semibold text-black">
          Sorry this feature is not available!
        </span>
      </div>
    </div>
  );
};

const CARDS_FORM_COMPONENTS: any = {
  STRIPE: {
    component: StripeCardForm,
  },
  STRIPE_NA: {
    component: StripeNotAvailable,
  },
};

const AddNewCardModal = () => {
  const {
    data: { paymentGateway },
  } = useModalState();

  const { settings } = useSettings();

  // At first it will check if default payment gateway is stripe or not? if yes then it will directly work on if condition. No need to run else condition.
  
  const isStripeGatewayAvailable = isStripeAvailable(settings);

  let gatewayName: string = 'non-stripe';
  if (isStripeGatewayAvailable) {
    gatewayName = PG.STRIPE;
  }

  const PaymentMethod = isStripeGatewayAvailable
    ? CARDS_FORM_COMPONENTS[gatewayName]
    : CARDS_FORM_COMPONENTS['STRIPE_NA'];
  const CardFormComponent = PaymentMethod?.component;

  return <CardFormComponent />;
};

export default AddNewCardModal;
