import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Order } from '@/types';

interface Props {
  order: Order;
  buttonSize?: 'big' | 'medium' | 'small';
}

const ChangeGateway: React.FC<Props> = ({ order, buttonSize = 'small' }) => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalAction();

  const handleChangePaymentGateway = async () => {
    openModal('GATEWAY_MODAL', {
      order,
    });
  };

  return (
    <Button
      className="w-full"
      onClick={handleChangePaymentGateway}
      size={buttonSize}
    >
      Change gateway
    </Button>
  );
};

export default ChangeGateway;
