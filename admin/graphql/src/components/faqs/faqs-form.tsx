import { useCallback, useMemo, useEffect, useState } from 'react';
import Input from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { getErrorMessage } from '@/utils/form-error';
import { Config } from '@/config';
import { useModalAction } from '@/components/ui/modal/modal.context';
import OpenAIButton from '@/components/openAI/openAI.button';
import { chatbotAutoSuggestionForFAQs } from '@/components/faqs/faqs-ai-prompts';
import { faqsValidationSchema } from '@/components/faqs/faqs-validation-schema';
import { Faqs } from '__generated__/__types__';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { ItemProps } from '@/types/custom-types';
import {
  useCreateFaqMutation,
  useUpdateFaqMutation,
} from '@/graphql/faqs.graphql';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { Routes } from '@/config/routes';
import { toast } from 'react-toastify';
import { useShopLazyQuery } from '@/graphql/shops.graphql';
import Alert from '@/components/ui/alert';
import RichTextEditor from '@/components/ui/wysiwyg-editor/editor';

type FormValues = {
  faq_title: string;
  faq_description: string;
  slug: string;
};

const defaultValues = {
  faq_title: '',
  faq_description: '',
  slug: '',
};

type IProps = {
  initialValues?: Faqs | null;
};
export default function CreateOrUpdateFaqsForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const {
    query: { shop },
    locale,
  } = router;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });
  // const isNewTranslation = router?.query?.action === 'translate';
  // const isSlugEditable =
  //   router?.query?.action === 'edit' &&
  //   router?.locale === Config.defaultLanguage;
  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.faqs.list}`
    : Routes.faqs.list;

  const [getShop, { data: shopData }] = useShopLazyQuery();

  useEffect(() => {
    if (shop) {
      getShop({
        variables: {
          slug: shop as string,
        },
      });
    }
  }, [shop]);

  const shopId = shopData?.shop?.id!;

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
          faq_title: initialValues?.faq_title,
          faq_description: initialValues?.faq_description,
        }
      : defaultValues,

    //@ts-ignore
    resolver: yupResolver(faqsValidationSchema),
  });

  const [createFaqMutation, { loading: creating }] = useCreateFaqMutation({
    onCompleted: async () => {
      await router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:create-success'));
    },
    onError: (error) => {
      const serverErrors = getErrorMessage(error);
      if (serverErrors?.validation.length) {
        Object.keys(serverErrors?.validation).forEach((field: any) => {
          setError(field.split('.')[1], {
            type: 'manual',
            message: serverErrors?.validation[field][0],
          });
        });
      } else {
        setErrorMessage(error?.message);
      }
    },
  });

  const [updateFaqMutation, { loading: updating }] = useUpdateFaqMutation({
    onCompleted: async () => {
      await router.push(generateRedirectUrl, undefined, {
        locale: Config.defaultLanguage,
      });

      toast.success(t('common:successfully-updated'));
    },
    onError: (error) => {
      const serverErrors = getErrorMessage(error);
      if (serverErrors?.validation.length) {
        Object.keys(serverErrors?.validation).forEach((field: any) => {
          setError(field.split('.')[1], {
            type: 'manual',
            message: serverErrors?.validation[field][0],
          });
        });
      } else {
        setErrorMessage(error?.message);
      }
    },
  });

  const faqName = watch('faq_title');
  // const slugAutoSuggest = formatSlug(faqName);
  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestionForFAQs({ name: faqName ?? '' });
  }, [faqName]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: faqName,
      set_value: setValue,
      key: 'description',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [faqName]);

  const onSubmit = async (values: FormValues) => {
    const inputValues = {
      language: router.locale,
      faq_title: values.faq_title,
      faq_description: values.faq_description,
    };
    const shopID = shopId ? shopId || initialValues?.shop_id : null;
    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createFaqMutation({
          variables: {
            input: {
              ...inputValues,
              ...(shopID && { shop_id: shopID }),
            },
          },
        });
      } else {
        await updateFaqMutation({
          variables: {
            input: {
              ...inputValues,
              id: initialValues.id!,
            },
          },
        });
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
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-5 flex flex-wrap sm:my-8">
          <Description
            title={t('form:input-label-description')}
            details={`${
              initialValues
                ? t('form:item-description-edit')
                : t('form:item-description-add')
            } ${t('form:faq-form-info-help-text')}`}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-title')}
              {...register('faq_title')}
              error={t(errors.faq_title?.message!)}
              variant="outline"
              className="mb-5"
              required
            />

            <div className="relative">
              {/* {options?.useAi && (
              <div
                onClick={handleGenerateDescription}
                className="absolute right-0 z-10 text-sm font-medium cursor-pointer -top-1 text-accent hover:text-accent-hover"
              >
                Generate
              </div>
            )} */}

              {options?.settings?.options?.useAi && (
                <OpenAIButton
                  title={t('form:button-label-description-ai')}
                  onClick={handleGenerateDescription}
                />
              )}

              {/* <TextArea
                label={`${t('form:input-label-description')}*`}
                {...register('faq_description')}
                error={t(errors.faq_description?.message!)}
                variant="outline"
                className="mb-5"
              /> */}
              <RichTextEditor
                title={t('form:input-label-description')}
                required={true}
                error={t(errors?.faq_description?.message!)}
                name="faq_description"
                control={control}
              />
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
                ? t('form:button-label-update-faq')
                : t('form:button-label-add-faq')}
            </Button>
          </div>
        </StickyFooterPanel>
      </form>
    </>
  );
}
