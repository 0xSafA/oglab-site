import Input from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from '@/components/ui/date-picker';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from '@/graphql/coupons.graphql';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Router, { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { toast } from 'react-toastify';
import { useSettings } from '@/contexts/settings.context';
import { useTranslation } from 'next-i18next';
import FileInput from '@/components/ui/file-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { couponValidationSchema } from './coupon-validation-schema';
import { AttachmentInput, Coupon } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { CouponType, ItemProps } from '@/types/custom-types';
import Radio from '@/components/ui/radio/radio';
import OpenAIButton from '@/components/openAI/openAI.button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { useCallback, useEffect, useMemo } from 'react';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '../ui/switch-input';
import { useShopLazyQuery, useShopQuery } from '@/graphql/shops.graphql';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a description that highlights the exclusive savings and irresistible discounts of our new coupon ${name}.`,
    },
    {
      id: 2,
      title: `Craft a compelling description showcasing the value and benefits customers can enjoy with our exciting new coupon.`,
    },
    {
      id: 3,
      title: `Develop a captivating description introducing our latest coupon, designed to help shoppers save big on their favorite products.`,
    },
    {
      id: 4,
      title: `Create a description that presents our new coupon as a gateway to incredible savings and unbeatable deals.`,
    },
    {
      id: 5,
      title: `Shape a concise description highlighting the convenience and potential savings customers can unlock with our innovative coupon.`,
    },
    {
      id: 6,
      title: `Craft an enticing description showcasing the wide range of products and services eligible for discounts with our new coupon.`,
    },
    {
      id: 7,
      title: `Build a compelling description emphasizing the limited-time nature and exclusive offers available through our new coupon.`,
    },
    {
      id: 8,
      title: `Design a concise description introducing our new coupon as a must-have for savvy shoppers looking to stretch their budget.`,
    },
    {
      id: 9,
      title: `Write an engaging description highlighting the fantastic opportunities for savings and value provided by our new coupon.`,
    },
    {
      id: 10,
      title: `Develop a captivating description that presents our new coupon as a game-changer, delivering incredible discounts and incredible value.`,
    },
  ];
};

type FormValues = {
  code: string;
  type: CouponType;
  description: string;
  amount: number;
  minimum_cart_amount: number;
  image: AttachmentInput;
  active_from: string;
  expire_at: string;
  target: boolean;
};

const defaultValues = {
  image: '',
  type: CouponType.FIXED,
  amount: 0,
  target: false,
  minimum_cart_amount: 0,
  active_from: new Date(),
  expire_at: new Date(),
};

type IProps = {
  initialValues?: Coupon | null;
};
export default function CreateOrUpdateCouponForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const {
    locale,
    query: { shop },
  } = router;
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });
  const [getShop, { data: shopData }] = useShopLazyQuery();

  const generateRedirectUrl = router.query.shop
    ? `/${router.query.shop}${Routes.coupon.list}`
    : Routes.coupon.list;

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
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    resolver: yupResolver(couponValidationSchema),
    // @ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          active_from: new Date(initialValues.active_from!),
          expire_at: new Date(initialValues.expire_at!),
        }
      : defaultValues,
  });
  const { currency } = useSettings();

  const [createCoupon, { loading: creating }] = useCreateCouponMutation({
    onCompleted: async () => {
      if (shop) {
        await router.push(`/${shop}${Routes.coupon.list}`, undefined, {
          locale: Config.defaultLanguage,
        });
      } else {
        await router.push(Routes.coupon.list, undefined, {
          locale: Config.defaultLanguage,
        });
      }
      toast.success(t('common:successfully-created'));
    },
  });
  const [updateCoupon, { loading: updating }] = useUpdateCouponMutation({
    onCompleted: async ({ coupon }: any) => {
      if (coupon) {
        if (initialValues?.code !== coupon?.code) {
          await router.push(
            `${generateRedirectUrl}/${coupon?.code}/edit`,
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

  const [active_from, expire_at] = watch(['active_from', 'expire_at']);
  const couponType = watch('type');

  const isTranslateCoupon = router.locale !== Config.defaultLanguage;

  const onSubmit = async (values: FormValues) => {
    const input = {
      language: router.locale,
      type: values.type,
      target: values.target,
      description: values.description,
      amount: values.amount,
      minimum_cart_amount: values.minimum_cart_amount,
      active_from: new Date(values.active_from).toISOString(),
      expire_at: new Date(values.expire_at).toISOString(),
      image: {
        thumbnail: values?.image?.thumbnail,
        original: values?.image?.original,
        id: values?.image?.id,
      },
    };

    try {
      if (
        !initialValues ||
        !initialValues?.translated_languages?.includes(router?.locale!)
      ) {
        await createCoupon({
          variables: {
            input: {
              ...input,
              code: values.code,
              ...(initialValues?.code && { code: initialValues.code }),
              shop_id: shopId,
            },
          },
        });
      } else {
        await updateCoupon({
          variables: {
            input: {
              ...input,
              ...(initialValues.code !== values.code && { code: values.code }),
              id: initialValues.id!,
              shop_id: shopId,
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

  const generateName = watch('code');

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
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-image')}
          details={t('form:coupon-image-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="image" control={control} multiple={false} />
        </Card>
      </div>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:coupon-form-info-help-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-code')}
            {...register('code')}
            error={t(errors.code?.message!)}
            variant="outline"
            className="mb-5"
            disabled={isTranslateCoupon}
            required
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

          <div className="mb-5">
            <Label>{t('form:input-label-type')}</Label>
            <div className="space-y-3.5">
              <Radio
                label={t('form:input-label-fixed')}
                {...register('type')}
                id="fixed"
                value={CouponType.FIXED}
                error={t(errors.type?.message!)}
                disabled={isTranslateCoupon}
              />
              <Radio
                label={t('form:input-label-percentage')}
                {...register('type')}
                id="percentage"
                value={CouponType.PERCENTAGE}
                disabled={isTranslateCoupon}
              />
              <Radio
                label={t('form:input-label-free-shipping')}
                {...register('type')}
                id="free_shipping"
                value={CouponType.FREE_SHIPPING}
                disabled={isTranslateCoupon}
              />
            </div>
          </div>

          {couponType !== CouponType.FREE_SHIPPING && (
            <Input
              label={`${t('form:coupon-input-label-amount')} (${currency})`}
              {...register('amount')}
              type="number"
              error={t(errors.amount?.message!)}
              variant="outline"
              className="mb-5"
              disabled={isTranslateCoupon}
            />
          )}
          <Input
            label={`${t('form:input-label-minimum-cart-amount')} (${currency})`}
            {...register('minimum_cart_amount')}
            type="number"
            error={t(errors.minimum_cart_amount?.message!)}
            variant="outline"
            className="mb-5"
            disabled={isTranslateCoupon}
            required
          />

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput name="target" control={control} />
              <Label className="!mb-0.5">
                {t('form:input-label-verified-customer')}
              </Label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
              <DatePicker
                control={control}
                name="active_from"
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                maxDate={new Date(expire_at)}
                startDate={new Date(active_from)}
                endDate={new Date(expire_at)}
                className="border border-border-base"
                disabled={isTranslateCoupon}
                label={t('form:coupon-active-from')}
                error={t(errors.active_from?.message!)}
              />
            </div>
            <div className="w-full p-0 sm:w-1/2 sm:ps-2">
              <DatePicker
                control={control}
                name="expire_at"
                dateFormat="dd/MM/yyyy"
                startDate={new Date(active_from)}
                endDate={new Date(expire_at)}
                minDate={new Date(active_from)}
                className="border border-border-base"
                disabled={isTranslateCoupon}
                required
                label={t('form:coupon-expire-at')}
                error={t(errors.expire_at?.message!)}
              />
            </div>
          </div>
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
              ? t('form:button-label-update-coupon')
              : t('form:button-label-add-coupon')}
          </Button>
        </div>
      </StickyFooterPanel>
    </form>
  );
}
