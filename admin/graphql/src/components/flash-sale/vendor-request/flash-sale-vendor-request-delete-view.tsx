import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteFlashSaleRequestMutation } from '@/graphql/flash_sale_requests.graphql';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const FlashSaleDeleteView = () => {
  const { t } = useTranslation();
  const [deleteFlashSaleRequest, { loading }] =
    useDeleteFlashSaleRequestMutation({
      //@ts-ignore
      update(cache, { data: deleteRequest }) {
        cache.modify({
          fields: {
            termsConditions(existingRefs, { readField }) {
              return existingRefs.data.filter(
                (ref: any) =>
                  deleteRequest?.deleteFlashSaleRequest?.id !==
                  readField('id', ref),
              );
            },
          },
        });
      },
      onCompleted: () => {
        toast.success(t('common:successfully-deleted'));
      },
    });

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    deleteFlashSaleRequest({
      variables: {
        id: data,
      },
    });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default FlashSaleDeleteView;
