import ConfirmationCard from '@/components/common/confirmation-card';
import { getErrorMessage } from '@/utils/form-error';
import {
  useBanUserMutation,
  useActiveUserMutation,
} from '@/graphql/auth.graphql';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';

const CustomerBanView = () => {
  const { t } = useTranslation();
  const [banUser, { loading }] = useBanUserMutation();
  const [activeUser, { loading: activeLoading }] = useActiveUserMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  function handleDelete() {
    try {
      if (data?.type === 'ban') {
        banUser({
          variables: { id: data?.id },
        });
        toast.success(t('common:successfully-block'));
      } else {
        activeUser({
          variables: { id: data?.id },
        });
        toast.success(t('common:successfully-unblock'));
      }
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
      deleteBtnText={data?.type === 'ban' ? 'Block' : 'Unblock'}
      title={data?.type === 'ban' ? 'Block Customer' : 'Unblock Customer'}
      description="Are you sure you want to block this customer?"
      deleteBtnLoading={loading || activeLoading}
    />
  );
};

export default CustomerBanView;
