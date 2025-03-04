import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDeleteProductMutation } from '@/graphql/products.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const ProductDeleteView = () => {
  const { t } = useTranslation();
  const [deleteProductById, { loading }] = useDeleteProductMutation({
    update(cache, { data: deleteProduct }) {
      cache.modify({
        fields: {
          products(existingProductRefs, { readField }) {
            return existingProductRefs.data.filter(
              (productRef: any) =>
                deleteProduct?.deleteProduct?.id !== readField('id', productRef)
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
      await deleteProductById({
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

export default ProductDeleteView;
