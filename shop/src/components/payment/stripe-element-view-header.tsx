import { useModalAction } from '@/components/ui/modal/modal.context';
import { PlusIcon } from '@/components/icons/plus-icon';
import { useTranslation } from 'next-i18next';
import { PaymentGateway, PaymentIntentInfo } from '@/types';
import Button from '../ui/button';
import { useSettings } from '@/framework/settings';

interface Props {
  paymentIntentInfo: PaymentIntentInfo;
  trackingNumber: string;
  paymentGateway: PaymentGateway;
}

const StipeElementViewHeader: React.FC<Props> = ({
  paymentIntentInfo,
  trackingNumber,
  paymentGateway,
}) => {
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');
  const { settings } = useSettings();

  const handleAddNewCard = () => {
    openModal('STRIPE_ELEMENT_MODAL', {
      paymentIntentInfo,
      trackingNumber,
      paymentGateway,
    });
  };
  return (
    <>
      <div className="mb-8 flex items-center justify-between sm:mb-10">
        <h1 className="text-center text-lg font-semibold text-heading sm:text-xl">
          {t('profile-new-cards')}
        </h1>
        {Boolean(settings?.StripeCardOnly) && (
          <button
            className="flex items-center text-sm font-semibold text-accent capitalize"
            onClick={handleAddNewCard}
          >
            {t('Try another method')}
          </button>
        )}
      </div>
    </>
  );
};

export default StipeElementViewHeader;
