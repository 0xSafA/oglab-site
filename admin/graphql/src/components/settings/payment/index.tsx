import Card from '@/components/common/card';
import { SaveIcon } from '@/components/icons/save';
import { COUNTRY_LOCALE } from '@/components/settings/payment/country-locale';
import { CURRENCY } from '@/components/settings/payment/currency';
import { PAYMENT_GATEWAY } from '@/components/settings/payment/payment-gateway';
import { paymentValidationSchema } from '@/components/settings/payment/payment-validation-schema';
import WebHookURL from '@/components/settings/payment/webhook-url';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import ValidationError from '@/components/ui/form-validation-error';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Loader from '@/components/ui/loader/loader';
import PaymentSelect from '@/components/ui/payment-select';
import SelectInput from '@/components/ui/select-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
// import { Config } from '@/config';
import { useSettings } from '@/contexts/settings.context';
import { useUpdateSettingsMutation } from '@/graphql/settings.graphql';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { prepareSettingsInputData } from '@/utils/prepare-settings-input';
import { formatPrice } from '@/utils/use-price';
import { yupResolver } from '@hookform/resolvers/yup';
import { Settings } from '__generated__/__types__';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type PaymentFormValues = {
  currency: any;
  currencyOptions?: any;
  useCashOnDelivery: boolean;
  defaultPaymentGateway: paymentGatewayOption;
  useEnableGateway: boolean;
  paymentGateway: paymentGatewayOption[];
};

type paymentGatewayOption = {
  name: string;
  title: string;
};

type IProps = {
  settings?: Settings | null;
};

export default function PaymentSettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [updateSettingsMutation, { loading }] = useUpdateSettingsMutation();
  const { options: settingOptions } = settings ?? {};
  const { updateSettings } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PaymentFormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(paymentValidationSchema),
    // @ts-ignore
    defaultValues: {
      ...settingOptions,
      useEnableGateway: settingOptions?.useEnableGateway! ?? true,
      currency: settingOptions?.currency
        ? CURRENCY.find((item) => item.code == settingOptions?.currency)
        : '',
      defaultPaymentGateway: settingOptions?.defaultPaymentGateway
        ? PAYMENT_GATEWAY.find(
            (item) => item.name == settingOptions?.defaultPaymentGateway,
          )
        : PAYMENT_GATEWAY[0],
      currencyOptions: {
        ...settingOptions?.currencyOptions,
        formation: settingOptions?.currencyOptions?.formation
          ? COUNTRY_LOCALE.find(
              (item) => item.code == settingOptions?.currencyOptions?.formation,
            )
          : COUNTRY_LOCALE[0],
      },
      // multi-select on payment gateway
      paymentGateway: settingOptions?.paymentGateway
        ? settingOptions?.paymentGateway?.map((gateway: any) => ({
            name: gateway?.name,
            title: gateway?.title,
          }))
        : [],
    },
  });

  const currentCurrency = watch('currency');
  const formation = watch('currencyOptions.formation');
  const currentFractions = watch('currencyOptions.fractions') as number;
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  async function onSubmit(values: PaymentFormValues) {
    const inputValues = {
      ...settingOptions,
      currency: values.currency?.code,
      defaultPaymentGateway: values.defaultPaymentGateway?.name,
      paymentGateway:
        values?.paymentGateway && values?.paymentGateway!.length
          ? values?.paymentGateway?.map((gateway: any) => ({
              name: gateway.name,
              title: gateway.title,
            }))
          : PAYMENT_GATEWAY.filter((value: any, index: number) => index < 2),
      useEnableGateway: values?.useEnableGateway,
      //@ts-ignore
      currencyOptions: {
        ...values.currencyOptions,
        formation: values?.currencyOptions?.formation?.code! as string,
      },
    };

    const settingsOptionsInput: any = prepareSettingsInputData(inputValues);

    const updatedData = await updateSettingsMutation({
      variables: {
        input: {
          language: locale!,
          // @ts-ignore
          options: settingsOptionsInput,
        },
      },
    });

    if (updatedData) {
      updateSettings(updatedData?.data?.updateSettings?.options);
      toast.success(t('common:successfully-updated'));
    }
    reset(values, { keepValues: true });
  }
  useConfirmRedirectIfDirty({ isDirty });
  let paymentGateway = watch('paymentGateway');
  let defaultPaymentGateway = watch('defaultPaymentGateway');
  let useEnableGateway = watch('useEnableGateway');
  let checkAvailableDefaultGateway = paymentGateway?.some(
    (item: any) => item?.name === defaultPaymentGateway?.name,
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
        <Description
          title={t('form:form-title-payment')}
          details={t('form:payment-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <SwitchInput
              name="useCashOnDelivery"
              control={control}
              label={t('form:input-label-cash-on-delivery')}
              toolTipText={t('form:input-tooltip-enable-cash-on-delivery')}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>
          <div className="mb-5">
            <SelectInput
              name="currency"
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={CURRENCY}
              label={t('form:input-label-currency')}
              toolTipText={t('form:input-tooltip-currency')}
              // disabled={isNotDefaultSettingsPage}
            />
            <ValidationError message={t(errors.currency?.message)} />
          </div>

          <SwitchInput
            control={control}
            // disabled={isNotDefaultSettingsPage}
            {...register('useEnableGateway')}
            label={t('text-enable-gateway')}
            toolTipText={t('form:input-tooltip-enable-gateway')}
          />

          {useEnableGateway ? (
            <>
              <div className="mt-5 mb-5">
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
                    text="form:text-payment-method-preparing"
                    className="mx-auto !h-20"
                  />
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <SelectInput
                      name="defaultPaymentGateway"
                      control={control}
                      getOptionLabel={(option: any) => option.title}
                      getOptionValue={(option: any) => option.name}
                      options={paymentGateway ?? []}
                      label={t('text-select-default-payment-gateway')}
                      // disabled={isNotDefaultSettingsPage}
                    />
                  </div>
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
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:mt-8 sm:mb-3">
        <Description
          title={t('text-currency-options')}
          details={t('form:currency-options-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <SelectInput
              {...register('currencyOptions.formation')}
              control={control}
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.code}
              options={COUNTRY_LOCALE}
              required
              label={t('form:input-label-currency-formations')}
              toolTipText={t('form:input-tooltip-currency-formation')}
              // disabled={isNotDefaultSettingsPage}
            />
          </div>
          <Input
            label={t('form:input-label-currency-number-of-decimal')}
            required
            toolTipText={t('form:input-tooltip-fractional-digits')}
            {...register('currencyOptions.fractions')}
            type="number"
            variant="outline"
            placeholder={t('form:input-placeholder-currency-number-of-decimal')}
            // @ts-ignore
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
                    currencyCode:
                      currentCurrency?.code ?? settings?.options?.currency!,
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

      <StickyFooterPanel className="z-0">
        <Button
          loading={loading}
          disabled={loading || !Boolean(isDirty)}
          className="text-sm md:text-base"
        >
          <SaveIcon className="relative top-px h-6 w-6 shrink-0 ltr:mr-2 rtl:pl-2" />
          {t('form:button-label-save-settings')}
        </Button>
      </StickyFooterPanel>
    </form>
  );
}
