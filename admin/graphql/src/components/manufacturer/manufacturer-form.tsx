import Card from '@/components/common/card';
import ProductGroupInput from '@/components/product/product-group-input';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import TextArea from '@/components/ui/text-area';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import {
  useCreateManufacturerMutation,
  useUpdateManufacturerMutation,
} from '@/graphql/manufacturers.graphql';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { ItemProps } from '@/types/custom-types';
import { getErrorMessage } from '@/utils/form-error';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  AttachmentInput,
  Manufacturer,
  ShopSocialInput,
} from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import OpenAIButton from '@/components/openAI/openAI.button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { manufacturerValidationSchema } from './manufacturer-validation-schema';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { updatedIcons } from '@/utils/update-social-icons';
import { formatSlug } from '@/utils/use-slug';
import { useState } from 'react';
import SlugEditButton from '@/components/ui/slug-edit-button';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Create a description highlighting the expertise and quality of ${name}`,
    },
    {
      id: 2,
      title: `Craft a compelling overview showcasing the innovation and industry leadership of ${name}`,
    },
    {
      id: 3,
      title: `Develop an engaging description of ${name} diverse range of products or publications catering to customer needs.`,
    },
    {
      id: 4,
      title: `Write a captivating overview emphasizing the unique value proposition and benefits of ${name}`,
    },
    {
      id: 5,
      title: `Design a comprehensive description positioning ${name} as a trusted industry partner.`,
    },
    {
      id: 6,
      title: `Construct a persuasive overview highlighting the exceptional quality and attention to detail of ${name}`,
    },
    {
      id: 7,
      title: `Shape a concise description showcasing the broad reach and influence of ${name}`,
    },
    {
      id: 8,
      title: `Build an alluring overview that inspires customer engagement with ${name}'s offerings.`,
    },
    {
      id: 9,
      title: `Create a description emphasizing the cutting-edge technology and innovation of ${name}`,
    },
    {
      id: 10,
      title: `Craft a compelling narrative highlighting the history, legacy, and achievements of ${name}`,
    },
  ];
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  website: string;
  socials: ShopSocialInput[];
  shop_id: string;
  is_approved?: boolean;
  type: any;
  image: AttachmentInput;
  cover_image: AttachmentInput;
};

// const defaultValues = {
//   image: "",
//   amount: 0,
//   active_from: new Date(),
//   expire_at: new Date(),
// };

type IProps = {
  initialValues?: Manufacturer | null;
};
export default function CreateOrUpdateManufacturerForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isTranslate = router.locale !== Config.defaultLanguage;
  const isNewTranslation = router?.query?.action === 'translate';
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.manufacturer.list}`
    : Routes.manufacturer.list;
  const {
    query: { shop },
  } = router;
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(manufacturerValidationSchema),
    ...(Boolean(initialValues) && {
      defaultValues: {
        ...initialValues,
        socials: initialValues?.socials
          ? initialValues?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
              url: social?.url,
            }))
          : [],
        ...(isNewTranslation && {
          type: null,
        }),
      } as any,
    }),
  });
  const slugAutoSuggest = formatSlug(watch('name'));
  const [createManufacturer, { loading: creating }] =
    useCreateManufacturerMutation({
      onCompleted: async () => {
        if (shop) {
          await router.push(`/${shop}${Routes.manufacturer.list}`, undefined, {
            locale: Config.defaultLanguage,
          });
        } else {
          await router.push(Routes.manufacturer.list, undefined, {
            locale: Config.defaultLanguage,
          });
        }
        toast.success(t('common:successfully-created'));
      },
    });

  const { openModal } = useModalAction();
  const { locale } = router;
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });

  const [updateManufacturer, { loading: updating }] =
    useUpdateManufacturerMutation({
      onCompleted: async ({ updateManufacturer }) => {
        if (updateManufacturer) {
          if (initialValues?.slug !== updateManufacturer?.slug) {
            await router.push(
              `${generateRedirectUrl}/${updateManufacturer?.slug}/edit`,
              undefined,
              {
                locale: Config.defaultLanguage,
              },
            );
          }
        }

        toast.success(t('common:successfully-updated'));
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socials',
  });

  const onSubmit = async (values: FormValues) => {
    const {
      name,
      slug,
      description,
      is_approved,
      website,
      type,
      socials,
      image,
      cover_image,
    } = values;
    const input = {
      name,
      slug,
      description,
      is_approved,
      website,
      socials: socials
        ? socials?.map((social: any) => ({
            icon: social?.icon?.value,
            url: social?.url,
          }))
        : [],
      image: {
        thumbnail: image?.thumbnail,
        original: image?.original,
        id: image?.id,
      },
      cover_image: {
        thumbnail: cover_image?.thumbnail,
        original: cover_image?.original,
        id: cover_image?.id,
      },
      type_id: type?.id!,
      language: router.locale,
    };
    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createManufacturer({
          variables: {
            input: {
              ...input,
              ...(initialValues?.slug && { slug: initialValues.slug }),
            },
          },
        });
      } else {
        await updateManufacturer({
          variables: {
            input: {
              ...input,
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

  const generateName = watch('name');

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
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={t('form:manufacturer-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:input-label-cover-image')}
          details={t('form:manufacturer-cover-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="cover_image" control={control} multiple={false} />
        </Card>
      </div>

      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:manufacturer-form-description-details')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
            required
          />

          {isSlugEditable ? (
            <div className="relative mb-5">
              <Input
                label={`${t('Slug')}`}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <SlugEditButton onClick={() => setIsSlugDisable(false)} />
            </div>
          ) : (
            <Input
              label={`${t('Slug')}`}
              {...register('slug')}
              value={slugAutoSuggest}
              variant="outline"
              className="mb-5"
              disabled
            />
          )}

          <Input
            label={t('form:input-label-website')}
            {...register('website')}
            error={t(errors.website?.message!)}
            variant="outline"
            className="mb-5"
          />

          <div className="relative">
            {options?.settings?.options?.useAi && (
              <OpenAIButton
                title="Generate Description With AI"
                onClick={handleGenerateDescription}
              />
            )}
            <TextArea
              label={t('form:input-label-description')}
              {...register('description')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <ProductGroupInput
            control={control}
            error={t(errors?.type?.message)}
          />
          {/* Social and Icon picker */}
          <div>
            {fields.map(
              (item: ShopSocialInput & { id: string }, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 py-5 first:mt-5 first:border-t last:border-b-0 md:py-8 md:first:mt-10"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <Label>{t('form:input-label-select-platform')}</Label>
                      <SelectInput
                        name={`socials.${index}.icon` as const}
                        control={control}
                        options={updatedIcons}
                        isClearable={true}
                        defaultValue={item?.icon!}
                        disabled={isTranslate}
                      />
                    </div>

                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-social-url')}
                      variant="outline"
                      {...register(`socials.${index}.url` as const)}
                      defaultValue={item.url!} // make sure to set up defaultValue
                      disabled={isTranslate}
                      required
                      error={t(errors?.socials?.[index]?.url?.message!)}
                    />
                    <button
                      onClick={() => {
                        remove(index);
                      }}
                      type="button"
                      className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                    >
                      {t('form:button-label-remove')}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>

          <Button
            type="button"
            onClick={() => append({ icon: '', url: '' })}
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-social')}
          </Button>
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
              ? t('form:button-label-update-manufacturer-publication')
              : t('form:button-label-add-manufacturer-publication')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
