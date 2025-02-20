import Card from '@/components/common/card';
import * as typeIcons from '@/components/icons/type';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox/checkbox';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import RadioCard from '@/components/ui/radio-card/radio-card';
import SelectInput from '@/components/ui/select-input';
import TextArea from '@/components/ui/text-area';
import Title from '@/components/ui/title';
import {
  useCreateTypeMutation,
  useUpdateTypeMutation,
} from '@/graphql/type.graphql';
import { getErrorMessage } from '@/utils/form-error';
import { getIcon } from '@/utils/get-icon';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { groupValidationSchema } from './group-validation-schema';
import CategoryTypeFilter from '@/components/filters/category-type-filter';
import ValidationError from '@/components/ui/form-validation-error';
import SlugEditButton from '@/components/ui/slug-edit-button';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { useProductsQuery } from '@/graphql/products.graphql';
import { formatSearchParams } from '@/utils/format-search-params';
import { formatSlug } from '@/utils/use-slug';
import {
  AttachmentInput,
  Category,
  CompactProduct,
  CompactProductInput,
  Product,
  Type,
  TypeSettingsInput,
} from '__generated__/__types__';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

const typeIcon = [
  {
    value: 'FruitsVegetable',
    label: 'Fruits and Vegetable',
  },
  {
    value: 'FacialCare',
    label: 'Facial Care',
  },
  {
    value: 'Handbag',
    label: 'Hand Bag',
  },
  {
    value: 'DressIcon',
    label: 'Dress Icon',
  },
  {
    value: 'FurnitureIcon',
    label: 'Furniture Icon',
  },
  {
    value: 'BookIcon',
    label: 'Book Icon',
  },
  {
    value: 'MedicineIcon',
    label: 'Medicine Icon',
  },
  {
    value: 'Restaurant',
    label: 'Restaurant',
  },
  {
    value: 'Bakery',
    label: 'Bakery',
  },
  {
    value: 'BabyCare',
    label: 'Baby Care',
  },
  {
    value: 'Gadgets',
    label: 'Gadgets',
  },
  {
    value: 'Plant',
    label: 'Plant',
  },
  {
    value: 'HomeAppliance',
    label: 'Home Appliance',
  },
  {
    value: 'MicroGreens',
    label: 'Micro Greens',
  },
];

const layoutTypes = [
  {
    label: 'Classic',
    value: 'classic',
    img: '/image/layout-classic.png',
  },
  {
    label: 'Compact',
    value: 'compact',
    img: '/image/layout-compact.png',
  },
  {
    label: 'Minimal',
    value: 'minimal',
    img: '/image/layout-minimal.png',
  },
  {
    label: 'Modern',
    value: 'modern',
    img: '/image/layout-modern.png',
  },
  {
    label: 'Standard',
    value: 'standard',
    img: '/image/layout-standard.png',
  },
];
const productCards = [
  {
    label: 'Helium',
    value: 'helium',
    img: '/image/card-helium.png',
  },
  {
    label: 'Neon',
    value: 'neon',
    img: '/image/card-neon.png',
  },
  {
    label: 'Argon',
    value: 'argon',
    img: '/image/card-argon.png',
  },
  {
    label: 'Krypton',
    value: 'krypton',
    img: '/image/card-krypton.png',
  },
  {
    label: 'Xenon',
    value: 'xenon',
    img: '/image/card-xenon.png',
  },
  {
    label: 'Radon',
    value: 'radon',
    img: '/image/card-radon.png',
  },
];

