import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import ProductCard from '../cards/card';
interface Props {
  products: any;
  currentProductId: any;
  gridClassName?: string;
}

const RelatedProducts = ({
  products,
  currentProductId,
  gridClassName,
}: Props) => {
  const { t } = useTranslation('common');

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-heading">
        {t('text-related-products')}
      </h2>
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
          gridClassName
        )}
      >
        {products?.map((item: any, idx: number) => {
          if (currentProductId === item.id) {
            return null;
          }
          return (
            <ProductCard product={item} key={idx} cardType={item?.type?.slug} />
          );
        })}
      </div>
    </>
  );
};
// <motion.div key={idx}>
{
  /* {renderProductCard(
    item,
    "!shadow-none border border-border-200 hover:!border-border-200 border-opacity-70"
  )} */
}
// </motion.div>

export default RelatedProducts;
