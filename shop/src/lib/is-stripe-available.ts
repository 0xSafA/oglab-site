import { PaymentGateway } from '@/types';


/**
 *
 *  Utility method to find out is stripe is available as a active payment gateway
 *
 */
export function isStripeAvailable(props: any) {
  const { defaultPaymentGateway, paymentGateway } = props;
  let processPaymentGatewayName: string[] = [];

  if (Boolean(paymentGateway) && Array.isArray(paymentGateway)) {
    const PaymentGatewaysName: string[] = [...paymentGateway].map(p => p.name.toUpperCase());
    processPaymentGatewayName = [...PaymentGatewaysName];
  }

  // relation would be
  //
  // false false = false
  // true false = true
  // false true = true
  // true true = true

  // check if stripe exists in default payment gateway
  let isStripeDefault = false;
  if (defaultPaymentGateway?.toUpperCase() === PaymentGateway.STRIPE) {
    isStripeDefault = true;
  }

  // check if stripe exists in selected payment gateways
  let isStripeAsChosen = false;
  if (processPaymentGatewayName.includes(PaymentGateway.STRIPE)) {
    isStripeAsChosen = true;
  }

  let isStripeAvailable = false;
  if (isStripeAsChosen || isStripeDefault) {
    isStripeAvailable = true;
  }

  return isStripeAvailable;
}
