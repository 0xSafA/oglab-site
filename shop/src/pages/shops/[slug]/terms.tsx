import Seo from '@/components/seo/seo';
import { useTermsAndConditions } from '@/framework/terms-and-conditions';
import { LIMIT_HUNDRED } from '@/lib/constants';
import { useTranslation } from 'next-i18next';
import PageBanner from '@/components/banners/page-banner';
import Terms from '@/components/terms/terms';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import ErrorMessage from '@/components/ui/error-message';
import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import NotFound from '@/components/ui/not-found';
import { isEmpty } from 'lodash';
import { TermsAndConditions } from '@/types';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { useSettings } from '@/framework/settings';
import { Routes } from '@/config/routes';
export default function ShopTermsPage() {
  const { t } = useTranslation('terms');
  const router = useRouter();
  const {
    query: { slug },
  } = useRouter();
  const { data: shopData } = useShop({ slug: slug as string });
  const { settings } = useSettings();
  const shopId = shopData?.id!;

  !settings?.enableTerms ? router.replace(Routes.shops) : null;

  const {
    termsAndConditions,
    error,
    isLoading: loading,
  } = useTermsAndConditions({
    shop_id: shopId,
    limit: LIMIT_HUNDRED,
    is_approved: true,
  });

  if (loading) {
    return <Spinner showText={false} />;
  }

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Seo title="Terms" url="terms" />
      <section className="w-full pb-8 mx-auto max-w-1920 bg-light lg:pb-10 xl:pb-14">
        <PageBanner
          title={t('terms-main-title')}
          breadcrumbTitle={t('terms-text-home')}
        />
        {/* End of page header */}
        <div className="container px-4 py-8 mx-auto 3xl:py-18 md:py-10 xl:py-12 2xl:py-14">
          {isEmpty(termsAndConditions) ? (
            <div className="max-w-sm mx-auto">
              <NotFound text="No terms and conditions found." />
            </div>
          ) : (
            <Terms
              isLoading={loading}
              terms={termsAndConditions as TermsAndConditions[]}
            />
          )}
        </div>
      </section>
    </>
  );
}

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'terms'])),
  },
});

ShopTermsPage.getLayout = getLayoutWithFooter;
