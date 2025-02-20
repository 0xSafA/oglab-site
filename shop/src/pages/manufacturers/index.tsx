import { getLayout as getSiteLayout } from '@/components/layouts/layout';
import { useTranslation } from 'next-i18next';
import Search from '@/components/ui/search/search';
import ManufacturersGrid from '@/components/manufacturer/manufacturers-grid';
import { getLayoutWithFooter } from '@/components/layouts/layout-with-footer';
export { getStaticProps } from '@/framework/manufacturers-page.ssr';

export default function ManufacturersPage() {
  const { t } = useTranslation('common');
  return (
    <div className="w-full bg-light">
      <div className="mx-auto min-h-screen max-w-1920 px-5 py-10 xl:py-14 xl:px-16">
        <div className="flex flex-col items-center">
          <h1 className="mb-4 text-2xl font-bold text-accent sm:text-3xl lg:text-4xl">
            {t('text-search-manufacturers-title')}
          </h1>
          <p className="text-base text-heading">
            {t('text-search-manufacturers-subtitle')}
          </p>

          <div className="mt-12 w-full max-w-screen-md">
            <Search
              variant="minimal"
              label="search"
              placeholder={t('text-search-manufacturer')}
            />
          </div>
        </div>
        <ManufacturersGrid />
      </div>
    </div>
  );
}

ManufacturersPage.getLayout = getLayoutWithFooter;
