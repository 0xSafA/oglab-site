import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useRemoveStaffMutation } from '@/graphql/shops.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const StaffDeleteView = () => {
  const { t } = useTranslation();
  const [removeStaffByID, { loading }] = useRemoveStaffMutation({
    update(cache, { data: removeStaff }) {
      cache.modify({
        fields: {
          staffs(existingRefs, { readField }) {
            return existingRefs?.data?.filter(
              (ref: any) =>
                removeStaff?.removeStaff?.id !== readField('id', ref)
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
      await removeStaffByID({
        variables: { id: modalData as string },
      });
      toast.success(t('common:successfully-deleted'));
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

export default StaffDeleteView;
