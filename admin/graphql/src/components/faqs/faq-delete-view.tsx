import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteFaqMutation } from '@/graphql/faqs.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const FaqsDeleteView = () => {
  const { t } = useTranslation();
  const [deleteFaqById, { loading }] = useDeleteFaqMutation({
    //@ts-ignore
    update(cache, { data: { deleteFaq } }) {
      cache.modify({
        fields: {
          faqs(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) => deleteFaq.id !== readField('id', ref)
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
      deleteFaqById({
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

export default FaqsDeleteView;
