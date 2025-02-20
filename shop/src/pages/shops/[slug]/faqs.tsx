import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Seo from '@/components/seo/seo';
import { useFAQs } from '@/framework/faqs';
import { useRouter } from 'next/router';
import { useShop } from '@/framework/shop';
import NotFound from '@/components/ui/not-found';
import { LIMIT_HUNDRED } from '@/lib/constants';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
import PageBanner from '@/components/banners/page-banner';
import FAQ from '@/components/faq/faq';
import ErrorMessage from '@/components/ui/error-message';

export default function ShopFaqPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const {
    query: { slug },
  } = useRouter();
  const { data: shopData } = useShop({ slug: slug as string });
  const shopId = shopData?.id!;

  const { faqs, isLoading, error } = useFAQs({
    language: locale,
    faq_type: 'shop',
    shop_id: shopId,
    issued_by: shopData?.name,
    limit: LIMIT_HUNDRED,
  });

  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <Seo title="Help" url="help" />
      <section className="w-full min-h-screen pb-16 mx-auto max-w-1920 bg-light lg:pb-10 xl:pb-14">
        <PageBanner
          title={t('text-faq-title')}
          breadcrumbTitle={t('text-home')}
        />
        <div className="w-full max-w-screen-lg px-4 py-10 mx-auto">
          {!isLoading && !faqs.length ? (
            <div className="min-h-full p-5 md:p-8 lg:p-12 2xl:p-16">
              <NotFound text="text-no-faq" className="h-96" />
            </div>
          ) : (
            <FAQ data={faqs as any} isLoading={isLoading} />
          )}
        </div>
      </section>
    </>
  );
}

ShopFaqPage.getLayout = getLayoutWithFooter;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'faq'])),
  },
});