export const updatedIcons = typeIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center space-s-5">
      <span className="flex h-5 w-5 items-center justify-center">
        {getIcon({
          iconList: typeIcons,
          iconName: item.value,
          className: 'max-h-full max-w-full',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type BannerInput = {
  title: string;
  description: string;
  image: AttachmentInput;
};

type FormValues = {
  name: string;
  slug?: string | null;
  icon?: any;
  promotional_sliders: AttachmentInput[];
  banners: BannerInput[];
  settings: TypeSettingsInput;
};

type IProps = {
  initialValues?: Type | null;
};
export default function CreateOrUpdateGroupForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.type.list}`
    : Routes.type.list;
  const {
    register,
    control,
    handleSubmit,
    watch,

    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    resolver: yupResolver(groupValidationSchema),
    // @ts-ignore
    defaultValues: {
      ...initialValues,
      settings: {
        ...initialValues?.settings,
        layoutType: initialValues?.settings?.layoutType
          ? initialValues?.settings?.layoutType
          : layoutTypes[0].value,
        productCard: initialValues?.settings?.productCard
          ? initialValues?.settings?.productCard
          : productCards[0].value,
        bestSelling: {
          enable: initialValues?.settings?.bestSelling?.enable,
          title: initialValues?.settings?.bestSelling?.title,
        },
        popularProducts: {
          enable: initialValues?.settings?.popularProducts?.enable,
          title: initialValues?.settings?.popularProducts?.title,
        },
        category: {
          enable: initialValues?.settings?.category?.enable,
          title: initialValues?.settings?.category?.title,
        },
        handpickedProducts: {
          enable: initialValues?.settings?.handpickedProducts?.enable,
          enableSlider:
            initialValues?.settings?.handpickedProducts?.enableSlider,
          title: initialValues?.settings?.handpickedProducts?.title,
          products: initialValues?.settings?.handpickedProducts?.products
            ? initialValues?.settings?.handpickedProducts?.products?.map(
                (product: any) => {
                  return {
                    id: product?.id!,
                    name: product?.name,
                    slug: product?.slug,
                    regular_price: product?.regular_price,
                    sale_price: product?.sale_price,
                    min_price: product?.min_price,
                    max_price: product?.max_price,
                    product_type: product?.product_type,
                    quantity: product?.quantity,
                    is_external: product?.is_external,
                    unit: product?.unit,
                    price: product?.price,
                    external_product_url: product?.external_product_url,
                    status: product?.status,
                    image: {
                      id: product?.image?.id,
                      thumbnail: product?.image?.thumbnail,
                      original: product?.image?.original,
                    },
                  };
                },
              )
            : [],
        },
        newArrival: {
          enable: initialValues?.settings?.newArrival?.enable,
          title: initialValues?.settings?.newArrival?.title,
        },
        authors: {
          enable: initialValues?.settings?.authors?.enable,
          title: initialValues?.settings?.authors?.title,
        },
        manufactures: {
          enable: initialValues?.settings?.manufactures?.enable,
          title: initialValues?.settings?.manufactures?.title,
        },
      },
      icon: initialValues?.icon
        ? typeIcon.find(
            (singleIcon) => singleIcon.value === initialValues?.icon!,
          )
        : '',
    },
  });
  const slugAutoSuggest = formatSlug(watch('name'));
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'banners',
  });
  const layoutType = useWatch({
    control,
    name: 'settings.layoutType',
  });
  const bestSellingEnable = useWatch({
    control,
    name: 'settings.bestSelling.enable',
  });
  const popularProductsEnable = useWatch({
    control,
    name: 'settings.popularProducts.enable',
  });
  const categoryEnable = useWatch({
    control,
    name: 'settings.category.enable',
  });
  const handpickedProductsEnable = useWatch({
    control,
    name: 'settings.handpickedProducts.enable',
  });
  const newArrivalEnable = useWatch({
    control,
    name: 'settings.newArrival.enable',
  });
  const authorsEnable = useWatch({
    control,
    name: 'settings.authors.enable',
  });
  const manufacturesEnable = useWatch({
    control,
    name: 'settings.manufactures.enable',
  });
  const [createType, { loading: creating }] = useCreateTypeMutation();
  const [updateType, { loading: updating }] = useUpdateTypeMutation({
    onCompleted: async ({ updateType }) => {
      if (updateType) {
        if (initialValues?.slug !== updateType?.slug) {
          await router.push(
            `${generateRedirectUrl}/${updateType?.slug}/edit`,
            undefined,
            {
              locale: Config.defaultLanguage,
            },
          );
        }
      }

      // toast.success(t('common:successfully-updated'));
    },
  });
  const onSubmit = async (values: FormValues) => {
    try {
      const inputData = {
        language: router.locale!,
        name: values.name!,
        slug: values.slug!,
        icon: values.icon?.value,
        settings: {
          isHome: values?.settings?.isHome,
          productCard: values?.settings?.productCard,
          layoutType: values?.settings?.layoutType,
          bestSelling: {
            enable: values?.settings?.bestSelling?.enable,
            title: values?.settings?.bestSelling?.title,
          },
          popularProducts: {
            enable: values?.settings?.popularProducts?.enable,
            title: values?.settings?.popularProducts?.title,
          },
          category: {
            enable: values?.settings?.category?.enable,
            title: values?.settings?.category?.title,
          },
          handpickedProducts: {
            enable: values?.settings?.handpickedProducts?.enable,
            enableSlider: values?.settings?.handpickedProducts?.enableSlider,
            title: values?.settings?.handpickedProducts?.title,
            products: values?.settings?.handpickedProducts?.products?.map(
              (product: any) => {
                return {
                  id: product?.id!,
                  name: product?.name,
                  slug: product?.slug,
                  regular_price: product?.regular_price,
                  sale_price: product?.sale_price,
                  min_price: product?.min_price,
                  max_price: product?.max_price,
                  product_type: product?.product_type,
                  quantity: product?.quantity,
                  is_external: product?.is_external,
                  unit: product?.unit,
                  price: product?.price,
                  external_product_url: product?.external_product_url,
                  status: product?.status,
                  image: {
                    id: product?.image?.id,
                    thumbnail: product?.image?.thumbnail,
                    original: product?.image?.original,
                  },
                  type: {
                    settings: {
                      productCard: values?.settings?.productCard,
                    },
                  },
                };
              },
            ),
          },
          newArrival: {
            enable: values?.settings?.newArrival?.enable,
            title: values?.settings?.newArrival?.title,
          },
          authors: {
            enable: values?.settings?.authors?.enable,
            title: values?.settings?.authors?.title,
          },
          manufactures: {
            enable: values?.settings?.manufactures?.enable,
            title: values?.settings?.manufactures?.title,
          },
        },
        promotional_sliders: values.promotional_sliders?.map(
          ({ thumbnail, original, id }: any) => ({
            thumbnail,
            original,
            id,
          }),
        ),
        banners: values?.banners?.map(({ title, description, image }) => ({
          title,
          description,
          image: {
            id: image?.id,
            thumbnail: image?.thumbnail,
            original: image?.original,
          },
        })),
      };

      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createType({
          variables: {
            input: {
              ...inputData,
              ...(initialValues?.slug && { slug: initialValues.slug }),
            },
          },
        });

        // await router.push(Routes.type.list, undefined, {
        //   locale: Config.defaultLanguage,
        // });

        await router.push(generateRedirectUrl, undefined, {
          locale: Config.defaultLanguage,
        });

        toast.success(t('common:create-success'));
      } else {
        const { data } = await updateType({
          variables: {
            input: {
              id: initialValues.id!,
              ...inputData,
            },
          },
        });

        if (data) {
          toast.success(t('common:successfully-updated'));
        }
      }
    } catch (error) {
      getErrorMessage(error);
    }
  };

  const {
    data: products,
    loading: loadingProduct,
    refetch,
  } = useProductsQuery({
    variables: {
      first: 999,
      language: router?.locale,
      status: 'publish',
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    refetch({
      search: formatSearchParams({
        type,
        categories: category,
      }),
      language: router?.locale,
      page: 1,
    });
  }, [type, category, handpickedProductsEnable]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:item-description')}
          details={`${
            initialValues
              ? t('form:item-description-update')
              : t('form:item-description-add')
          } ${t('form:group-description-help-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
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
                label={`${t('form:input-label-slug')}`}
                {...register('slug')}
                error={t(errors.slug?.message!)}
                variant="outline"
                disabled={isSlugDisable}
              />
              <SlugEditButton onClick={() => setIsSlugDisable(false)} />
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

          <div className="mb-5">
            <Label>{t('form:input-label-select-icon')}</Label>
            <SelectInput
              name="icon"
              control={control}
              options={updatedIcons}
              isClearable={true}
            />
          </div>
        </Card>
      </div>

      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:group-settings')}
          details={t('form:group-settings-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Checkbox
            {...register('settings.isHome')}
            error={t(errors.settings?.isHome?.message!)}
            label={t('form:input-label-is-home')}
            className="mb-5"
          />
          <div className="mb-10">
            <Label className="mb-5">{t('form:input-label-layout-type')}</Label>

            <div className="grid grid-cols-3 gap-5">
              {layoutTypes?.map((layout, index) => {
                return (
                  <RadioCard
                    key={index}
                    {...register('settings.layoutType')}
                    label={t(layout.label)}
                    value={layout.value}
                    src={layout.img}
                    id={layout?.value}
                  />
                );
              })}
            </div>
          </div>
          <div className="mb-5">
            <Label className="mb-5">
              {t('form:input-label-product-card-type')}
            </Label>

            <div className="grid grid-cols-3 gap-5">
              {productCards?.map((productCard, index) => {
                return (
                  <RadioCard
                    key={`product-card-${index}`}
                    {...register('settings.productCard')}
                    label={t(productCard.label)}
                    value={productCard.value}
                    src={productCard.img}
                    id={`product-card-${index}`}
                  />
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {layoutType === 'classic' ? (
        <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
          <Description
            title={t('form:promotional-slider')}
            details={t('form:promotional-slider-help-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <FileInput name="promotional_sliders" control={control} />
          </Card>
        </div>
      ) : null}

      <div
        className={classNames(
          layoutType === 'compact'
            ? 'my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8'
            : 'my-5 flex flex-wrap sm:my-8',
        )}
      >
        <Description
          title={t('common:text-banner')}
          details={t('form:banner-slider-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          {layoutType === 'minimal' && fields?.length > 0 ? (
            <Alert
              className="mb-5"
              message="Minimal demo will show only first item of banner."
            />
          ) : (
            ''
          )}
          {(layoutType === 'compact' || layoutType === 'minimal') &&
          fields?.length > 0 ? (
            <Alert
              className="mb-5"
              message="Disabled item will not show in shop end."
              variant="warning"
            />
          ) : (
            ''
          )}
          <div>
            {fields.map((item: any & { id: string }, index: number) => (
              <div
                className="border-b border-dashed border-border-200 py-5 first:pt-0 last:border-0 md:py-8"
                key={item.id}
              >
                <div className="mb-5 flex items-center justify-between">
                  <Title className="mb-0">
                    {t('common:text-banner')} {index + 1}
                  </Title>
                  <button
                    onClick={() => {
                      remove(index);
                    }}
                    type="button"
                    className={classNames(
                      'text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4',
                      layoutType === 'minimal' && index !== 0 && index > 0
                        ? 'pointer-events-none cursor-not-allowed text-opacity-80'
                        : '',
                    )}
                    disabled={
                      layoutType === 'minimal' && index !== 0 && index > 0
                    }
                  >
                    {t('form:button-label-remove')}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <Input
                    label={t('form:input-title')}
                    variant="outline"
                    {...register(`banners.${index}.title` as const)}
                    defaultValue={item?.title!} // make sure to set up defaultValue
                    error={t(errors.banners?.[index]?.title?.message!)}
                    disabled={
                      layoutType === 'compact' ||
                      (layoutType === 'minimal' && index !== 0 && index > 0)
                    }
                  />

                  <TextArea
                    label={t('form:input-description')}
                    variant="outline"
                    {...register(`banners.${index}.description` as const)}
                    defaultValue={item.description!}
                    disabled={
                      layoutType === 'compact' ||
                      (layoutType === 'minimal' && index !== 0 && index > 0)
                    }
                  />
                </div>

                <div className="mt-5 w-full">
                  <Title>
                    {t('form:input-banner')}
                    {layoutType === 'compact' ? (
                      <span className="ml-0.5 text-red-500">*</span>
                    ) : (
                      ''
                    )}
                  </Title>
                  <FileInput
                    name={`banners.${index}.image`}
                    control={control}
                    multiple={false}
                    disabled={
                      layoutType === 'minimal' && index !== 0 && index > 0
                    }
                  />
                  <ValidationError
                    message={t(errors?.banners?.[index]?.image?.message!)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => append({ title: '', description: '', image: {} })}
            className="w-full sm:w-auto"
            disabled={layoutType === 'minimal' && fields?.length > 0}
          >
            {t('form:button-label-add-banner')}
          </Button>
          {/* @ts-ignore */}
          {errors?.banners?.message ? (
            <Alert
              // @ts-ignore
              message={t(errors?.banners?.message)}
              variant="error"
              className="mt-5"
            />
          ) : null}
        </Card>
      </div>

      {layoutType === 'compact' ? (
        <div className="my-5 flex flex-wrap sm:my-8">
          <Description
            title="Layout Content Settings."
            details="Please set your layout content here."
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div className="grid gap-5">
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.bestSelling.enable"
                  control={control}
                />
                <Label
                  htmlFor="settings.bestSelling.enable"
                  className="mb-0 cursor-pointer"
                >
                  Enable Best Selling Products?
                </Label>
              </div>
              {bestSellingEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.bestSelling.title')}
                  error={t(errors?.settings?.bestSelling?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.popularProducts.enable"
                  control={control}
                />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.popularProducts.enable"
                >
                  Enable Popular Products?
                </Label>
              </div>
              {popularProductsEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.popularProducts.title')}
                  error={t(errors?.settings?.popularProducts?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.category.enable"
                  control={control}
                />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.category.enable"
                >
                  Enable Category?
                </Label>
              </div>
              {categoryEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.category.title')}
                  error={t(errors?.settings?.category?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.handpickedProducts.enable"
                  control={control}
                />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.handpickedProducts.enable"
                >
                  Enable Handpicked Products?
                </Label>
              </div>
              {handpickedProductsEnable ? (
                <>
                  <Input
                    label={t('form:input-title')}
                    variant="outline"
                    {...register('settings.handpickedProducts.title')}
                    error={t(
                      errors?.settings?.handpickedProducts?.title?.message,
                    )}
                  />
                  <div className="flex items-center gap-x-4">
                    <SwitchInput
                      name="settings.handpickedProducts.enableSlider"
                      control={control}
                    />
                    <Label
                      className="mb-0 cursor-pointer"
                      htmlFor="settings.handpickedProducts.enableSlider"
                    >
                      Enable Slider?
                    </Label>
                  </div>
                  <div className="grid gap-5">
                    <CategoryTypeFilter
                      className="w-full"
                      type={type}
                      enableCategory
                      enableType
                      onCategoryFilter={(category: Category) => {
                        setCategory(category?.slug!);
                      }}
                      onTypeFilter={(type: Type) => {
                        setType(type?.slug!);
                      }}
                    />
                    <div>
                      <Label>
                        Products <span className="ml-0.5 text-red-500">*</span>
                      </Label>
                      <SelectInput
                        name="settings.handpickedProducts.products"
                        control={control}
                        getOptionLabel={(option: any) => option.name}
                        getOptionValue={(option: any) => option.id}
                        options={products?.products?.data as Product[]}
                        isClearable={true}
                        isLoading={loadingProduct}
                        isMulti
                      />
                      <ValidationError
                        message={t(
                          errors?.settings?.handpickedProducts?.products
                            ?.message,
                        )}
                      />
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.newArrival.enable"
                  control={control}
                />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.newArrival.enable"
                >
                  Enable New Arrival?
                </Label>
              </div>
              {newArrivalEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.newArrival.title')}
                  error={t(errors?.settings?.newArrival?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput name="settings.authors.enable" control={control} />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.authors.enable"
                >
                  Enable Authors?
                </Label>
              </div>
              {authorsEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.authors.title')}
                  error={t(errors?.settings?.authors?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.manufactures.enable"
                  control={control}
                />
                <Label
                  className="mb-0 cursor-pointer"
                  htmlFor="settings.manufactures.enable"
                >
                  Enable Manufactures?
                </Label>
              </div>
              {manufacturesEnable ? (
                <Input
                  label={t('form:input-title')}
                  variant="outline"
                  {...register('settings.manufactures.title')}
                  error={t(errors?.settings?.manufactures?.title?.message)}
                  required
                />
              ) : (
                ''
              )}
            </div>
          </Card>
        </div>
      ) : (
        ''
      )}

      <StickyFooterPanel className="z-0">
        <div className="text-end">
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
              ? t('form:button-label-update-group')
              : t('form:button-label-add-group')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
