import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteAuthorMutation } from '@/graphql/authors.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const AuthorDeleteView = () => {
  const { t } = useTranslation();
  const [deleteAuthorMutation, { loading }] = useDeleteAuthorMutation({
    //@ts-ignore
    update(cache, { data: { deleteAuthor } }) {
      cache.modify({
        fields: {
          authors(existingRefs, { readField }) {
            return existingRefs.data.filter(
              (ref: any) => deleteAuthor.id !== readField('id', ref)
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
      deleteAuthorMutation({
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

export default AuthorDeleteView;
