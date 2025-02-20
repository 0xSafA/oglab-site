import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import {
  useGetPaymentIntent,
} from '@/framework/order';
import { Order } from '@/types';

interface Props {
  trackingNumber?: string;
  order: Order;
  buttonSize?: 'big' | 'medium' | 'small';
  isFetching?: boolean;
}

const PayNowButton: React.FC<Props> = ({
  order,
  buttonSize = 'small',
  isFetching,
}) => {
  const { t } = useTranslation();
  // const { isLoading, getPaymentIntentQueryOriginal } = useGetPaymentIntentOriginal({
  //   tracking_number: trackingNumber,
  // });

  const { isLoading, getPaymentIntentQuery } = useGetPaymentIntent({
    tracking_number: order?.tracking_number as string,
    payment_gateway: order?.payment_gateway as string,
    recall_gateway: false as boolean,
  });

  async function handlePayNow() {
    await getPaymentIntentQuery();
  }

  return (
    <Button
      className="w-full"
      onClick={handlePayNow}
      size={buttonSize}
      disabled={isLoading || isFetching}
      loading={isLoading || isFetching}
    >
      {t('text-pay-now')}
    </Button>
  );
};

export default PayNowButton;
