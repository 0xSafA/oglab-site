import Card from '@/components/common/card';
import { CURRENCY } from '@/components/settings/payment/currency';
import { PAYMENT_GATEWAY } from '@/components/settings/payment/payment-gateway';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import ValidationError from '@/components/ui/form-validation-error';
import GooglePlacesAutocomplete from '@/components/ui/form/google-places-autocomplete';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Loader from '@/components/ui/loader/loader';
import SelectInput from '@/components/ui/select-input';
import SwitchInput from '@/components/ui/switch-input';
import TextArea from '@/components/ui/text-area';
// import { Config } from '@/config';
import { useSettings } from '@/contexts/settings.context';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/graphql/settings.graphql';
import { siteSettings } from '@/settings/site.settings';
import { ItemProps } from '@/types/custom-types';
import { getErrorMessage } from '@/utils/form-error';
import {
  formatEventAPIData,
  formatEventOptions,
} from '@/utils/format-event-options';
import { getFormattedImage } from '@/utils/get-formatted-image';
import { updatedIcons } from '@/utils/update-social-icons';
import { formatPrice } from '@/utils/use-price';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ContactDetailsInput,
  ServerInfoInput,
  SettingCurrencyOptionsInput,
  SettingsOptions,
  Shipping,
  ShopSocialInput,
  Tax,
} from '__generated__/__types__';
import { isEmpty, split } from 'lodash';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import OpenAIButton from '../openAI/openAI.button';
import Badge from '../ui/badge/badge';
import { useModalAction } from '../ui/modal/modal.context';
import PaymentSelect from '../ui/payment-select';
import { AI } from './ai';
import { COUNTRY_LOCALE } from '@/components/settings/payment/country-locale';
import {
  EMAIL_GROUP_OPTION,
  SMS_GROUP_OPTION,
} from '@/components/settings/events/eventsOption';
import { settingsValidationSchema } from './settings-validation-schema';
import WebHookURL from '@/components/settings/payment/webhook-url';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a meta description that entices and informs users about ${name}'s offerings.`,
    },
    {
      id: 2,
      title: `Craft a concise and compelling meta description that captures the essence of ${name}.`,
    },
    {
      id: 3,
      title: `Develop a captivating meta description that sparks curiosity and encourages click-throughs.`,
    },
    {
      id: 4,
      title: `Create a concise and engaging meta description that highlights the unique value of ${name}.`,
    },
    {
      id: 5,
      title: `Shape a compelling meta description that communicates the benefits of exploring ${name}.`,
    },
    {
      id: 6,
      title: `Craft a concise and informative meta description to drive organic traffic to ${name}.`,
    },
    {
      id: 7,
      title: `Build a captivating meta description that stands out and encourages users to visit ${name}.`,
    },
    {
      id: 8,
      title: `Design a concise and enticing meta description to improve click-through rates to ${name}.`,
    },
    {
      id: 9,
      title: `Write an engaging meta description that effectively summarizes ${name}'s offerings.`,
    },
    {
      id: 10,
      title: `Develop a compelling meta description that boosts visibility and drives user engagement with ${name}.`,
    },
  ];
};

export const chatbotAutoSuggestion1 = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write an enticing OG description that grabs attention and compels users to explore ${name}.`,
    },
    {
      id: 2,
      title: `Craft a concise and compelling OG description that showcases the unique value of ${name}.`,
    },
    {
      id: 3,
      title: `Develop a captivating OG description that piques curiosity and encourages user engagement.`,
    },
    {
      id: 4,
      title: `Create a concise and engaging OG description that conveys the essence of ${name}.`,
    },
    {
      id: 5,
      title: `Shape an enticing OG description that entices users to click and discover more on ${name}.`,
    },
    {
      id: 6,
      title: `Craft a concise and informative OG description that sparks interest in ${name}'s offerings.`,
    },
    {
      id: 7,
      title: `Build a captivating OG description that leaves a lasting impression and drives traffic to ${name}.`,
    },
    {
      id: 8,
      title: `Design a concise and enticing OG description to maximize visibility and user engagement.`,
    },
    {
      id: 9,
      title: `Write an engaging OG description that effectively communicates the key benefits of ${name}.`,
    },
    {
      id: 10,
      title: `Develop a compelling OG description that stands out and encourages users to explore ${name} further.`,
    },
  ];
};

