import Link from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { Product } from '@/types';
import { productPlaceholder } from '@/lib/placeholders';
import usePrice from '@/lib/use-price';
import { ExternalIcon } from '@/components/icons/external-icon';

type RadonProps = {
  product: Product;
  className?: string;
};

const Radon: React.FC<RadonProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const {
    name,
    slug,
    image,
    author,
    min_price,
    max_price,
    product_type,
    is_external,
    external_product_url,
    external_product_button_text,
  } = product ?? {};

  const { price, basePrice, discount } = usePrice({
    amount: product.sale_price ? product.sale_price : product.price!,
    baseAmount: product.price,
  });
  const { price: minPrice } = usePrice({
    amount: min_price!,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price!,
  });

  return (
    <article
      className={cn(
        'product-card cart-type-radon flex h-full flex-col overflow-hidden duration-200',
        className,
      )}
    >
      <Link
        href={Routes.product(slug)}
        className={`cursor-pointer relative rounded-lg flex bg-white w-full justify-center items-center overflow-hidden ${
          product?.type?.settings?.layoutType === 'compact'
            ? 'aspect-[2/3]'
            : 'aspect-square'
        }`}
      >
        <Image
          src={image?.original ?? productPlaceholder}
          alt={name}
          fill
          quality={100}
          sizes="(max-width: 768px) 100vw"
          className="object-contain my-auto rounded-lg product-image"
        />
      </Link>
      {/* End of product image */}

      <div className="flex justify-between gap-3 pt-4">
        <div className="flex flex-col w-full space-y-2 overflow-hidden shrink-0">
          {name && (
            <Link
              href={Routes.product(slug)}
              className="w-full text-sm font-semibold truncate transition-colors text-heading hover:text-orange-500 md:text-base"
              title={name}
            >
              {name}
            </Link>
          )}

          {author && (
            <span className="text-xs text-gray-400 md:text-sm">
              {t('text-by')}
              <Link
                href={Routes.author(author?.slug!)}
                className="transition-colors text-body hover:text-orange-500 ltr:ml-1 rtl:mr-1"
              >
                {author?.name}
              </Link>
            </span>
          )}

          <div className="flex items-center shrink-0">
            {product_type.toLowerCase() === 'variable' ? (
              <p className="text-sm font-semibold text-orange-500 md:text-base">
                {minPrice}

                <span className="text-heading"> - </span>

                {maxPrice}
              </p>
            ) : (
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <span className="text-base font-semibold text-orange-500">
                  {price}
                </span>
                {basePrice && (
                  <del className="text-xs font-semibold text-gray-400 ltr:mr-2 rtl:ml-2">
                    {basePrice}
                  </del>
                )}
                {discount && (
                  <div className="text-xs text-accent">
                    ({t('text-save')} {discount})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {is_external ? (
          <Link
            href={external_product_url}
            className="transition-all hover:text-orange-500"
          >
            <ExternalIcon className="w-5 h-5 stroke-2" />
          </Link>
        ) : null}
      </div>
      {/* End of product info */}
    </article>
  );
};

export default Radon;
