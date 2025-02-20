import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteReviewMutation } from '@/graphql/reviews.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

const ReviewDeleteView = () => {
  const { t } = useTranslation();
  const [deleteReviewById, { loading }] = useDeleteReviewMutation({
    update(cache, { data: deleteReview }) {
      cache.modify({
        fields: {
          reviews(existingRefs, { readField }) {
            return existingRefs?.data?.filter(
              (ref: any) =>
                deleteReview?.deleteReview?.id !== readField('id', ref)
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
      deleteReviewById({ variables: { id: data } });
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

export default ReviewDeleteView;
