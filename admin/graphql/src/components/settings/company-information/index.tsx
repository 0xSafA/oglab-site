import Card from '@/components/common/card';
import { SaveIcon } from '@/components/icons/save';
import * as socialIcons from '@/components/icons/social';
import { companyValidationSchema } from '@/components/settings/company-information/company-validation-schema';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import GooglePlacesAutocomplete from '@/components/ui/form/google-places-autocomplete';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import SelectInput from '@/components/ui/select-input';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import { useSettings } from '@/contexts/settings.context';
import { useUpdateSettingsMutation } from '@/graphql/settings.graphql';
import { socialIcon } from '@/settings/site.settings';
import { getIcon } from '@/utils/get-icon';
import { prepareSettingsInputData } from '@/utils/prepare-settings-input';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ContactDetailsInput,
  Settings,
  ShopSocialInput,
  UserAddress,
} from '__generated__/__types__';
import omit from 'lodash/omit';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { formatAddress } from '@/utils/format-address';
import TextArea from '@/components/ui/text-area';
import PhoneNumberInput from '@/components/ui/phone-input';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';

type CompanyInformationFormValues = {
  siteLink: string;
  copyrightText: string;
  externalText: string;
  externalLink: string;
  contactDetails: ContactDetailsInput;
  google: {
    isEnable: boolean;
    tagManagerId: string;
  };
  facebook: {
    isEnable: boolean;
    appId: string;
    pageId: string;
  };
};

type IProps = {
  settings?: Settings | null;
};

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex h-4 w-4 items-center justify-center">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

export default function CompanyInfoForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  const [updateSettingsMutation, { loading }] = useUpdateSettingsMutation();
  const { options: settingOptions } = settings ?? {};
  const isGoogleMapActive = settingOptions?.useGoogleMap!;
  const { updateSettings } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CompanyInformationFormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(companyValidationSchema),
    // @ts-ignore
    defaultValues: {
      ...settingOptions,
      contactDetails: {
        ...settingOptions?.contactDetails,
        socials: settingOptions?.contactDetails?.socials
          ? settingOptions?.contactDetails?.socials.map((social: any) => ({
              icon: updatedIcons?.find((icon) => icon?.value === social?.icon),
              url: social?.url,
            }))
          : [],
      },
    },
  });

  const {
    fields: socialFields,
    append: socialAppend,
    remove: socialRemove,
  } = useFieldArray({
    control,
    name: 'contactDetails.socials',
  });

  async function onSubmit(values: CompanyInformationFormValues) {
    const contactDetails = {
      ...values?.contactDetails,
      location: isGoogleMapActive
        ? { ...omit(values?.contactDetails?.location, '__typename') }
        : {
            ...values?.contactDetails?.location,
            formattedAddress: formatAddress(
              values?.contactDetails?.location as UserAddress,
            ),
          },
      socials: values?.contactDetails?.socials
        ? values?.contactDetails?.socials?.map((social: any) => ({
            icon: social?.icon?.value,
            url: social?.url,
          }))
        : [],
    };
    const inputValues = {
      ...settingOptions,
      ...values,
      contactDetails,
    };

    const settingsOptionsInput: any = prepareSettingsInputData(inputValues);

    const updatedData = await updateSettingsMutation({
      variables: {
        input: {
          language: locale!,
          options: settingsOptionsInput,
        },
      },
    });

    if (updatedData) {
      updateSettings(updatedData?.data?.updateSettings?.options!);
      toast.success(t('common:successfully-updated'));
    }
    reset(values, { keepValues: true });
  }
  const isDirty = Object.keys(dirtyFields).length > 0;
  useConfirmRedirectIfDirty({ isDirty });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8 sm:mt-8 sm:mb-3">
        <Description
          title={t('form:footer-address')}
          details={t('form:footer-address-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {isGoogleMapActive ? (
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
          ) : (
            <div className="mb-5 grid grid-cols-2 gap-4">
              <Input
                label={t('text-city')}
                toolTipText={t('form:input-tooltip-company-city')}
                {...register('contactDetails.location.city')}
                error={t(errors.contactDetails?.location?.city!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-country')}
                toolTipText={t('form:input-tooltip-company-country')}
                {...register('contactDetails.location.country')}
                error={t(errors.contactDetails?.location?.country!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-state')}
                {...register('contactDetails.location.state')}
                toolTipText={t('form:input-tooltip-company-state')}
                error={t(errors.contactDetails?.location?.state!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
              />
              <Input
                label={t('text-zip')}
                {...register('contactDetails.location.zip')}
                toolTipText={t('form:input-tooltip-company-zip')}
                error={t(errors.contactDetails?.location?.zip!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
              />
              <TextArea
                label={t('text-street-address')}
                toolTipText={t('form:input-tooltip-company-street-address')}
                {...register('contactDetails.location.street_address')}
                error={t(errors.contactDetails?.location?.street_address!)}
                variant="outline"
                // disabled={isNotDefaultSettingsPage}
                className="col-span-full"
              />
            </div>
          )}
          <PhoneNumberInput
            label={t('form:input-label-contact')}
            toolTipText={t('form:input-tooltip-company-contact-number')}
            {...register('contactDetails.contact')}
            control={control}
            error={t(errors.contactDetails?.contact?.message!)}
            // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('form:input-label-website')}
            toolTipText={t('form:input-tooltip-company-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.website?.message!)}
            // disabled={isNotDefaultSettingsPage}
          />
          <Input
            label={t('form:input-label-email')}
            toolTipText={t('form:input-tooltip-company-email')}
            {...register('contactDetails.emailAddress')}
            variant="outline"
            className="mb-5"
            error={t(errors.contactDetails?.emailAddress?.message!)}
            // disabled={isNotDefaultSettingsPage}
          />
          {/* Social and Icon picker */}
          <div>
            {socialFields?.map(
              (item: ShopSocialInput & { id: string }, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 py-5 first:mt-5 first:border-t last:border-b-0 md:py-8 md:first:mt-10"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <SelectInput
                        name={`contactDetails.socials.${index}.icon` as const}
                        control={control}
                        options={updatedIcons}
                        isClearable={true}
                        defaultValue={item?.icon!}
                        label={t('form:input-label-select-platform')}
                        toolTipText={t(
                          'form:input-tooltip-company-social-platform',
                        )}
                        // disabled={isNotDefaultSettingsPage}
                      />
                    </div>
                    <Input
                      className="sm:col-span-2"
                      label={t('form:input-label-social-url')}
                      toolTipText={t('form:input-tooltip-company-profile-url')}
                      variant="outline"
                      {...register(
                        `contactDetails.socials.${index}.url` as const,
                      )}
                      defaultValue={item.url!} // make sure to set up defaultValue
                      // disabled={isNotDefaultSettingsPage}
                      error={t(
                        errors?.contactDetails?.socials?.[index]?.url?.message!,
                      )}
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
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8">
        <Description
          title={t('form:form-title-footer-information')}
          details={t('form:site-info-footer-description')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-site-link')}
            toolTipText={t('form:input-tooltip-company-site-link')}
            {...register('siteLink')}
            error={t(errors?.siteLink?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-copyright-text')}
            toolTipText={t('form:input-tooltip-company-copyright-text')}
            {...register('copyrightText')}
            error={t(errors?.copyrightText?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-external-text')}
            toolTipText={t('form:input-tooltip-company-external-text')}
            {...register('externalText')}
            error={t(errors?.externalText?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-external-link')}
            toolTipText={t('form:input-tooltip-company-external-link')}
            {...register('externalLink')}
            error={t(errors?.externalLink?.message!)}
            variant="outline"
            className="mb-5"
          />
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
