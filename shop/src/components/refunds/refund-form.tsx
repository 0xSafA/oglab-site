import Button from '@/components/ui/button';
import FileInput from '@/components/ui/forms/file-input';
import { Form } from '@/components/ui/forms/form';
import Label from '@/components/ui/forms/label';
import TextArea from '@/components/ui/forms/text-area';
import Input from '@/components/ui/forms/input';
import Select from '@/components/ui/select/select';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useCreateRefund } from '@/framework/order';
import { useRefundReason } from '@/framework/refund';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import { Controller } from 'react-hook-form';
import { Attachment } from '@/types';
import Link from 'next/link';

interface Props {
  loading: boolean;
  onSubmit: (values: any) => void;
}

interface FormValues {
  title: string;
  refund_reason: any;
  description: string;
  images: Attachment[];
}

const refundFormSchema: any = yup.object().shape({
  description: yup.string().required('error-description-required'),
  refund_reason: yup.object().required('error-select-required'),
  title: yup.string().when('refund_reason', {
    is: (refund_reason: any) =>
      refund_reason && refund_reason?.label === 'Others',
    then: () => yup.string().required('error-title-required'),
    otherwise: () => yup.string(),
  }),
});

const CreateRefund = () => {
  const { t } = useTranslation('common');
  const { refundReasons, isLoading: loading } = useRefundReason();
  const { createRefundRequest, isLoading } = useCreateRefund();
  const { data } = useModalState();

  const options = refundReasons?.map((item) => ({
    value: item?.id,
    label: item?.name,
  }));

  function handleRefundRequest({
    title,
    description,
    images,
    refund_reason,
  }: FormValues) {
    createRefundRequest({
      order_id: data,
      title,
      description,
      refund_reason_id: refund_reason?.value,
      images,
    });
  }

  return (
    <div className="flex h-full min-h-screen w-screen flex-col justify-center bg-light py-6 px-5 sm:p-8 md:h-auto md:min-h-0 md:max-w-[480px] md:rounded-xl">
      <h1 className="mb-5 text-lg font-semibold text-center text-heading sm:mb-6">
        {t('text-add-new')} {t('text-refund')}
      </h1>

      <Form<FormValues>
        onSubmit={handleRefundRequest}
        validationSchema={refundFormSchema}
      >
        {({ register, control, formState: { errors } }) => (
          <>
            <Controller
              name="refund_reason"
              control={control}
              render={({ field }) => (
                <>
                  <div className="mb-5">
                    <Label htmlFor="images">{t('text-select')}</Label>
                    <Select
                      {...field}
                      options={options}
                      isDisabled={loading}
                      isLoading={loading}
                      isSearchable={false}
                      placeholder={t('select-refund-reason')}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                    {errors.refund_reason && (
                      <p className="mt-2 text-xs text-red-500">
                        {t(errors.refund_reason?.message!)}
                      </p>
                    )}
                  </div>

                  {field.value && field.value.label === 'Others' && (
                    <Input
                      label={t('text-reason')}
                      {...register('title')}
                      variant="outline"
                      className="mb-5"
                      error={t(errors?.title?.message)}
                    />
                  )}
                </>
              )}
            />

            <TextArea
              label={t('text-description')}
              {...register('description')}
              variant="outline"
              className="mb-5"
              error={t(errors.description?.message!)}
            />
            <div className="mb-2">
              <Label htmlFor="images">{t('text-product-image')}</Label>
              <FileInput control={control} name="images" multiple={true} />
            </div>
            <div className="mb-8">
              <p className="text-body">
                Requesting a Refund?{' '}
                <Link
                  href="/customer-refund-policies"
                  className="text-accent hover:underline"
                  target="_blank"
                >
                  Please Read Our Policies First
                </Link>
              </p>
            </div>
            <div className="mt-8">
              <Button
                className="w-full h-11 sm:h-12"
                loading={isLoading}
                disabled={isLoading}
              >
                {t('text-submit')}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};

export default CreateRefund;
