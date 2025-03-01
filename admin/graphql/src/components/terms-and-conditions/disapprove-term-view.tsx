import ConfirmationCard from '@/components/common/confirmation-card';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useDisApproveTermsConditionsMutation } from '@/graphql/terms.graphql';

const ProductDeleteView = () => {
  const [disApproveTermsConditionsMutation, { loading }] =
    useDisApproveTermsConditionsMutation();

  const { data: id } = useModalState();
  const { closeModal } = useModalAction();

  async function handleDelete() {
    await disApproveTermsConditionsMutation({
      variables: {
        id: id as string,
      },
    });
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
      deleteBtnText="text-shop-approve-button"
      icon={<CheckMarkCircle className="m-auto mt-4 h-10 w-10 text-accent" />}
      deleteBtnClassName="!bg-accent focus:outline-none hover:!bg-accent-hover focus:!bg-accent-hover"
      cancelBtnClassName="!bg-red-600 focus:outline-none hover:!bg-red-700 focus:!bg-red-700"
      title="text-shop-approve-description"
      description=""
    />
  );
};

export default ProductDeleteView;
