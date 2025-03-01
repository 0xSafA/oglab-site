import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteTermsConditionsMutation } from '@/graphql/terms.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TermsDeleteView = () => {
  const { t } = useTranslation();
  const [deleteTermById, { loading }] = useDeleteTermsConditionsMutation({
    //@ts-ignore
    update(cache, { data: deleteTerm }) {
      cache.modify({
        fields: {
          termsConditions(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) =>
                deleteTerm?.deleteTermsConditions?.id !== readField('id', ref)
            );
          },
        },
      });
    },
    onCompleted: () => {
      toast.success(t('common:successfully-deleted'));
    },
  });

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteTermById({
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

export default TermsDeleteView;