type FormValues = {
  siteTitle: string;
  siteSubtitle: string;
  currency: any;
  defaultAi: any;
  minimumOrderAmount: number;
  signupPoints: number;
  maximumQuestionLimit: number;
  maxShopDistance: number;
  useOtp: boolean;
  useGoogleMap: boolean;
  useEnableGateway: boolean;
  defaultPaymentGateway: paymentGatewayOption;
  isProductReview: boolean;
  useMustVerifyEmail: boolean;
  useAi: boolean;
  freeShipping: boolean;
  freeShippingAmount: number;
  useCashOnDelivery: boolean;
  paymentGateway: paymentGatewayOption[];
  currencyToWalletRatio: number;
  logo: any;
  taxClass: Tax;
  deliveryTime: {
    title: string;
    description: string;
  };
  shippingClass: Shipping;
  contactDetails: ContactDetailsInput;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: any;
    twitterHandle: string;
    twitterCardType: string;
    metaTags: string;
    canonicalUrl: string;
  };
  google: {
    isEnable: boolean;
    tagManagerId: string;
  };
  facebook: {
    isEnable: boolean;
    appId: string;
    pageId: string;
  };
  currencyOptions: {
    formation?: string;
    fractions?: number;
  };
  guestCheckout: boolean;
  smsEvent: any;
  emailEvent: any;
  server_info: ServerInfoInput;
};
type paymentGatewayOption = {
  name: string;
  title: string;
};

type IProps = {
  settings: SettingsOptions | undefined | null;
  taxClasses: Tax[] | undefined | null;
  shippingClasses: Shipping[] | undefined | null;
};

