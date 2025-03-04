import Input from '@/components/ui/input';
import { Control, FieldErrors, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Label from '@/components/ui/label';
import { useTypesQuery } from '@/graphql/type.graphql';
import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import * as categoriesIcon from '@/components/icons/category';
import { getIcon } from '@/utils/get-icon';
import { useRouter } from 'next/router';
import { getErrorMessage } from '@/utils/form-error';
import ValidationError from '@/components/ui/form-validation-error';
import { toast } from 'react-toastify';
import { tagIcons } from './tag-icons';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { getFormattedImage } from '@/utils/get-formatted-image';
import { useState } from 'react';
import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from '@/graphql/tags.graphql';
import { tagValidationSchema } from './tag-validation-schema';
import { Tag } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useCallback, useMemo } from 'react';
import { ItemProps } from '@/types/custom-types';
import OpenAIButton from '@/components/openAI/openAI.button';
import { formatSlug } from '@/utils/use-slug';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SlugEditButton from '@/components/ui/slug-edit-button';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Discover the magic of ${name} as we curate the finest products for you.`,
    },
    {
      id: 2,
      title: `Elevate your shopping experience with our carefully selected ${name} collection.`,
    },
    {
      id: 3,
      title: `Explore a world of possibilities with our diverse range of ${name} products.`,
    },
    {
      id: 4,
      title: `Experience excellence with our handpicked selection of ${name} items.`,
    },
    {
      id: 5,
      title: `Find your perfect match among our premium ${name} products.`,
    },
    {
      id: 6,
      title: `Simplify your search and find what you need with our intuitive ${name} category.`,
    },
    {
      id: 7,
      title: `Embrace style and functionality with our exclusive ${name} product line.`,
    },
    {
      id: 8,
      title: `Enhance your lifestyle with our innovative ${name} offerings.`,
    },
    {
      id: 9,
      title: `Unlock new dimensions of ${name} with our exceptional product assortment.`,
    },
    {
      id: 10,
      title: `Immerse yourself in the world of ${name} and discover unique treasures.`,
    },
  ];
};

function SelectTypes({
  control,
  errors,
}: {
  control: Control<FormValues>;
  errors: FieldErrors;
}) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { data: types, loading } = useTypesQuery({
    variables: {
      language: locale,
    },
    fetchPolicy: 'network-only',
  });
  return (
    <div className="mb-5">
      <Label>{t('form:input-label-types')}</Label>
      <SelectInput
        name="type"
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        options={types?.types!}
        isLoading={loading}
      />
      <ValidationError message={t(errors.type?.message)} />
    </div>
  );
}

export const updatedIcons = tagIcons.map((item: any) => {
  item.label = (
    <div className="flex items-center space-s-5">
      <span className="flex h-5 w-5 items-center justify-center">
        {getIcon({
          iconList: categoriesIcon,
          iconName: item.value,
          className: 'max-h-full max-w-full',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type FormValues = {
  name: string;
  slug: string;
  type: any;
  details: string;
  image: any;
  icon: any;
};

const defaultValues = {
  image: '',
  name: '',
  slug: '',
  details: '',
  icon: '',
  type: '',
};

type IProps = {
  initialValues?: Tag | null;
};
export default function CreateOrUpdateTagForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isNewTranslation = router?.query?.action === 'translate';
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.tag.list}`
    : Routes.tag.list;
  const { locale } = router;
  const { openModal } = useModalAction();
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          icon: initialValues?.icon
            ? tagIcons.find(
                (singleIcon) => singleIcon.value === initialValues?.icon!,
              )
            : '',
          ...(isNewTranslation && {}),
        }
      : defaultValues,

    //@ts-ignore
    resolver: yupResolver(tagValidationSchema),
  });

  const slugAutoSuggest = formatSlug(watch('name'));
  const [createTag, { loading: creating }] = useCreateTagMutation();
  const [updateTag, { loading: updating }] = useUpdateTagMutation({
    onCompleted: async ({ updateTag }) => {
      if (updateTag) {
        await router.push(generateRedirectUrl, undefined, {
          locale: Config.defaultLanguage,
        });
      }

      toast.success(t('common:successfully-updated'));
    },
  });

  const onSubmit = async (values: FormValues) => {
    const inputData = {
      name: values.name,
      slug: values.slug ? formatSlug(values.slug) : formatSlug(generateName),
      details: values.details,
      language: router.locale!,
      image: getFormattedImage(values?.image),
      icon: values.icon?.value ?? '',
      type_id: values.type?.id,
    };
    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createTag({
          variables: {
            input: {
              ...inputData,
              // ...(initialValues?.slug && { slug: initialValues.slug }),
            },
          },
        });
        await router.push(Routes.tag.list, undefined, {
          locale: Config.defaultLanguage,
        });

        toast.success(t('common:create-success'));
      } else {
        await updateTag({
          variables: {
            input: {
              ...inputData,
              slug: formatSlug(inputData.slug),
              id: initialValues?.id!,
            },
          },
        });
      }
    } catch (err) {
      getErrorMessage(err);
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
      key: 'details',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [generateName]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:tag-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>

      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:tag-description-helper-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-name')}
            {...register('name')}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
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

          <div className="relative">
            {options?.settings?.options?.useAi && (
              <OpenAIButton
                title="Generate Description With AI"
                onClick={handleGenerateDescription}
              />
            )}
            <TextArea
              label={t('form:input-label-details')}
              {...register('details')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-select-icon')}</Label>
            <SelectInput
              name="icon"
              control={control}
              options={updatedIcons}
              isClearable={true}
            />
          </div>
          <SelectTypes control={control} errors={errors} />
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
            loading={creating || updating}
            disabled={creating || updating}
          >
            {initialValues
              ? t('form:button-label-update-tag')
              : t('form:button-label-add-tag')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
