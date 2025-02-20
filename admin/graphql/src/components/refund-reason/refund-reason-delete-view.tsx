import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteRefundReasonMutation } from '@/graphql/refund-reason.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const RefundReasonDeleteView = () => {
  const { t } = useTranslation();
  const [deleteRefundReasonId, { loading }] = useDeleteRefundReasonMutation({
     //@ts-ignore
    update(cache, { data: { deleteRefundReason } }) {
      cache.modify({
        fields: {
          refundReasons(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) => deleteRefundReason.id !== readField('id', ref)
            );
          },
        },
      });
      toast.success(t('common:successfully-deleted'));
    },
  });

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  function handleDelete() {
    try {
      deleteRefundReasonId({
        variables: { id: modalData as string },
      });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }
  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default RefundReasonDeleteView;
