import { Image } from '@/components/ui/image';
import cn from 'classnames';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { productPlaceholder } from '@/lib/placeholders';
import { ExternalIcon } from '@/components/icons/external-icon';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const AddToCart = dynamic(
  () =>
    import('@/components/products/add-to-cart/add-to-cart').then(
      (module) => module.AddToCart,
    ),
  { ssr: false },
);

type XenonProps = {
  product: any;
  className?: string;
};

const Xenon: React.FC<XenonProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  const {
    name,
    image,
    quantity,
    min_price,
    max_price,
    product_type,
    is_external,
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
      className={cn(
        'product-card cart-type-xenon h-full transform overflow-hidden rounded border border-border-200 border-opacity-70 bg-light transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow',
        className
      )}
    >
      <div
        className={cn(
          'relative flex h-48 w-auto cursor-pointer items-center justify-center sm:h-64',
          query?.pages
            ? query?.pages?.includes('medicine')
              ? 'm-4 mb-0'
              : ''
            : ''
        )}
        onClick={handleProductQuickView}
      >
        <span className="sr-only">{t('text-product-image')}</span>
        <Image
          src={image?.original ?? productPlaceholder}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw"
          className="product-image object-contain"
        />
        {discount && (
          <div className="absolute top-3 rounded bg-accent px-1.5 text-xs font-semibold leading-6 text-light ltr:left-3 rtl:right-3 md:top-4 md:px-2 ltr:md:left-4 rtl:md:right-4 lg:px-2.5">
            {discount}
          </div>
        )}
      </div>
      {/* End of product image */}

      <header className="p-3 md:p-6">
        <h3
          className="cursor-pointer truncate text-xs text-body md:text-sm"
          onClick={handleProductQuickView}
        >
          {name}
        </h3>
        {/* End of product name */}

        {/* End of price */}
        <div className="mt-2 flex items-center justify-between">
          {product_type.toLowerCase() === 'variable' || is_external ? (
            <>
              <div>
                <span className="text-sm font-semibold text-heading md:text-base">
                  {minPrice}
                </span>
                <span> - </span>
                <span className="text-sm font-semibold text-heading md:text-base">
                  {maxPrice}
                </span>
              </div>

              {Number(quantity) > 0 && (
                <button
                  onClick={handleProductQuickView}
                  className="flex h-7 w-7 items-center justify-center rounded border border-border-200 bg-light text-sm text-accent transition-colors hover:border-accent hover:bg-accent hover:text-light focus:border-accent focus:bg-accent focus:text-light focus:outline-0 md:h-9 md:w-9"
                >
                  <span className="sr-only">plus</span>
                  {is_external ? (
                    <ExternalIcon className="h-5 w-5 stroke-2" />
                  ) : (
                    <PlusIcon className="h-5 w-5 stroke-2" />
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center">
                <span className="text-sm font-semibold text-heading md:text-base">
                  {price}
                </span>
                {basePrice && (
                  <del className="mt-1 text-xs text-muted md:mt-0 ltr:md:ml-2 rtl:md:mr-2">
                    {basePrice}
                  </del>
                )}
              </div>

              {Number(quantity) > 0 && (
                <AddToCart
                  variant="argon"
                  data={product}
                  counterClass="absolute sm:static bottom-3 ltr:right-3 rtl:left-3 sm:bottom-0 ltr:sm:right-0 rtl:sm:left-0"
                />
              )}
            </>
          )}

          {Number(quantity) <= 0 && (
            <div className="truncate rounded bg-red-500 px-1 py-1 text-xs text-light">
              {t('text-out-stock')}
            </div>
          )}

          {/* End of cart */}
        </div>
      </header>
    </article>
  );
};

export default Xenon;
