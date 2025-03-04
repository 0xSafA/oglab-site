import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Category,
  FlashSale,
  Product,
  Type,
  ProductStatus,
} from '__generated__/__types__';
import { getErrorMessage } from '@/utils/form-error';
import { getAuthCredentials } from '@/utils/auth-utils';
import { useSettings } from '@/contexts/settings.context';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useMeQuery } from '@/graphql/me.graphql';
import { useShopQuery } from '@/graphql/shops.graphql';
import {
  useCreateFlashSaleRequestMutation,
  useUpdateFlashSaleRequestMutation,
} from '@/graphql/flash_sale_requests.graphql';
import SelectInput from '@/components/ui/select-input';
import { useProductsQuery } from '@/graphql/products.graphql';
import CategoryTypeFilter from '@/components/filters/category-type-filter';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import Alert from '@/components/ui/alert';
import { flashSaleVendorRequestValidationSchema } from '@/components/flash-sale/vendor-request/flash-sale-vendor-request-validation-schema';
import { useFlashSalesQuery } from '@/graphql/flash_sale.graphql';
import dayjs from 'dayjs';
import { formatSearchParams } from '@/utils/format-search-params';
import { Routes } from '@/config/routes';
import { toast } from 'react-toastify';
import { Config } from '@/config';

type FormValues = {
  note?: string;
  flashSale?: any;
  products?: any;
};

type IProps = {
  initialValues?: any | null;
};

export default function CreateOrUpdateVendorProductsRequestFlashSaleForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { locale } = router;
  const {
    query: { shop },
  } = router;

  const { t } = useTranslation();
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const { permissions } = getAuthCredentials();
  const { data: user, loading: meLoading, error: meError } = useMeQuery();
  const { currency } = useSettings();
  const { openModal } = useModalAction();

  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });

  const { data: shopData } = useShopQuery({
    variables: {
      slug: router.query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;

  const {
    data: products,
    loading: loadingProduct,
    refetch,
  } = useProductsQuery({
    variables: {
      first: 999,
      shop_id: shopId || null,
      flash_sale_builder: true,
      status: 'publish',
      searchedByUser: 'vendor',
      search: formatSearchParams({
        status: ProductStatus?.Publish?.toLocaleLowerCase() as ProductStatus,
      }),
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    refetch({
      search: formatSearchParams({
        type,
        categories: category,
        status: ProductStatus?.Publish?.toLocaleLowerCase() as ProductStatus,
      }),
      language: locale,
      page: 1,
    });
  }, [type, category]);

  const {
    data: flashSale,
    loading: loadingFlashSale,
    error: errorFlashSale,
    refetch: refetchFlashSale,
  } = useFlashSalesQuery({
    variables: {
      first: 20,
      request_from: 'vendor',
    },
    fetchPolicy: 'network-only',
  });

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
          products: initialValues?.products,
          flashSale: initialValues?.flash_sale,
        }
      : {},
    //@ts-ignore
    resolver: yupResolver(flashSaleVendorRequestValidationSchema),
  });

  const [createFlashSaleRequest, { loading: creating }] =
    useCreateFlashSaleRequestMutation();
  const [updateFlashSaleRequest, { loading: updating }] =
    useUpdateFlashSaleRequestMutation();

  const generateRedirectUrl = shop
    ? `/${shop}${Routes.vendorRequestForFlashSale.list}`
    : Routes.vendorRequestForFlashSale.list;

  const onSubmit = async (values: FormValues) => {
    const inputValues = {
      language: locale,
      title: values?.flashSale?.title,
      flash_sale_id: values?.flashSale?.id,
      note: values.note,
      requested_product_ids: values?.products?.map(
        (product: any) => product?.id,
      ),
    };

    try {
      if (!initialValues) {
        createFlashSaleRequest({
          variables: {
            input: { ...inputValues },
          },
        });

        await router.push(generateRedirectUrl, undefined, {
          locale: Config?.defaultLanguage,
        });
        toast.success(t('successfully-created'));
      } else {
        updateFlashSaleRequest({
          variables: {
            input: {
              ...inputValues,
              id: initialValues.id,
            },
          },
        });

        await router.push(generateRedirectUrl, undefined, {
          locale: Config?.defaultLanguage,
        });
        toast.success(t('successfully-updated'));
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
          } campaign here.`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mt-10">
            <Label>Select flash sale*</Label>
            <SelectInput
              name="flashSale"
              control={control}
              getOptionLabel={(option: any) => option.title}
              getOptionValue={(option: any) => option.id}
              options={flashSale?.flashSales?.data as FlashSale[]}
              isClearable={true}
              isLoading={loadingProduct}
              isMulti={false}
            />
          </div>

          <div className="mt-10">
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
          </div>

          <div className="mt-10">
            <Label>
              {t('form:input-label-offering-campaign-choose-products')}*
            </Label>
            <SelectInput
              name="products"
              control={control}
              getOptionLabel={(option: any) =>
                `${option.name} ${
                  option?.price ? `- ${currency} ${option?.price}` : ''
                }`
              }
              getOptionValue={(option: any) => option.id}
              options={products?.products?.data as Product[]}
              isClearable={true}
              isLoading={loadingProduct}
              isMulti
            />
            <Alert
              message={t('form:info-about-product-chose-on-flash-sale')}
              variant="info"
              closeable={false}
              className="mt-5"
            />
            {errors?.products?.message && (
              <p className="my-2 text-xs text-red-500 ltr:text-left rtl:text-right">
                {t(errors?.products?.message)}
              </p>
            )}
          </div>

          <div className="relative mt-5">
            <TextArea
              label="Note"
              {...register('note')}
              error={t(errors.note?.message!)}
              variant="outline"
              className="mb-5"
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
            loading={updating || creating}
            disabled={updating || creating}
            className="text-sm md:text-base"
          >
            {initialValues ? 'Update Request' : 'Create Request'}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
