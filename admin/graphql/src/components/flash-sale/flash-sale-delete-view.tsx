import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteFlashSaleMutation } from '@/graphql/flash_sale.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const FlashSaleDeleteView = () => {
  const { t } = useTranslation();
  const [deleteFlashSaleMutation, { loading }] = useDeleteFlashSaleMutation({
    update(cache, { data: deleteFlashSale }) {
      cache.modify({
        fields: {
          flashSales(existingRefs, { readField }) {
            return existingRefs?.data?.filter(
              (ref: any) =>
                deleteFlashSale?.deleteFlashSale?.id !== readField('id', ref)
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
      deleteFlashSaleMutation({
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

export default FlashSaleDeleteView;
