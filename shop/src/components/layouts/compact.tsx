import SectionBlock from '@/components/ui/section-block';
import FilterBar from './filter-bar';
import Categories from '@/components/categories/categories';
import CallToAction from '@/components/cta/call-to-action';
import GroupProducts from '@/components/products/group-products';
import PopularProductsGrid from '@/components/products/popular-products';
import TopAuthorsGrid from '@/components/author/top-authors-grid';
import Banner from '@/components/banners/banner';
import TopManufacturersGrid from '@/components/manufacturer/top-manufacturers-grid';
import { useTranslation } from 'next-i18next';
import type { HomePageProps } from '@/types';
import ProductGridHome from '@/components/products/grids/home';
import BestSellingProductsGrid from '@/components/products/best-selling-products';

export default function CompactLayout({ variables }: HomePageProps) {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col flex-1 bg-white">
      <FilterBar
        className="top-16 lg:hidden"
        variables={variables.categories}
      />
      <main className="block w-full mt-20 sm:mt-24 lg:mt-6 xl:overflow-hidden">
        <SectionBlock>
          <Banner layout="compact" variables={variables.types} />
        </SectionBlock>
        {variables?.layoutSettings?.bestSelling?.enable ? (
          <BestSellingProductsGrid
            variables={variables?.bestSellingProducts}
            title={variables?.layoutSettings?.bestSelling?.title}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.popularProducts?.enable ? (
          <PopularProductsGrid
            variables={variables.popularProducts}
            title={variables?.layoutSettings?.popularProducts?.title}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.category?.enable ? (
          <Categories
            title={variables?.layoutSettings?.category?.title}
            layout="compact"
            variables={variables.categories}
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.handpickedProducts?.enable ? (
          <GroupProducts
            products={variables?.layoutSettings?.handpickedProducts?.products}
            title={variables?.layoutSettings?.handpickedProducts?.title}
            isSlider={
              variables?.layoutSettings?.handpickedProducts?.enableSlider
            }
          />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.newArrival?.enable ? (
          <SectionBlock title={variables?.layoutSettings?.newArrival?.title}>
            <ProductGridHome
              column="five"
              variables={{
                ...variables.products,
                sortedBy: 'DESC',
                orderBy: 'created_at',
              }}
            />
          </SectionBlock>
        ) : (
          ''
        )}
        {variables?.layoutSettings?.authors?.enable ? (
          <TopAuthorsGrid title={variables?.layoutSettings?.authors?.title} />
        ) : (
          ''
        )}
        {variables?.layoutSettings?.manufactures?.enable ? (
          <TopManufacturersGrid
            title={variables?.layoutSettings?.manufactures?.title}
          />
        ) : (
          ''
        )}
        <CallToAction />
      </main>
    </div>
  );
}
