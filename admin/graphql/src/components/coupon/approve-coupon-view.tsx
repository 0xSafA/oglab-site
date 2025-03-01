import ConfirmationCard from '@/components/common/confirmation-card';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import {
  useApproveCouponMutation,
  useDeleteCouponMutation,
} from '@/graphql/coupons.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

const ApproveCouponView = () => {
  const { t } = useTranslation();
  const [approveCouponMutation, { loading }] = useApproveCouponMutation({
    onCompleted: () => {
      closeModal();
      toast.success(t('common:successfully-updated'));
    },
    onError: (error) => {
      closeModal();
      getErrorMessage(error);
    },
  });

  const { data: modalData } = useModalState();
  const { closeModal } = useModalAction();
  async function handleDelete() {
    approveCouponMutation({
      variables: { id: modalData as string },
    });
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
      deleteBtnText="text-approve"
      icon={<CheckMarkCircle className="w-10 h-10 m-auto mt-4 text-accent" />}
      deleteBtnClassName="!bg-accent focus:outline-none hover:!bg-accent-hover focus:!bg-accent-hover"
      cancelBtnClassName="!bg-red-600 focus:outline-none hover:!bg-red-700 focus:!bg-red-700"
      title="text-approve-coupon"
      description="text-want-approve-coupon"
    />
  );
};

export default ApproveCouponView;
