import { Form } from '@/components/ui/form/form';
import Button from '@/components/ui/button';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import { useApproveTermsConditionsMutation } from '@/graphql/terms.graphql';

const ApproveShopView = () => {
  const { t } = useTranslation();
  const [approveTermsConditionsMutation, { loading }] =
    useApproveTermsConditionsMutation();

  const { data: id } = useModalState();
  const { closeModal } = useModalAction();

  async function onSubmit() {
    await approveTermsConditionsMutation({
      variables: {
        id: id as string,
      },
    });
    closeModal();
  }

  return (
    <Form onSubmit={onSubmit}>
      {() => (
        <div className="m-auto flex w-full max-w-sm flex-col rounded bg-light p-5 sm:w-[24rem]">
          <h2 className="mb-4 text-lg font-semibold text-muted-black">
            {t('form:form-title-do-you-approve')}
          </h2>
          <div>
            <Button type="submit" loading={loading} disabled={loading}>
              {t('form:button-label-submit')}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
};

export default ApproveShopView;
