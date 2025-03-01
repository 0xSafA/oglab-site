import Input from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from '@/components/ui/date-picker';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import {
  useCreateStoreNoticeMutation,
  useUpdateStoreNoticeMutation,
  useStoreNoticeReceiverQuery,
} from '@/graphql/store-notice.graphql';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Router, { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { storeNoticeValidationSchema } from './store-notice-validation-schema';
import { StoreNotice, StoreNoticeType } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { getAuthCredentials } from '@/utils/auth-utils';
import NoticeReceivedByInput from './store-notice-received-input';
import { find } from 'lodash';
import { useMemo, useCallback } from 'react';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { ItemProps } from '@/types/custom-types';
import { useModalAction } from '@/components/ui/modal/modal.context';
import OpenAIButton from '@/components/openAI/openAI.button';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a notice for store customers about ${name} changes to store hours during the upcoming holiday season.`,
    },
    {
      id: 2,
      title: `Write a notice for store employees about ${name} the implementation of a new inventory management system.`,
    },
    {
      id: 3,
      title: `Write a notice for store customers about a ${name} limited-time sale on select merchandise.`,
    },
    {
      id: 4,
      title: `Write a notice for store employees about a ${name} mandatory staff meeting to discuss safety procedures.`,
    },
    {
      id: 5,
      title: `Write a notice for store vendors about ${name} changes to the payment process for goods and services.`,
    },
    {
      id: 6,
      title: `Write a notice for store customers about a ${name} temporary closure due to renovations.`,
    },
    {
      id: 7,
      title: `Write a notice for store employees about ${name} the launch of a new employee training program.`,
    },
    {
      id: 8,
      title: `Write a notice for store vendors about a ${name} deadline for submitting new product proposals.`,
    },
    {
      id: 9,
      title: `Write a notice for store customers about a ${name} change in store policy regarding returns and exchanges.`,
    },
    {
      id: 10,
      title: `Write a notice for store employees about a ${name} change in management and leadership structure.`,
    },
  ];
};

type user = {
  id: number;
  name: string;
};
type shop = {
  id: number;
  name: string;
};
type FormValues = {
  priority: { name: string; value: string };
  notice: string;
  description: string;
  effective_from: string;
  expired_at: string;
  type: { name: string; value: string };
  received_by: user[] | shop[];
};

const priorityType = [
  { name: 'High', value: 'high' },
  { name: 'Medium', value: 'medium' },
  { name: 'Low', value: 'low' },
];

type IProps = {
  initialValues?: StoreNotice | null;
};
export default function CreateOrUpdateStoreNoticeForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { locale } = router;
  const { openModal } = useModalAction();
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();

  let noticeTypes: any = [];
  let superAdmin = permissions?.includes('super_admin');
  const noticeReceived =
    initialValues?.shops || initialValues?.users
      ? //@ts-ignore
        initialValues?.shops.concat(initialValues?.users)
      : [];

  if (superAdmin) {
    noticeTypes = [
      { name: 'All Vendor', value: 'all_vendor' },
      { name: 'Specific Vendor', value: 'specific_vendor' },
    ];
  } else {
    noticeTypes = [
      { name: 'All Shop', value: 'all_shop' },
      { name: 'Specific Shop', value: 'specific_shop' },
    ];
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // @ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          effective_from: new Date(initialValues.effective_from!),
          expired_at: new Date(initialValues.expired_at!),
          priority: initialValues?.priority
            ? priorityType?.find(
                (priority) => priority.value === initialValues?.priority!,
              )
            : { name: '', value: '' },
          type: initialValues?.type
            ? noticeTypes &&
              noticeTypes?.find(
                (type: any) => type.value === initialValues.type!,
              )
            : { name: '', value: '' },
          received_by: noticeReceived ? noticeReceived : [],
        }
      : {
          priority: priorityType[0],
        },
    //@ts-ignore
    resolver: yupResolver(storeNoticeValidationSchema),
  });

  const [createStoreNotice, { loading: creating }] =
    useCreateStoreNoticeMutation();
  const [updateStoreNotice, { loading: updating }] =
    useUpdateStoreNoticeMutation();

  const noticeType = watch('type');
  const { data } = useStoreNoticeReceiverQuery({
    variables: {
      type: noticeType?.value,
    },
  });
  let shopIndexFind: any = find(
    data?.storeNoticeReceiver,
    (x: any) => x.slug === router.query.shop,
  );

  const [effective_from, expired_at] = watch(['effective_from', 'expired_at']);
  const isTranslateStoreNotice = router.locale !== Config.defaultLanguage;

  const onSubmit = async (values: FormValues) => {
    const inputValues = {
      priority: values.priority.value,
      notice: values.notice,
      description: values.description,
      type: superAdmin ? values.type?.value : 'specific_shop',
      effective_from: new Date(effective_from).toISOString(),
      expired_at: new Date(expired_at).toISOString(),
      received_by: superAdmin
        ? values.received_by?.map((r) => Number(r.id))
        : [Number(shopIndexFind?.id)],
    };

    try {
      if (!initialValues) {
        await createStoreNotice({
          variables: {
            input: {
              ...inputValues,
            },
          },
        });
        const generateRedirectUrl = router.query.shop
          ? `/${router.query.shop}${Routes.storeNotice.list}`
          : Routes.storeNotice.list;

        await router.push(generateRedirectUrl, undefined, {
          locale: Config.defaultLanguage,
        });

        toast.success(t('common:successfully-created'));
      } else {
        const { data } = await updateStoreNotice({
          variables: {
            input: {
              ...inputValues,
              id: initialValues.id,
            },
          },
        });

        if (data) {
          const generateRedirectUrl = router.query.shop
            ? `/${router.query.shop}${Routes.storeNotice.list}`
            : Routes.storeNotice.list;
          await Router.replace(
            `${generateRedirectUrl}/${data.updateStoreNotice?.id}/edit`,
            undefined,
            {
              locale: router.locale,
            },
          );
          toast.success(t('common:successfully-updated'));
        }
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };
  const generateName = watch('notice');

  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestion({ name: generateName ?? '' });
  }, [generateName]);
  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'description',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [generateName]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:store-notice-form-info-help-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-priority')}</Label>
            <SelectInput
              name="priority"
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              control={control}
              options={priorityType}
            />
            <ValidationError
              //@ts-ignore
              message={t(errors.priority?.message!)}
            />
          </div>
          <Input
            label={`${t('form:input-title')}*`}
            {...register('notice')}
            placeholder={t('form:enter-notice-heading')}
            error={t(errors.notice?.message!)}
            variant="outline"
            className="mb-5"
            disabled={isTranslateStoreNotice}
          />

          <div className="relative">
            {options?.settings?.options?.useAi && (
              <OpenAIButton
                title="Generate Description With AI"
                onClick={handleGenerateDescription}
              />
            )}
            <TextArea
              label={`${t('form:input-label-description')}*`}
              {...register('description')}
              placeholder={t('form:enter-notice-description')}
              error={t(errors.description?.message!)}
              variant="outline"
              className="mb-5"
              disabled={isTranslateStoreNotice}
            />
          </div>

          <div className="mb-6 flex flex-col sm:flex-row">
            <div className="mb-5 w-full p-0 sm:mb-0 sm:w-1/2 sm:pe-2">
              <DatePicker
                control={control}
                name="effective_from"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                maxDate={new Date(expired_at)}
                startDate={new Date(effective_from)}
                endDate={new Date(expired_at)}
                className="border border-border-base"
                disabled={isTranslateStoreNotice}
                label={t('form:store-notice-active-from')}
                required
                error={t(errors.effective_from?.message!)}
              />
            </div>
            <div className="w-full p-0 sm:w-1/2 sm:ps-2">
              <DatePicker
                control={control}
                name="expired_at"
                dateFormat="dd/MM/yyyy"
                startDate={new Date(effective_from)}
                endDate={new Date(expired_at)}
                minDate={new Date(effective_from)}
                className="border border-border-base"
                disabled={isTranslateStoreNotice}
                label={t('form:store-notice-expire-at')}
                error={t(errors.expired_at?.message!)}
                required
              />
            </div>
          </div>
          {superAdmin && (
            <>
              <div className="mb-0">
                <Label>{t('form:input-label-type')}</Label>
                <SelectInput
                  name="type"
                  control={control}
                  getOptionLabel={(option: any) => option.name}
                  getOptionValue={(option: any) => option.value}
                  options={noticeTypes}
                  defaultValue={noticeTypes[0]}
                />

                <ValidationError //@ts-ignore
                  message={t(errors.type?.message)}
                />
              </div>
              {noticeType &&
                (noticeType.value ==
                  StoreNoticeType.SpecificVendor.toLowerCase() ||
                  noticeType.value ===
                    StoreNoticeType.SpecificShop.toLowerCase()) && (
                  <NoticeReceivedByInput
                    className="mt-5"
                    control={control}
                    setValue={setValue}
                    //@ts-ignore
                    error={t(errors.received_by?.message!)}
                  />
                )}
            </>
          )}
        </Card>
      </div>
      <StickyFooterPanel>
        <div className="mb-4 text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="me-4"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button
            loading={updating || creating}
            disabled={updating || creating}
          >
            {initialValues
              ? t('form:button-label-update-store-notice')
              : t('form:button-label-add-store-notice')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