export default function SettingsForm({
  settings,
  taxClasses,
  shippingClasses,
}: IProps) {
  const { t } = useTranslation();
  const [updateSettingsMutation, { loading }] = useUpdateSettingsMutation();
  const { locale }: any = useRouter();
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;
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
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(settingsValidationSchema),
    defaultValues: {
      ...settings,
      contactDetails: {
        ...settings?.contactDetails,
        socials: settings?.contactDetails?.socials
          ? settings?.contactDetails?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
              url: social?.url,
            }))
          : [],
      },
      useEnableGateway: settings?.useEnableGateway ?? true,
      guestCheckout: settings?.guestCheckout ?? true,
      // @ts-ignore
      deliveryTime: settings?.deliveryTime ? settings?.deliveryTime : [],
      logo: settings?.logo ?? '',
      currency: settings?.currency
        ? CURRENCY.find((item) => item.code == settings?.currency)
        : '',
      defaultAi: settings?.defaultAi
        ? AI.find((item) => item.value == settings?.defaultAi)
        : '',
      defaultPaymentGateway: settings?.defaultPaymentGateway
        ? PAYMENT_GATEWAY.find(
            (item) => item.name == settings?.defaultPaymentGateway,
          )
        : PAYMENT_GATEWAY[0],

      currencyOptions: {
        ...settings?.currencyOptions,
        // @ts-ignore
        formation: settings?.currencyOptions?.formation
          ? COUNTRY_LOCALE.find(
              (item) => item.code == settings?.currencyOptions?.formation,
            )
          : COUNTRY_LOCALE[0],
      },
      // multi-select on payment gateway
      paymentGateway: settings?.paymentGateway
        ? settings?.paymentGateway.map((gateaway: any) => ({
            name: gateaway?.name,
            title: gateaway?.title,
          }))
        : [],
      // @ts-ignore
      taxClass: !!taxClasses?.length
        ? taxClasses?.find((tax: Tax) => tax.id == settings?.taxClass)
        : '',
      // @ts-ignore
      shippingClass: !!shippingClasses?.length
        ? shippingClasses?.find(
            (shipping: Shipping) => shipping.id == settings?.shippingClass,
          )
        : '',
      smsEvent: settings?.smsEvent
        ? formatEventAPIData(settings?.smsEvent)
        : null,
      emailEvent: settings?.emailEvent
        ? formatEventAPIData(settings?.emailEvent)
        : null,
    },
  });

  const enableFreeShipping = watch('freeShipping');
  const currentCurrency = watch('currency');
  const formation = watch('currencyOptions.formation');
  const currentFractions = watch('currencyOptions.fractions') as number;
  const enableGuestCheckout = watch('guestCheckout');

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore
    name: 'deliveryTime',
  });

  const {
    fields: socialFields,
    append: socialAppend,
    remove: socialRemove,
  } = useFieldArray({
    control,
    name: 'contactDetails.socials',
  });

  const { updateSettings } = useSettings();

  async function onSubmit(values: FormValues) {
    try {
      const currencyOptions: SettingCurrencyOptionsInput = {
        ...values.currencyOptions!,
        formation:
          //@ts-ignore
          (values?.currencyOptions?.formation?.code! as string) || null,
      };
      const contactDetails = {
        ...values?.contactDetails,
        location: { ...omit(values?.contactDetails?.location, '__typename') },
        socials: values?.contactDetails?.socials
          ? values?.contactDetails?.socials?.map((social: any) => ({
              icon: social?.icon?.value,
              url: social?.url,
            }))
          : [],
      };
      const smsEvent = formatEventOptions(values.smsEvent);
      const emailEvent = formatEventOptions(values.emailEvent);
      const { data } = await updateSettingsMutation({
        variables: {
          input: {
            language: locale,
            // @ts-ignore
            options: {
              ...values,
              signupPoints: Number(values.signupPoints),
              maximumQuestionLimit: Number(values.maximumQuestionLimit),
              maxShopDistance: Number(values.maxShopDistance),
              currencyToWalletRatio: Number(values.currencyToWalletRatio),
              minimumOrderAmount: Number(values.minimumOrderAmount),
              freeShippingAmount: Number(values.freeShippingAmount),
              currency: values.currency?.code,
              defaultAi: values?.defaultAi?.value,
              defaultPaymentGateway: values.defaultPaymentGateway?.name,
              paymentGateway:
                values.paymentGateway && values?.paymentGateway!.length
                  ? values.paymentGateway?.map((gateaway: any) => ({
                      name: gateaway.name,
                      title: gateaway.title,
                    }))
                  : PAYMENT_GATEWAY.filter(
                      // @ts-ignore
                      (value: any, index: number) => index < 2,
                    ),
              taxClass: values?.taxClass?.id,
              shippingClass: values?.shippingClass?.id,
              logo: getFormattedImage(values?.logo),
              smsEvent,
              emailEvent,
              contactDetails,
              // @ts-ignore
              currencyOptions,
              seo: {
                ...values?.seo,
                ogImage: getFormattedImage(values?.seo?.ogImage),
              },
            },
          },
        },
      });

      if (data) {
        updateSettings(data?.updateSettings?.options);
        toast.success(t('common:successfully-updated'));
      }
    } catch (error) {
      getErrorMessage(error);
    }
  }

  const upload_max_filesize =
    settings?.server_info?.upload_max_filesize! / 1024;

  const paymentGateway = watch('paymentGateway');
  const defaultPaymentGateway = watch('defaultPaymentGateway');
  let useEnableGateway = watch('useEnableGateway');
  //  let enableAi = watch('useAi');
  const logoInformation = (
    <span>
      {t('form:logo-help-text')} <br />
      {t('form:logo-dimension-help-text')} &nbsp;
      <span className="font-bold">
        {siteSettings.logo.width}x{siteSettings.logo.height} {t('common:pixel')}
      </span>
      <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{upload_max_filesize} MB </span>
    </span>
  );
  let checkAvailableDefaultGateway = paymentGateway?.some(
    (item) => item?.name === defaultPaymentGateway?.name,
  );

  const isStripeActive = paymentGateway?.some(
    (payment) => payment?.name === 'stripe',
  );

  const generateName = watch('siteTitle');

  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestion({ name: generateName ?? '' });
  }, [generateName]);
  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'seo.metaDescription',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [generateName]);

  const autoSuggestionList1 = useMemo(() => {
    return chatbotAutoSuggestion1({ name: generateName ?? '' });
  }, [generateName]);
  const handleGenerateDescription1 = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: generateName,
      set_value: setValue,
      key: 'seo.ogDescription',
      suggestion: autoSuggestionList1 as ItemProps[],
    });
  }, [generateName]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={logoInformation}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="logo" control={control} multiple={false} />
        </Card>
      </div>

      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-site-title')}
            {...register('siteTitle')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-site-subtitle')}
            {...register('siteSubtitle')}
            variant="outline"
            className="mb-5"
          />

          <Input
            label={`${t('form:input-label-min-order-amount')}`}
            {...register('minimumOrderAmount')}
            type="number"
            error={t(errors.minimumOrderAmount?.message!)}
            variant="outline"
            className="mb-5"
            // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={`${t('form:input-label-wallet-currency-ratio')}`}
            {...register('currencyToWalletRatio')}
            type="number"
            error={t(errors.currencyToWalletRatio?.message!)}
            variant="outline"
            className="mb-5"
            // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={`${t('form:input-label-signup-points')}`}
            {...register('signupPoints')}
            type="number"
            error={t(errors.signupPoints?.message!)}
            variant="outline"
            className="mb-5"
            // disabled={isNotDefaultSettingsPage}
          />

          <Input
            label={`${t('form:input-label-maximum-question-limit')}`}
            {...register('maximumQuestionLimit')}
            type="number"
            error={t(errors.maximumQuestionLimit?.message!)}
            variant="outline"
            className="mb-5"
            // disabled={isNotDefaultSettingsPage}
          />

          <div className="mb-5 flex items-center gap-x-4">
            <SwitchInput
              name="useOtp"
              control={control}
              // disabled={isNotDefaultSettingsPage}
            />
            <Label className="mb-0">{t('form:input-label-enable-otp')}</Label>
          </div>
          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useMustVerifyEmail"
                control={control}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-use-must-verify-email')}
              </Label>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useAi"
                control={control}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-enable-open-ai')}
              </Label>
            </div>
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-select-ai')}</Label>
            <SelectInput
              name="defaultAi"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={AI}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-tax-class')}</Label>
            <SelectInput
              name="taxClass"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={taxClasses!}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-shipping-class')}</Label>
            <SelectInput
              name="shippingClass"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.id}
              options={shippingClasses!}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="guestCheckout"
                control={control}
                checked={enableGuestCheckout}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-enable-guest-checkout')}
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <SwitchInput
              name="freeShipping"
              control={control}
              checked={enableFreeShipping}
              // disabled={isNotDefaultSettingsPage}
            />
            <Label className="mb-0">
              {t('form:input-label-enable-free-shipping')}
            </Label>
          </div>

          {enableFreeShipping && (
            <Input
              label={t('form:free-shipping-input-label-amount')}
              {...register('freeShippingAmount')}
              error={t(errors.freeShippingAmount?.message!)}
              variant="outline"
              type="number"
              className="mt-5"
              // disabled={isNotDefaultSettingsPage}
            />
          )}
        </Card>
      </div>

      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('Payment')}
          details={t('Configure Payment Option')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useCashOnDelivery"
                control={control}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">{t('Enable Cash On Delivery')}</Label>
            </div>
          </div>
          <div className="mb-5">
            <Label>{t('form:input-label-currency')}</Label>
            <SelectInput
              name="currency"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={CURRENCY}
              // disabled={isNotDefaultSettingsPage}
            />
            <ValidationError message={t(errors.currency?.message)} />
          </div>
          <div className="flex items-center gap-x-4">
            <SwitchInput
              control={control}
              // disabled={isNotDefaultSettingsPage}
              {...register('useEnableGateway')}
            />
            <Label className="mb-0">{t('Enable Gateway')}</Label>
          </div>
          {useEnableGateway ? (
            <>
              <div className="mb-5 mt-5">
                <Label>{t('text-select-payment-gateway')}</Label>
                <PaymentSelect
                  options={PAYMENT_GATEWAY}
                  control={control}
                  name="paymentGateway"
                  defaultItem={
                    checkAvailableDefaultGateway
                      ? defaultPaymentGateway?.name
                      : ''
                  }
                  disable={isEmpty(paymentGateway)}
                />
              </div>

              {isEmpty(paymentGateway) ? (
                <div className="flex px-5 py-4">
                  <Loader
                    simple={false}
                    showText={true}
                    text="Please wait payment method is preparing..."
                    className="mx-auto !h-20 w-6"
                  />
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <Label>{t('text-select-default-payment-gateway')}</Label>
                    <SelectInput
                      name="defaultPaymentGateway"
                      control={control}
                      getOptionLabel={(option: any) => option.title}
                      getOptionValue={(option: any) => option.name}
                      options={paymentGateway ?? []}
                      // disabled={isNotDefaultSettingsPage}
                    />
                  </div>
                  {isStripeActive && (
                    <>
                      <div className="mb-5">
                        <div className="flex items-center gap-x-4">
                          <SwitchInput
                            name="StripeCardOnly"
                            control={control}
                            // disabled={isNotDefaultSettingsPage}
                          />
                          <Label className="!mb-0">
                            {t('Enable Stripe Element')}
                          </Label>
                        </div>
                      </div>
                    </>
                  )}
                  <Label>{t('text-webhook-url')}</Label>
                  <div className="relative flex flex-col overflow-hidden rounded-md border border-solid border-[#D1D5DB]">
                    {paymentGateway?.map((gateway: any, index: any) => {
                      return <WebHookURL gateway={gateway} key={index} />;
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            ''
          )}
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title="Currency Options"
          details={t('form:currency-options-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{`${t('form:input-label-currency-formations')} *`}</Label>
            <SelectInput
              {...register('currencyOptions.formation')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={COUNTRY_LOCALE}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>

          <Input
            label={`${t('form:input-label-currency-number-of-decimal')} *`}
            {...register('currencyOptions.fractions')}
            type="number"
            variant="outline"
            placeholder={t('form:input-placeholder-currency-number-of-decimal')}
            error={t(errors.currencyOptions?.fractions?.message!)}
            className="mb-5"
          />
          {formation && (
            <div className="mb-5">
              <Label>
                {`Sample Output: `}
                <Badge
                  text={formatPrice({
                    amount: 987456321.123456789,
                    currencyCode: currentCurrency?.code! ?? settings?.currency,
                    // @ts-ignore
                    locale: formation?.code! as string,
                    fractions: currentFractions,
                  })}
                  color="bg-accent"
                />
              </Label>
            </div>
          )}
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title="SEO"
          details={t('form:tax-form-seo-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-meta-title')}
            {...register('seo.metaTitle')}
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
              label={t('form:input-label-meta-description')}
              {...register('seo.metaDescription')}
              variant="outline"
              className="mb-5"
            />
          </div>
          <Input
            label={t('form:input-label-meta-tags')}
            {...register('seo.metaTags')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-canonical-url')}
            {...register('seo.canonicalUrl')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-og-title')}
            {...register('seo.ogTitle')}
            variant="outline"
            className="mb-5"
          />
          <div className="relative">
            {options?.settings?.options?.useAi && (
              <OpenAIButton
                title="Generate Description With AI"
                onClick={handleGenerateDescription1}
              />
            )}
            <TextArea
              label={t('form:input-label-og-description')}
              {...register('seo.ogDescription')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <Label>{t('form:input-label-og-image')}</Label>
            <FileInput name="seo.ogImage" control={control} multiple={false} />
          </div>
          <Input
            label={t('form:input-label-twitter-handle')}
            {...register('seo.twitterHandle')}
            variant="outline"
            className="mb-5"
            placeholder="your twitter username (exp: @username)"
          />
          <Input
            label={t('form:input-label-twitter-card-type')}
            {...register('seo.twitterCardType')}
            variant="outline"
            className="mb-5"
            placeholder="one of summary, summary_large_image, app, or player"
          />
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:title-sms-event-settings')}
          details={t('form:description-sms-event-settings')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-sms-options')}</Label>
            <SelectInput
              name="smsEvent"
              control={control}
              getOptionLabel={(option: any) => {
                let optionUser = split(option.value, '-');
                switch (optionUser[0].toLowerCase()) {
                  case 'customer':
                    return `Customer: ${option.label}`;
                  case 'vendor':
                    return `Owner: ${option.label}`;
                  default:
                    return `Admin: ${option.label}`;
                }
              }}
              isCloseMenuOnSelect={false}
              options={SMS_GROUP_OPTION}
              isMulti
              // disabled={isNotDefaultSettingsPage}
            />
            <ValidationError message={t(errors.currency?.message)} />
          </div>
        </Card>
      </div>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:title-email-event-settings')}
          details={t('form:description-email-event-settings')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-email-options')}</Label>
            <SelectInput
              name="emailEvent"
              control={control}
              getOptionLabel={(option: any) => {
                let optionUser = split(option.value, '-');
                switch (optionUser[0].toLowerCase()) {
                  case 'customer':
                    return `Customer: ${option.label}`;
                  case 'vendor':
                    return `Owner: ${option.label}`;
                  default:
                    return `Admin: ${option.label}`;
                }
              }}
              isCloseMenuOnSelect={false}
              options={EMAIL_GROUP_OPTION}
              isMulti
              // disabled={isNotDefaultSettingsPage}
            />
            <ValidationError message={t(errors.currency?.message)} />
          </div>
        </Card>
      </div>

      <div className="my-5 flex flex-wrap sm:my-8">
        <Description
          title={t('form:text-delivery-schedule')}
          details={t('form:delivery-schedule-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div>
            {fields.map((item: any & { id: string }, index: number) => (
              <div
                className="border-b border-dashed border-border-200 py-5 first:pt-0 last:border-0 md:py-8"
                key={item.id}
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                  <div className="grid grid-cols-1 gap-5 sm:col-span-4">
                    <Input
                      label={t('form:input-delivery-time-title')}
                      variant="outline"
                      // @ts-ignore
                      {...register(`deliveryTime.${index}.title` as const)}
                      defaultValue={item?.title!} // make sure to set up defaultValue
                      // @ts-ignore
                      error={t(errors.deliveryTime?.[index]?.title?.message)}
                    />
                    <TextArea
                      label={t('form:input-delivery-time-description')}
                      variant="outline"
                      {...register(
                        // @ts-ignore
                        `deliveryTime.${index}.description` as const,
                      )}
                      defaultValue={item.description!} // make sure to set up defaultValue
                    />
                  </div>
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
            ))}
          </div>
          <Button
            type="button"
            // @ts-ignore
            onClick={() => append({ title: '', description: '' })}
            className="w-full sm:w-auto"
          >
            {t('form:button-label-add-delivery-time')}
          </Button>

          {/*@ts-ignore*/}
          {errors?.deliveryTime?.message ? (
            <Alert
              // @ts-ignore
              message={t(errors?.deliveryTime?.message)}
              variant="error"
              className="mt-5"
            />
          ) : null}
        </Card>
      </div>

      <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
        <Description
          title={t('form:shop-settings')}
          details={t('form:shop-settings-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-autocomplete')}</Label>
            <Controller
              control={control}
              name="contactDetails.location"
              render={({ field: { onChange } }) => (
                <GooglePlacesAutocomplete
                  onChange={onChange}
                  data={getValues('contactDetails.location')!}
                  // disabled={isNotDefaultSettingsPage}
                />
              )}
            />
          </div>
          <Input
            label={t('form:input-label-contact')}
            {...register('contactDetails.contact')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.contact?.message!)}
            // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('form:input-label-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.website?.message!)}
            // disabled={isNotDefaultSettingsPage}
          />
          <div className="mt-6">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="useGoogleMap"
                control={control}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-use-google-map-service')}
              </Label>
            </div>
          </div>

          <Input
            label={`${t('Maximum Search Location Distance(km)')}`}
            {...register('maxShopDistance')}
            type="number"
            error={t(errors.maxShopDistance?.message!)}
            variant="outline"
            className="my-5"
            // disabled={isNotDefaultSettingsPage}
          />

          <div className="mt-6">
            <div className="flex items-center gap-x-4">
              <SwitchInput
                name="isProductReview"
                control={control}
                // disabled={isNotDefaultSettingsPage}
              />
              <Label className="mb-0">
                {t('form:input-label-product-for-review')}
              </Label>
            </div>
          </div>

          {/* Social and Icon picker */}
          <div>
            {socialFields.map(
              (item: ShopSocialInput & { id: string }, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 py-5 first:mt-5 first:border-t last:border-b-0 md:py-8 md:first:mt-10"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <Label className="whitespace-nowrap">
                        {t('form:input-label-select-platform')}
                      </Label>
                      <SelectInput
                        name={`contactDetails.socials.${index}.icon` as const}
                        control={control}
                        options={updatedIcons}
                        isClearable={true}
                        defaultValue={item?.icon!}
                        // disabled={isNotDefaultSettingsPage}
                      />
                    </div>
                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-social-url')}
                      variant="outline"
                      {...register(
                        `contactDetails.socials.${index}.url` as const,
                      )}
                      defaultValue={item.url!} // make sure to set up defaultValue
                      // disabled={isNotDefaultSettingsPage}
                    />
                    {/* {!isNotDefaultSettingsPage && ( */}
                    <button
                      onClick={() => {
                        socialRemove(index);
                      }}
                      type="button"
                      className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                      // disabled={isNotDefaultSettingsPage}
                    >
                      {t('form:button-label-remove')}
                    </button>
                    {/* )} */}
                  </div>
                </div>
              ),
            )}
          </div>
          {/* {!isNotDefaultSettingsPage && ( */}
          <Button
            type="button"
            onClick={() => socialAppend({ icon: '', url: '' })}
            className="w-full sm:w-auto"
            // disabled={isNotDefaultSettingsPage}
          >
            {t('form:button-label-add-social')}
          </Button>
          {/* )} */}
        </Card>
      </div>

      <div className="mb-4 text-end">
        <Button loading={loading} disabled={loading}>
          {t('form:button-label-save-settings')}
        </Button>
      </div>
    </form>
  );
}
