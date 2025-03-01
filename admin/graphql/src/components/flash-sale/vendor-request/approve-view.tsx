import { Form } from '@/components/ui/form/form';
import Button from '@/components/ui/button';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { useApproveFlashSaleRequestMutation } from '@/graphql/flash_sale_requests.graphql';
import { toast } from 'react-toastify';

const ApproveShopView = () => {
  const { t } = useTranslation();
  const [approveFlashSaleRequest, { loading }] =
    useApproveFlashSaleRequestMutation({
      onCompleted: () => {
        toast.success('Approved Successfully.');
      },
    });

  const { data: id } = useModalState();
  const { closeModal } = useModalAction();

  function onSubmit() {
    approveFlashSaleRequest({
      variables: {
        id: id,
      },
    });
    closeModal();
  }

  return (
    <Form onSubmit={onSubmit}>
      {({ register, formState: { errors } }) => (
        <div className="m-auto flex w-full max-w-sm flex-col rounded bg-light p-5 sm:w-[24rem]">
          <h2 className="mb-4 text-lg font-semibold text-muted-black">
            Do you want to approve this ?
          </h2>
          <span className="text-md font-regular mb-4 text-muted-black">
            If you approve this request, then the products listed here will be
            join in the flash sale campaign.
          </span>
          <div>
            <Button type="submit" loading={loading} disabled={loading}>
              Approve.
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
};

export default ApproveShopView;
