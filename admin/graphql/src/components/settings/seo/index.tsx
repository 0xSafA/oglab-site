import Card from '@/components/common/card';
import { SaveIcon } from '@/components/icons/save';
import { seoValidationSchema } from '@/components/settings/seo/seo-validation-schema';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import StickyFooterPanel from '@/components/ui/sticky-footer-panel';
import TextArea from '@/components/ui/text-area';
import { useSettings } from '@/contexts/settings.context';
import { useUpdateSettingsMutation } from '@/graphql/settings.graphql';
import { useConfirmRedirectIfDirty } from '@/utils/confirmed-redirect-if-dirty';
import { prepareSettingsInputData } from '@/utils/prepare-settings-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { AttachmentInput, Settings } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type SeoFormValues = {
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: AttachmentInput;
    twitterHandle: string;
    twitterCardType: string;
    metaTags: string;
    canonicalUrl: string;
  };
};

type IProps = {
  settings?: Settings | null;
};

export default function SeoSettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [updateSettingsMutation, { loading, client }] =
    useUpdateSettingsMutation();
  const { language, options: settingOptions } = settings ?? {};
  const { updateSettings } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SeoFormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(seoValidationSchema),
    //@ts-ignore
    defaultValues: {
      ...settingOptions,
    },
  });

  async function onSubmit(values: SeoFormValues) {
    const inputValues = {
      ...settingOptions,
      seo: {
        ...values?.seo,
        ogImage: values?.seo?.ogImage,
      },
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
  useConfirmRedirectIfDirty({ isDirty });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:mt-8 sm:mb-3">
        <Description
          title={t('text-seo-settings')}
          details={t('form:tax-form-seo-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('form:input-label-meta-title')}
            toolTipText={t('form:input-tooltip-meta-title')}
            {...register('seo.metaTitle')}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-meta-description')}
            toolTipText={t('form:input-tooltip-meta-description')}
            {...register('seo.metaDescription')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-meta-tags')}
            toolTipText={t('form:input-tooltip-meta-tags')}
            {...register('seo.metaTags')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-canonical-url')}
            toolTipText={t('form:input-tooltip-canonical-url')}
            {...register('seo.canonicalUrl')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-og-title')}
            toolTipText={t('form:input-tooltip-og-title')}
            {...register('seo.ogTitle')}
            variant="outline"
            className="mb-5"
          />
          <TextArea
            label={t('form:input-label-og-description')}
            toolTipText={t('form:input-tooltip-og-description')}
            {...register('seo.ogDescription')}
            variant="outline"
            className="mb-5"
          />
          <div className="mb-5">
            <FileInput
              label={t('form:input-label-og-image')}
              toolTipText={t('form:input-tooltip-og-image')}
              name="seo.ogImage"
              control={control}
              multiple={false}
            />
          </div>
          <Input
            label={t('form:input-label-twitter-handle')}
            toolTipText={t('form:input-tooltip-twitter-handle')}
            {...register('seo.twitterHandle')}
            variant="outline"
            className="mb-5"
            placeholder="your twitter username (exp: @username)"
          />
          <Input
            label={t('form:input-label-twitter-card-type')}
            toolTipText={t('form:input-tooltip-twitter-card-type')}
            {...register('seo.twitterCardType')}
            variant="outline"
            className="mb-5"
            placeholder="one of summary, summary_large_image, app, or player"
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
