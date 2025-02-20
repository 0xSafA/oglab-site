import { Image } from '@/components/ui/image';
import cn from 'classnames';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { productPlaceholder } from '@/lib/placeholders';
import CartIcon from '@/components/icons/cart';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';
import dynamic from 'next/dynamic';
const AddToCart = dynamic(
  () =>
    import('@/components/products/add-to-cart/add-to-cart').then(
      (module) => module.AddToCart,
    ),
  { ssr: false },
);


type HeliumProps = {
  product: any;
  className?: string;
};

const Helium: React.FC<HeliumProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const {
    name,
    image,
    unit,
    quantity,
    min_price,
    max_price,
    product_type,
    in_flash_sale,
  } = product ?? {};

  const { price, basePrice, discount } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price!,
    baseAmount: product.price,
  });
  const { price: minPrice } = usePrice({
    amount: min_price,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price,
  });

  const { openModal } = useModalAction();

  function handleProductQuickView() {
    return openModal('PRODUCT_DETAILS', product.slug);
  }

  return (
    <article
      className={twMerge(
        cn(
          'product-card cart-type-helium h-full overflow-hidden rounded border border-border-200 bg-light transition-shadow duration-200 hover:shadow-sm',
          className
        )
      )}
    >
      <div
        onClick={handleProductQuickView}
        className={cn(
          'relative flex h-48 w-auto items-center justify-center sm:h-64',
          query?.pages
            ? query?.pages?.includes('medicine')
              ? 'm-4 mb-0'
              : ''
            : ''
        )}
        // role="button"
      >
        <span className="sr-only">{t('text-product-image')}</span>
        <Image
          src={image?.original ?? productPlaceholder}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw"
          className="block object-contain product-image"
        />
        {discount && (
          <div className="absolute top-3 rounded-full bg-yellow-500 px-1.5 text-xs font-semibold leading-6 text-light ltr:right-3 rtl:left-3 sm:px-2 md:top-4 md:px-2.5 ltr:md:right-4 rtl:md:left-4">
            {discount}
          </div>
        )}
      </div>
      {/* End of product image */}

      <header className="relative p-3 md:p-5 md:py-6">
        <h3
          onClick={handleProductQuickView}
          role="button"
          className="mb-2 text-sm font-semibold truncate text-heading"
        >
          {name}
        </h3>
        <p className="text-xs text-muted">{unit}</p>
        {/* End of product info */}

        <div className="relative flex items-center justify-between mt-7 min-h-6 md:mt-8">
          {product_type.toLowerCase() === 'variable' ? (
            <>
              <div>
                <span className="text-sm font-semibold text-accent md:text-[15px]">
                  {minPrice}
                </span>
                <span> - </span>
                <span className="text-sm font-semibold text-accent md:text-[15px]">
                  {maxPrice}
                </span>
              </div>

              {Number(quantity) > 0 && (
                <button
                  onClick={handleProductQuickView}
                  className="flex items-center justify-center order-5 px-3 py-2 text-sm font-semibold transition-colors duration-300 border-2 rounded-full border-border-100 bg-light text-accent hover:border-accent hover:bg-accent hover:text-light focus:border-accent focus:bg-accent focus:text-light focus:outline-0 sm:order-4 sm:justify-start sm:px-4"
                >
                  <CartIcon className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  <span>{t('text-cart')}</span>
                </button>
              )}
            </>
          ) : (
            <>
              <div className="relative">
                {basePrice && (
                  <del className="absolute text-xs italic text-opacity-75 -top-4 text-muted md:-top-5">
                    {basePrice}
                  </del>
                )}
                <span className="text-sm font-semibold text-accent md:text-base">
                  {price}
                </span>
              </div>

              {Number(quantity) > 0 && (
                <AddToCart data={product} variant="single" />
              )}
            </>
          )}

          {Number(quantity) <= 0 && (
            <div className="px-2 py-1 text-xs bg-red-500 rounded text-light">
              {t('text-out-stock')}
            </div>
          )}
          {/* End of product price */}
        </div>
      </header>
    </article>
  );
};

export default Helium;
