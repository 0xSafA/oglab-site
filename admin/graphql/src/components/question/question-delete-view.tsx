import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteQuestionMutation } from '@/graphql/questions.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

const QuestionDeleteView = () => {
  const { t } = useTranslation();
  const [deleteQuestionById, { loading }] = useDeleteQuestionMutation({
    update(cache, { data: deleteQuestion }) {
      cache.modify({
        fields: {
          all_questions(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) =>
                deleteQuestion?.deleteQuestion?.id !== readField('id', ref)
            );
          },
        },
      });
      toast.success(t('common:successfully-deleted'));
    },
  });

  const { data } = useModalState();
  const { closeModal } = useModalAction();
  function handleDelete() {
    try {
      deleteQuestionById({
        variables: { id: data?.id as string },
      });
      closeModal();
      toast.success(t('common:successfully-deleted'));
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

export default QuestionDeleteView;
