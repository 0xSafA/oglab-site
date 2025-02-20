import { useModalAction } from '@/components//ui/modal/modal.context';
import Card from '@/components/common/card';
import { EditIcon } from '@/components/icons/edit';
import OpenAIButton from '@/components/openAI/openAI.button';
import {
  IRefundPolicyEnumerable,
  RefundPolicyStatusType,
  RefundPolicyType,
  chatbotAutoSuggestion,
} from '@/components/refund-policy/refund-policy-utils';
import { refunPolicyValidationSchema } from '@/components/refund-policy/refund-policy-validation-schema';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import TextArea from '@/components/ui/text-area';
import { Config } from '@/config';
import {
  useCreateRefundPolicyMutation,
  useUpdateRefundPolicyMutation,
} from '@/graphql/refund-policies.graphql';
import { useSettingsQuery } from '@/graphql/settings.graphql';
// import { useShopQuery } from '@/graphql/shops.graphql';
import { RefundPolicy } from '__generated__/__types__';
import { ItemProps } from '@/types/custom-types';
import { getErrorMessage } from '@/utils/form-error';
import { formatSlug } from '@/utils/use-slug';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Radio from '@/components/ui/radio/radio';
import { Routes } from '@/config/routes';
import { toast } from 'react-toastify';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';

type FormValues = {
  title: string;
  slug: string;
  description?: string;
  target: any;
  status: string;
  languages: string;
};

type IProps = {
  initialValues?: RefundPolicy | null;
};

export default function CreateOrUpdateRefundPolicyForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { locale } = useRouter();
  const { t } = useTranslation();
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  // const {
  //   query: { shop },
  // } = router;

  // const { data } = useShopQuery({
  //   variables: {
  //     slug: router.query.shop as string,
  //   },
  // });

  // const shopId = data?.shop?.id!;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(refunPolicyValidationSchema),
    ...(initialValues && {
      defaultValues: {
        ...initialValues,
        target: [...RefundPolicyType].find(
          (t) => t.value.toLowerCase() === initialValues.target,
        ),
        languages: router?.locale!,
      } as FormValues,
    }),
  });
  const { openModal } = useModalAction();

  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });
  const isTranslate = router.locale !== Config.defaultLanguage;

  const generateName = watch('title');
  const slugAutoSuggest = formatSlug(generateName);
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

  const [createRefundPolicy, { loading: creating }] =
    useCreateRefundPolicyMutation();
  const [updateRefundPolicy, { loading: updating }] =
    useUpdateRefundPolicyMutation();

  const onSubmit = async (values: FormValues) => {
    const input = {
      ...values,
      language: router.locale!,
      slug: values.slug ? formatSlug(values.slug) : formatSlug(generateName),
      target: values?.target?.value,
    };

    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createRefundPolicy({
          variables: {
            input: {
              ...input,
            },
          },
        });
        await router.push(Routes.refundPolicies.list, undefined, {
          locale: Config.defaultLanguage,
        });

        toast.success(t('common:successfully-created'));
      } else {
        const { data } = await updateRefundPolicy({
          variables: {
            input: {
              ...input,
              slug: formatSlug(input?.slug),
              id: initialValues.id!,
            },
          },
        });

        if (data) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:refund-policy-form-description-details')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-refund-policy-heading')}
            {...register('title')}
            placeholder={t(
              'form:input-label-refund-policy-heading-placeholder',
            )}
            error={t(errors.title?.message!)}
            variant="outline"
            className="mb-5"
            required
          />

          {isSlugEditable ? (
            <div className="relative mb-5">
              <Input
                label={`${t('form:input-label-slug')}`}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <button
                className="absolute top-[27px] right-px z-0 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                type="button"
                title={t('common:text-edit')}
                onClick={() => setIsSlugDisable(false)}
              >
                <EditIcon width={14} />
              </button>
            </div>
          ) : (
            <Input
              label={`${t('form:input-label-slug')}`}
              {...register('slug')}
              value={slugAutoSuggest}
              variant="outline"
              className="mb-5"
              disabled
            />
          )}

          <div className="relative mb-5">
            {options?.settings?.options?.useAi && (
              <OpenAIButton
                title="Generate Description With AI"
                onClick={handleGenerateDescription}
              />
            )}
            <RichTextEditor
              title={t('form:input-label-refund-policy-description')}
              error={t(errors?.description?.message!)}
              name="description"
              control={control}
            />
          </div>

          <div className="mb-5">
            <Label>
              {t('common:text-select-refund-policy-for')}
              <span className="ml-0.5 text-red-500">*</span>
            </Label>
            <SelectInput
              control={control}
              name="target"
              placeholder={t('form:form-select-text-select-refund-policy')}
              getOptionLabel={(option: any) =>
                `${t('form:form-applicable-for')} ${t(`form:${option.name}`)}`
              }
              getOptionValue={(option: any) => option.value}
              options={RefundPolicyType}
              disabled={isTranslate}
            />
          </div>
          <div>
            <Label>{t('form:input-label-status')}</Label>
            {!isEmpty(RefundPolicyStatusType)
              ? RefundPolicyStatusType?.map(
                  (status: IRefundPolicyEnumerable, index: number) => (
                    <Radio
                      key={index}
                      {...register('status')}
                      label={t(status?.name)}
                      id={status?.value}
                      value={status?.value}
                      disabled={isTranslate}
                      className="mb-2"
                    />
                  ),
                )
              : ''}
            {errors.status?.message && (
              <p className="my-2 text-xs text-red-500">
                {t('form:error-status-required')}
              </p>
            )}
          </div>
        </Card>
      </div>
      <StickyFooterPanel className="z-0">
        <div className="text-end">
          {initialValues && (
            <Button
              variant="outline"
              onClick={router.back}
              className="text-sm me-4 md:text-base"
              type="button"
            >
              {t('form:button-label-back')}
            </Button>
          )}

          <Button
            loading={creating || updating}
            disabled={creating || updating}
            className="text-sm md:text-base"
          >
            {initialValues
              ? t('form:button-label-update-refund-policy')
              : t('form:button-label-add-refund-policy')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
