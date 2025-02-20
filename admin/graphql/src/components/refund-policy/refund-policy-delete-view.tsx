import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { getErrorMessage } from '@/utils/form-error';
import { useDeleteRefundPolicyMutation } from '@/graphql/refund-policies.graphql';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const RefundPolicyDeleteView = () => {
  const { t } = useTranslation();
  const [deleteRefundPolicy, { loading }] = useDeleteRefundPolicyMutation({
    //@ts-ignore
    update(cache, { data: { deleteRefundPolicy } }) {
      cache.modify({
        fields: {
          refundReasons(existingRefs, { readField }) {
            return existingRefs.filter(
              (ref: any) => deleteRefundPolicy.id !== readField('id', ref)
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
      deleteRefundPolicy({
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

export default RefundPolicyDeleteView;
