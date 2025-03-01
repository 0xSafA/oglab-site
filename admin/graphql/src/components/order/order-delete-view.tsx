import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteOrderMutation } from '@/graphql/orders.graphql';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const OrderDeleteView = () => {
  const { t } = useTranslation();
  const [deleteOrder, { loading }] = useDeleteOrderMutation({
    onCompleted: () => {
      toast.success(t('common:successfully-deleted'));
    }
  });

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  async function handleDelete() {
    await deleteOrder({
      variables: { id: modalData as string },
    });
    return closeModal();
  }
  return (
    <ConfirmationCard
      deleteBtnLoading={loading}
      onCancel={closeModal}
      onDelete={handleDelete}
    />
  );
};

export default OrderDeleteView;
