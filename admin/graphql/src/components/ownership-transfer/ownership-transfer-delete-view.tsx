import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteOwnershipTransferMutation } from '@/graphql/ownership-transfer.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';



const OwnershipTransferDeleteView = () => {
  const { t } = useTranslation();
  const [deleteOwnershipTransfer, { loading }] = useDeleteOwnershipTransferMutation({
    //@ts-ignore
    update(cache, { data: { deleteOwnershipTransfer } }) {
      cache.modify({
        fields: {
          ownershipTransfers(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) => deleteOwnershipTransfer.id !== readField('id', ref)
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
      deleteOwnershipTransfer({
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

export default OwnershipTransferDeleteView;
