import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import GooglePlacesAutocomplete from '@/components/ui/form/google-places-autocomplete';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import TextArea from '@/components/ui/text-area';
import {
  useCreateShopMutation,
  useUpdateShopMutation,
} from '@/graphql/shops.graphql';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { getFormattedImage } from '@/utils/get-formatted-image';
import { yupResolver } from '@hookform/resolvers/yup';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { shopValidationSchema } from './shop-validation-schema';
//@ts-ignore
import OpenAIButton from '@/components/openAI/openAI.button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import SlugEditButton from '@/components/ui/slug-edit-button';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import SwitchInput from '@/components/ui/switch-input';
import { Config } from '@/config';
import { Routes } from '@/config/routes';
import { useSettingsQuery } from '@/graphql/settings.graphql';
import { ItemProps } from '@/types/custom-types';
import { STORE_OWNER, SUPER_ADMIN } from '@/utils/constants';
import { updatedIcons } from '@/utils/update-social-icons';
import { formatSlug } from '@/utils/use-slug';
import {
  Attachment,
  AttachmentInput,
  PaymentInfoInput,
  Shop,
  ShopMaintenanceInput,
  ShopSettings,
  ShopSocialInput,
  UserAddressInput,
} from '__generated__/__types__';
import { useCallback, useMemo, useState } from 'react';
import PhoneNumberInput from '@/components/ui/phone-input';
import DatePicker from '@/components/ui/date-picker';
import { addDays, addMinutes, isSameDay, isToday } from 'date-fns';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Create a compelling description of ${name}, highlighting the unique products or services you offer.`,
    },
    {
      id: 2,
      title: `Craft an enticing ${name} shop description that captures the essence of your brand and its mission.`,
    },
    {
      id: 3,
      title: `Develop a concise and engaging overview of ${name}, showcasing its distinct offerings and benefits.`,
    },
    {
      id: 4,
      title: `Write a captivating shop description that intrigues customers and makes them eager to explore your products.`,
    },
    {
      id: 5,
      title: `Design a compelling narrative that tells the story of ${name}, connecting with customers on a personal level.`,
    },
    {
      id: 6,
      title: `Construct a persuasive shop description that emphasizes the value and quality customers can expect from your offerings.`,
    },
    {
      id: 7,
      title: `Shape a concise and memorable shop description that sets you apart from competitors and resonates with your target audience.`,
    },
    {
      id: 8,
      title: `Build an alluring shop description that conveys the unique experience customers will have when shopping with you.`,
    },
    {
      id: 9,
      title: `Create a description that showcases the passion, expertise, and attention to detail that define ${name} and its products.`,
    },
    {
      id: 10,
      title: `Craft an enticing shop overview that invites customers to embark on a journey of discovery through your carefully curated selection.`,
    },
  ];
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  cover_image: any;
  logo: any;
  balance: {
    id?: string;
    payment_info?: PaymentInfoInput;
  };
  settings: ShopSettings;
  address: UserAddressInput;
  isShopUnderMaintenance: boolean;
  shopMaintenance: ShopMaintenanceInput;
};

const ShopForm = ({ initialValues }: { initialValues?: Shop }) => {
  const router = useRouter();
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const isSlugEditable =
    (router?.query?.action === 'edit' || router?.pathname === '/[shop]/edit') &&
    router?.locale === Config.defaultLanguage;
  const { permissions } = getAuthCredentials();
  const [createShop, { loading: creating }] = useCreateShopMutation({
    onCompleted: () => {
      const { permissions } = getAuthCredentials();
      if (hasAccess(adminOnly, permissions)) {
        return router.push(Routes.adminMyShops);
      }
      router.push(Routes.dashboard);
    },
  });
  const [updateShop, { loading: updating }] = useUpdateShopMutation({
    onCompleted: async ({ updateShop }) => {
      if (initialValues?.slug !== updateShop?.slug) {
        await router.push(`/${updateShop?.slug}/edit`, undefined, {
          locale: Config.defaultLanguage,
        });
      }

      toast.success(t('common:successfully-updated'));
    },
    // onCompleted: () => {
    //   toast.success(t('common:successfully-updated'));
    // },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
    control,
  } = useForm<FormValues>({
    shouldUnregister: true,
    ...(initialValues
      ? {
          defaultValues: {
            ...initialValues,
            logo: getFormattedImage(initialValues?.logo as Attachment),
            cover_image: getFormattedImage(
              initialValues?.cover_image as Attachment,
            ),
            settings: {
              ...initialValues?.settings,
              socials: initialValues?.settings?.socials
                ? initialValues?.settings?.socials.map((social: any) => ({
                    icon: updatedIcons?.find(
                      (icon) => icon?.value === social?.icon,
                    ),
                    url: social?.url,
                  }))
                : [],
              shopMaintenance: {
                ...initialValues?.settings?.shopMaintenance,
                image: getFormattedImage(
                  initialValues?.settings?.shopMaintenance?.image as Attachment,
                ),
              },
            },
          },
        }
      : {}),
    //@ts-ignore
    resolver: yupResolver(shopValidationSchema),
  });

  const slugAutoSuggest = formatSlug(watch('name'));
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const { locale } = router;
  const startDate = useWatch({
    name: 'settings.shopMaintenance.start',
    control,
  });
  const untilDate = useWatch({
    name: 'settings.shopMaintenance.until',
    control,
  });

  const isMaintenanceMode = watch('settings.isShopUnderMaintenance');

  const today = new Date();
  const { data: options } = useSettingsQuery({
    variables: {
      language: locale,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'settings.socials',
  });

  function onSubmit(values: FormValues) {
    const settings = {
      ...values?.settings,
      location: { ...omit(values?.settings?.location, '__typename') },
      socials: values?.settings?.socials
        ? values?.settings?.socials?.map((social: any) => ({
            icon: social?.icon?.value,
            url: social?.url,
          }))
        : [],
      shopMaintenance: {
        ...values?.settings?.shopMaintenance,
        image: getFormattedImage(
          values?.settings?.shopMaintenance?.image as Attachment,
        ),
      },
    };
    if (initialValues) {
      // const { __typename, ...restAddress } = values.address;
      // const { __typename: newTypename, ...location } =
      //   values?.settings?.location;

      updateShop({
        variables: {
          input: {
            id: initialValues.id,
            ...values,
            slug: formatSlug(values.slug),
            address: { ...omit(values.address, '__typename') },
            settings,
            balance: {
              id: initialValues.balance?.id,
              ...values.balance,
            },
          },
        },
      });
    } else {
      createShop({
        variables: {
          input: {
            ...values,
            settings,
            balance: {
              ...values.balance,
            },
          },
        },
      });
    }
  }

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

  const isGoogleMapActive = options?.settings?.options?.useGoogleMap;

  const coverImageInformation = (
    <span>
      {t('form:shop-cover-image-help-text')} <br />
      {t('form:cover-image-dimension-help-text')} &nbsp;
      <span className="font-bold">1170 x 435{t('common:text-px')}</span>
    </span>
  );

  let sameDay = useMemo(() => {
    return isSameDay(
      new Date(untilDate as string),
      new Date(startDate as string),
    );
  }, [untilDate, startDate]);

  const filterUntilTime = (date: Date) => {
    if (sameDay) {
      const isPastTime =
        addMinutes(new Date(startDate as string), 15).getTime() >
        date.getTime();
      return !isPastTime;
    }

    return true;
  };

  const filterStartTime = (date: Date) => {
    let today = isToday(new Date(startDate as string));
    if (today) {
      const isPastTime =
        new Date(startDate as string).getTime() > date.getTime();
      return !isPastTime;
    }

    return true;
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
          <Description
            title={t('form:input-label-logo')}
            details={t('form:shop-logo-help-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <FileInput name="logo" control={control} multiple={false} />
          </Card>
        </div>

        <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
          <Description
            title={t('form:shop-cover-image-title')}
            details={coverImageInformation}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <FileInput name="cover_image" control={control} multiple={false} />
          </Card>
        </div>
        <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
          <Description
            title={t('form:shop-basic-info')}
            details={t('form:shop-basic-info-help-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-name')}
              {...register('name')}
              variant="outline"
              className="mb-5"
              error={t(errors.name?.message!)}
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
                error={t(errors.description?.message!)}
              />
            </div>
          </Card>
        </div>
        <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
          <Description
            title={t('form:shop-payment-info')}
            details={t('form:payment-info-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <Input
              label={t('form:input-label-account-holder-name')}
              {...register('balance.payment_info.name')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.name?.message!)}
              required
            />
            <Input
              label={t('form:input-label-account-holder-email')}
              {...register('balance.payment_info.email')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.email?.message!)}
              required
            />
            <Input
              label={t('form:input-label-bank-name')}
              {...register('balance.payment_info.bank')}
              variant="outline"
              className="mb-5"
              error={t(errors.balance?.payment_info?.bank?.message!)}
              required
            />
            <Input
              label={t('form:input-label-account-number')}
              {...register('balance.payment_info.account')}
              variant="outline"
              error={t(errors.balance?.payment_info?.account?.message!)}
              required
            />
          </Card>
        </div>
        <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
          <Description
            title={t('form:shop-address')}
            details={t('form:shop-address-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            {isGoogleMapActive && (
              <div className="mb-5">
                <Label>{t('form:input-label-autocomplete')}</Label>
                <Controller
                  control={control}
                  name="settings.location"
                  render={({ field: { onChange } }) => (
                    <GooglePlacesAutocomplete
                      // @ts-ignore
                      onChange={(location: any) => {
                        onChange(location);
                        setValue('address.country', location?.country);
                        setValue('address.city', location?.city);
                        setValue('address.state', location?.state);
                        setValue('address.zip', location?.zip);
                        setValue(
                          'address.street_address',
                          location?.street_address,
                        );
                      }}
                      data={getValues('settings.location')!}
                      onChangeCurrentLocation={onChange}
                    />
                  )}
                />
              </div>
            )}
            <Input
              label={t('form:input-label-country')}
              {...register('address.country')}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.country?.message!)}
            />
            <Input
              label={t('form:input-label-city')}
              {...register('address.city')}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.city?.message!)}
            />
            <Input
              label={t('form:input-label-state')}
              {...register('address.state')}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.state?.message!)}
            />
            <Input
              label={t('form:input-label-zip')}
              {...register('address.zip')}
              variant="outline"
              className="mb-5"
              error={t(errors.address?.zip?.message!)}
            />
            <TextArea
              label={t('form:input-label-street-address')}
              {...register('address.street_address')}
              variant="outline"
              error={t(errors.address?.street_address?.message!)}
            />
          </Card>
        </div>
        {permissions?.includes(STORE_OWNER) ? (
          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:form-notification-title')}
              details={t('form:form-notification-description')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="mb-5 w-full sm:w-8/12 md:w-2/3">
              <Input
                label={t('form:input-notification-email')}
                {...register('settings.notifications.email')}
                variant="outline"
                className="mb-5"
                disabled={permissions?.includes(SUPER_ADMIN)}
                type="email"
              />
              <div className="flex items-center gap-x-4">
                <SwitchInput
                  name="settings.notifications.enable"
                  control={control}
                  disabled={permissions?.includes(SUPER_ADMIN)}
                />
                <Label className="mb-0">
                  {t('form:input-enable-notification')}
                </Label>
              </div>
            </Card>
          </div>
        ) : (
          ''
        )}
        <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
          <Description
            title={t('form:shop-settings')}
            details={t('form:shop-settings-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <PhoneNumberInput
              label={t('form:input-label-contact')}
              required
              {...register('settings.contact')}
              control={control}
              error={t(errors.settings?.contact?.message!)}
            />
            <Input
              label={t('form:input-label-website')}
              {...register('settings.website')}
              variant="outline"
              className="mb-5"
              error={t(errors.settings?.website?.message!)}
              required
            />
          </Card>
        </div>

        <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
          <Description
            title={t('form:social-settings')}
            details={t('form:social-settings-helper-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />

          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div>
              {fields?.map(
                (item: ShopSocialInput & { id: string }, index: number) => (
                  <div
                    className="border-b border-dashed border-border-200 py-5 first:mt-0 first:border-t-0 first:pt-0 last:border-b-0 md:py-8 md:first:mt-0"
                    key={item.id}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                      <div className="sm:col-span-2">
                        <Label>{t('form:input-label-select-platform')}</Label>
                        <SelectInput
                          name={`settings.socials.${index}.icon` as const}
                          control={control}
                          options={updatedIcons}
                          isClearable={true}
                          defaultValue={item?.icon!}
                        />
                      </div>
                      {/* <Input
                        className="sm:col-span-2"
                        label={t("form:input-label-icon")}
                        variant="outline"
                        {...register(`settings.socials.${index}.icon` as const)}
                        defaultValue={item?.icon!} // make sure to set up defaultValue
                      /> */}
                      <Input
                        className="sm:col-span-2"
                        label={t('form:input-label-url')}
                        variant="outline"
                        {...register(`settings.socials.${index}.url` as const)}
                        defaultValue={item.url!} // make sure to set up defaultValue
                        error={t(
                          errors?.settings?.socials?.[index]?.url?.message!,
                        )}
                        required
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

        {!permissions?.includes(SUPER_ADMIN) ? (
          <div className="flex flex-wrap pb-8 my-5 border-b border-gray-300 border-dashed sm:my-8">
            <Description
              title="Shop maintenance settings "
              details="Control all the maintenance settings related to this shop."
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <div className="my-5">
                <SwitchInput
                  name="settings.isShopUnderMaintenance"
                  label={t('form:input-label-enable-maintenance-mode')}
                  toolTipText={t('form:input-tooltip-enable-maintenance-mode')}
                  control={control}
                />
              </div>

              <div className="my-5 mt-10">
                <FileInput
                  name="settings.shopMaintenance.image"
                  control={control}
                  multiple={false}
                  disabled={!isMaintenanceMode}
                />
              </div>

              <div className="my-5 mt-10">
                <Input
                  label={t('form:input-label-title')}
                  toolTipText={t('form:input-tooltip-maintenance-title')}
                  {...register('settings.shopMaintenance.title')}
                  error={t(errors?.settings?.shopMaintenance?.title?.message!)}
                  variant="outline"
                  className="mb-5"
                  {...(isMaintenanceMode && {
                    required: true,
                  })}
                  disabled={!isMaintenanceMode}
                />
                <TextArea
                  label={t('form:input-label-description')}
                  toolTipText={t('form:input-tooltip-maintenance-description')}
                  {...register('settings.shopMaintenance.description')}
                  error={t(
                    errors?.settings?.shopMaintenance?.description?.message!,
                  )}
                  variant="outline"
                  className="mb-5"
                  {...(isMaintenanceMode && {
                    required: true,
                  })}
                  disabled={!isMaintenanceMode}
                />
                <div className="mb-5">
                  <DatePicker
                    control={control}
                    name="settings.shopMaintenance.start"
                    minDate={today}
                    startDate={new Date(startDate as string)}
                    locale={locale}
                    placeholder="Start Date"
                    disabled={!isMaintenanceMode}
                    label={t('form:maintenance-start-time')}
                    toolTipText={t('form:input-tooltip-maintenance-start-time')}
                    {...(isMaintenanceMode && {
                      required: true,
                    })}
                    error={t(
                      errors?.settings?.shopMaintenance?.start?.message!,
                    )}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    filterTime={filterStartTime}
                  />
                </div>
                <div className="w-full">
                  <DatePicker
                    control={control}
                    name="settings.shopMaintenance.until"
                    disabled={!startDate || !isMaintenanceMode}
                    minDate={new Date(startDate as string)}
                    placeholder="End Date"
                    locale={locale}
                    {...(isMaintenanceMode && {
                      required: true,
                    })}
                    toolTipText={t('form:input-tooltip-maintenance-end-time')}
                    label={t('form:maintenance-end-date')}
                    error={t(
                      errors?.settings?.shopMaintenance?.until?.message!,
                    )}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    filterTime={filterUntilTime}
                  />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          ''
        )}

        <StickyFooterPanel>
          <div className="text-end">
            <Button
              loading={creating || updating}
              disabled={creating || updating}
            >
              {initialValues
                ? t('form:button-label-update')
                : t('form:button-label-save')}
            </Button>
          </div>
        </StickyFooterPanel>
      </form>
    </>
  );
};

export default ShopForm;
