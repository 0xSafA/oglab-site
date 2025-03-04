import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteStoreNoticeMutation } from '@/graphql/store-notice.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

const StoreNoticeDeleteView = () => {
  const { t } = useTranslation();
  const [deleteStoreNoticeMutation, { loading }] = useDeleteStoreNoticeMutation(
    {
      update(cache, { data: deleteStoreNotice }) {
        cache.modify({
          fields: {
            storeNotices(existingRefs, { readField }) {
              return existingRefs.data.filter(
                (ref: any) =>
                  deleteStoreNotice?.deleteStoreNotice?.id !==
                  readField('id', ref)
              );
            },
          },
        });
        toast.success(t('common:successfully-deleted'));
      },
    }
  );

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteStoreNoticeMutation({
        variables: { id: modalData as string },
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

export default StoreNoticeDeleteView;
