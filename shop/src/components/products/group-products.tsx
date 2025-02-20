import SectionBlock from '@/components/ui/section-block';
import { Product } from '@/types';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const ProductsGrid = dynamic(
  () => import('@/components/products/group-products/grid')
);

const ProductsSlider = dynamic(
  () => import('@/components/products/group-products/slider')
);

export default function GroupProducts({
  products,
  title,
  isSlider,
}: {
  products: Product[];
  title?: string;
  isSlider?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <SectionBlock title={title}>
      {!isSlider ? (
        <ProductsGrid products={products} />
      ) : (
        <ProductsSlider products={products} />
      )}
    </SectionBlock>
  );
}
