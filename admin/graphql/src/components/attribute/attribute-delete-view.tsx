import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteAttributeMutation } from '@/graphql/attributes.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const AttributeDeleteView = () => {
  const { t } = useTranslation();
  const [deleteAttributeByID, { loading }] = useDeleteAttributeMutation({
    //@ts-ignore
    update(cache, { data: { deleteAttribute } }) {
      cache.modify({
        fields: {
          attributes(existingRefs, { readField }) {
            return existingRefs.filter(
              (ref: any) => deleteAttribute.id !== readField('id', ref)
            );
          },
        },
      });
      toast.success(t('common:successfully-deleted'));
    },
  });

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  async function handleDelete() {
    try {
      await deleteAttributeByID({
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

export default AttributeDeleteView;
