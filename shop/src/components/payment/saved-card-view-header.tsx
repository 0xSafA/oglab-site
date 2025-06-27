import { useModalAction } from '@/components/ui/modal/modal.context';
import { PlusIcon } from '@/components/icons/plus-icon';
import { useTranslation } from 'next-i18next';
import { PaymentGateway, PaymentIntentInfo } from '@/types';
import { useSettings } from '@/framework/settings';

interface Props {
  paymentIntentInfo: PaymentIntentInfo;
  trackingNumber: string;
  paymentGateway: PaymentGateway;
}

const SavedCardViewHeader: React.FC<Props> = ({
  paymentIntentInfo,
  trackingNumber,
  paymentGateway,
}) => {
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');
  const { settings } = useSettings();

  const handleAddNewCard = () => {
    openModal('USE_NEW_PAYMENT', {
      paymentIntentInfo,
      trackingNumber,
      paymentGateway,
    });
  };

  const handleAddNewStripeElement = () => {
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
          {t('profile-sidebar-my-cards')}
        </h1>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center text-sm font-semibold text-accent"
            onClick={handleAddNewCard}
          >
            <PlusIcon className="mr-1" width={16} height={16} />
            {t('profile-add-cards')}
          </button>
          {Boolean(settings?.StripeCardOnly) && (
            <button
              className="flex items-center text-sm font-semibold capitalize text-accent"
              onClick={handleAddNewStripeElement}
            >
              {t('Try another method')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedCardViewHeader;
