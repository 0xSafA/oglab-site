import { Banner } from '@/components/become-seller/form-part/banner';
import { updatedIcons } from '@/components/become-seller/updated-icon';
import { useUpdateBecameSellerMutation } from '@/graphql/became-seller.graphql';
import { siteSettings } from '@/settings/site.settings';
import { BecomeSeller, BecomeSellerInput, BusinessPurposeItem } from '@/types/custom-types';
import { prepareSettingsInputData as prepareBecomeSellerInputData } from '@/utils/prepare-settings-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { Settings } from '__generated__/__types__';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowUp } from '../icons/arrow-up';
import { BackToTopButton } from '../ui/back-to-top/back-to-top';
import { useBackToTop } from '../ui/back-to-top/back-to-top-context';
import Button from '../ui/button';
import StickyFooterPanel from '../ui/sticky-footer-panel';
import { becomeSellerValidationSchema } from './became-seller-form-validation-schema';
import { BusinessPurpose } from './form-part/business-purpose';
import { Commission } from './form-part/commission';
import { Contact } from './form-part/contact';
import { DashboardShowcase } from './form-part/dashboard-showcase';
import { FAQ } from './form-part/faq';
import { Guideline } from './form-part/guideline';
import { SellerOpportunity } from './form-part/seller-opportunity';
import { StartSelling } from './form-part/start-selling';
import { UserStory } from './form-part/user-story';

interface IProps {
  becameSellerData?: BecomeSeller | null;
  settings?: Settings | null;
}

export default function BecameSellerInfoForm({
  becameSellerData,
  settings,
}: IProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [updateBecameSellerMutation, { loading }] =
    useUpdateBecameSellerMutation();
  //@ts-ignore
  const { language, page_options, commissions } = becameSellerData ?? {};
  const { options } = settings ?? {};
  const max_fileSize = options?.server_info?.upload_max_filesize! * 1000;
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BecomeSellerInput>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(becomeSellerValidationSchema),
    ...(becameSellerData
      ? {
          defaultValues: {
            page_options: {
              ...page_options?.page_options,
              purposeItems: page_options?.page_options?.purposeItems
                ? page_options?.page_options?.purposeItems?.map(
                    // @ts-ignore
                    (item: {
                      description: string;
                      title: string;
                      icon: { value: string };
                    }) => ({
                      description: item?.description,
                      title: item?.title,
                      icon: updatedIcons?.find(
                        (icon) => icon?.value === item?.icon?.value,
                      ),
                    }),
                  )
                : [],
            },
            commissions,
          },
        }
      : {}),
  });

  async function onSubmit(values: BecomeSellerInput) {
    const inputData = prepareBecomeSellerInputData(values);
    try {
      const updatedData = await updateBecameSellerMutation({
        variables: {
          input: {
            language: router.locale as string,
            ...inputData,
            // @ts-ignore
            page_options: {
              ...inputData.page_options,
              purposeItems: values?.page_options?.purposeItems?.map((item) => ({
                description: item?.description,
                title: item?.title,
                icon: {
                  value: item?.icon?.value,
                },
              })),
            },
            commissions: inputData?.commissions,
          },
        },
      });

      if (updatedData) {
        toast.success(t('common:successfully-updated'));
      }
    } catch (error) {
      toast.error(t('common:update-failed'));
    }
  }

  const logoInformation = (
    <span>
      {t('form:logo-help-text')} <br />
      {t('form:logo-dimension-help-text')} &nbsp;
      <span className="font-bold">
        {siteSettings.logo.width}x{siteSettings.logo.height} {t('common:pixel')}
      </span>
      <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{max_fileSize} MB </span>
    </span>
  );

  const { refs } = useBackToTop();
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Banner
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
        />
        <StartSelling
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
          watch={watch}
        />
        <UserStory
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
          watch={watch}
        />
        <BusinessPurpose
          register={register}
          control={control}
          errors={errors}
          watch={watch}
          purposeItems={page_options?.page_options?.purposeItems as BusinessPurposeItem[]}
        />
        <Commission
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
          watch={watch}
          isMultiCommissionRate={options?.isMultiCommissionRate as boolean}
          commissions={commissions}
        />
        <DashboardShowcase
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
        />
        <Guideline
          register={register}
          control={control}
          errors={errors}
          watch={watch}
        />
        <FAQ
          register={register}
          control={control}
          errors={errors}
          watch={watch}
        />
        <Contact register={register} errors={errors} control={control} />
        <SellerOpportunity
          register={register}
          control={control}
          errors={errors}
          max_fileSize={max_fileSize}
        />
        <StickyFooterPanel className="z-0">
          <Button
            loading={loading}
            disabled={loading}
            className="text-sm md:text-base"
            ref={refs.setReference}
          >
            {t('form:text-save-seller-information')}
          </Button>
        </StickyFooterPanel>
      </form>
      <BackToTopButton asChild className="shadow-md">
        <Button className="text-sm md:text-base">
          <ArrowUp />
        </Button>
      </BackToTopButton>
    </>
  );
}
