import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';
import { Control, useFormState, useWatch } from 'react-hook-form';
import { useStoreNoticeReceiverQuery } from '@/graphql/store-notice.graphql';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import ValidationError from '../ui/form-validation-error';

interface Props {
  className?: string;
  control: Control<any>;
  setValue: any;
  error?: string | undefined;
}

const NoticeReceivedByInput = ({
  className = 'mb-5',
  control,
  setValue,
  error,
}: Props) => {
  const { t } = useTranslation();
  const type = useWatch({
    control,
    name: 'type',
  });
  const { dirtyFields } = useFormState({
    control,
  });
  useEffect(() => {
    if (type?.value && dirtyFields?.type) {
      setValue('received_by', []);
    }
  }, [type?.value]);

  const { data, loading } = useStoreNoticeReceiverQuery({
    variables: {
      type: type?.value,
    },
  });

  return (
    <div className={className}>
      <Label>{t('form:input-label-received-by')}</Label>
      <SelectInput
        name="received_by"
        isMulti
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        // @ts-ignore
        options={data?.storeNoticeReceiver! ?? []}
        isLoading={loading}
      />
      <ValidationError message={t(error!)} />
    </div>
  );
};

export default NoticeReceivedByInput;
