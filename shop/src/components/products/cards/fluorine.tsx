import { Product, ProductType, DiscountType, FlashSale } from '@/types';
import { productPlaceholder } from '@/lib/placeholders';
import Image from 'next/image';
import usePrice from '@/lib/use-price';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';
import { Routes } from '@/config/routes';
import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { ExternalIconNew } from '@/components/icons/external-icon';
// import { PlusIcon } from '@/components/icons/plus-icon';
// import Badge from '@/components/ui/badge';
import { StarIcon } from '@/components/icons/star-icon';
import { EyeIcon } from '@/components/icons/eye';
import dynamic from 'next/dynamic';
const FavoriteButton = dynamic(
  () => import('@/components/products/details/favorite-button'),
  { ssr: false },
);
const AddToCart = dynamic(
  () =>
    import('@/components/products/add-to-cart/add-to-cart').then(
      (module) => module.AddToCart,
    ),
  { ssr: false },
);


type FluorineProps = {
  product: Product;
  type: string;
  rate: string;
  className?: string;
  sale_status: FlashSale['sale_status'];
  currency: string;
  start_date: string;
  end_date: string;
};

const Fluorine: React.FC<FluorineProps> = ({
  product,
  className,
  type,
  rate,
  sale_status,
  currency,
  start_date,
  end_date,
}) => {
  const { t } = useTranslation();
  const currentDate = dayjs().format('DD-MMM-YYYY');

  const discountVariablePrice = useMemo(() => {
    let isInvalidPrice: boolean = false;

    if (
      type === DiscountType?.FixedRate &&
      product?.product_type === ProductType.Variable &&
      sale_status
    ) {
      isInvalidPrice =
        ((product?.max_price as number) - Number(rate)! ||
          (product?.min_price as number) - Number(rate)!) <= 0;
    }

    return { isInvalidPrice };
  }, [
    type,
    product?.product_type,
    product?.min_price,
    product?.max_price,
    rate,
  ]);

  const discountSimplePrice = useMemo(() => {
    let isInvalidPrice: boolean = false;
    if (
      type === DiscountType?.FixedRate &&
      product?.product_type === ProductType.Simple &&
      sale_status
    ) {
      isInvalidPrice = product?.price - Number(rate)! <= 0;
    }
    return { isInvalidPrice };
  }, [type, product?.product_type, product?.price, rate]);

  // For variable products
  let originalPrice: number,
    discountedPrice: number,
    discountedMaxPrice: number,
    discountedMindPrice: number,
    renderPrice: string;

  // calculating percentage

  switch (type) {
    case 'percentage':
      if (product?.product_type === ProductType.Variable) {
        const minPrice = product?.min_price as number;
        const maxPrice = product?.max_price as number;

        discountedMindPrice = minPrice - minPrice * (Number(rate) / 100);
        discountedMaxPrice = maxPrice - maxPrice * (Number(rate) / 100);
      }

      if (product?.product_type === ProductType.Simple) {
        discountedPrice = product?.sale_price;
        originalPrice = product?.price;
      }

      break;

    case 'fixed_rate':
      if (product?.product_type === ProductType.Variable) {
        const minPrice = product?.min_price as number;
        const maxPrice = product?.max_price as number;

        discountedMindPrice = minPrice - Number(rate);
        discountedMaxPrice = maxPrice - Number(rate);
      }

      if (product?.product_type === ProductType.Simple) {
        discountedPrice = product?.sale_price;
        originalPrice = product?.price;
      }

      break;
  }

  // formatting pricing markup
  // for variable products & preparing for display
  const { price: max_price } = usePrice({
    amount: discountedMaxPrice!,
  });
  const { price: min_price } = usePrice({
    amount: discountedMindPrice!,
  });

  if (product?.product_type === ProductType?.Variable) {
    renderPrice = `${min_price} - ${max_price}`;
  }

  // for simple products
  const { price, basePrice, discount } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price,
    baseAmount: product?.price,
  });

  const { openModal } = useModalAction();
  const handleProductQuickView = useCallback(() => {
    return openModal('PRODUCT_DETAILS', product?.slug);
  }, [product?.slug]);

  return (
    <div
      className={twMerge(
        classNames('relative overflow-hidden rounded-xl bg-white', className)
      )}
    >
      <div className="relative w-auto cursor-pointer md:h-[22.75rem]">
        <div onClick={handleProductQuickView} className="h-full w-full">
          <Image
            src={product?.image?.original ?? productPlaceholder}
            alt={product?.name}
            // fill
            width={1200}
            height={364}
            sizes="(max-width: 768px) 100vw"
            className="block h-full w-full"
          />
        </div>
        <div className="absolute top-5 right-5">
          <FavoriteButton
            productId={product?.id}
            className="z-50 mt-0 h-8 w-8 border-0 text-base"
            variant="minimal"
          />
        </div>
      </div>
      <div className="p-4">
        <h2
          className={classNames(
            'mb-2 gap-2 text-lg font-semibold text-muted-black',
            product?.is_external ? 'flex items-center' : 'truncate'
          )}
        >
          <Link
            className={product?.is_external ? 'truncate' : ''}
            href={Routes?.product(product?.slug)}
          >
            {product?.name}
          </Link>
          {product?.is_external ? (
            <Link
              href={
                product?.external_product_url ?? Routes?.product(product?.slug)
              }
              className="shrink-0 text-xl text-accent"
            >
              <ExternalIconNew />
            </Link>
          ) : (
            ''
          )}
        </h2>
        <div className="mb-2 flex items-center">
          <div className="flex flex-1 shrink-0 items-center gap-1 pr-2">
            {product?.product_type.toLowerCase() === 'variable' ? (
              <>
                <p className="flex gap-1 text-base font-medium leading-none text-muted-black">
                  {renderPrice!}
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-medium leading-none text-muted-black">
                  {price!}
                </p>
                {sale_status ? (
                  <del
                    className={classNames('text-sm font-normal text-[#F75159]')}
                  >
                    {basePrice!}
                  </del>
                ) : (
                  ''
                )}
              </>
            )}
          </div>
          {Number(product?.quantity) <= 0 && (
            <div className="rounded bg-[#F75159] bg-opacity-10 p-2 text-sm text-[#F75159]">
              {t('text-out-stock')}
            </div>
          )}
          {currentDate === start_date ? (
            <div>
              {product?.product_type.toLowerCase() === 'variable' ||
              product?.is_external ? (
                <>
                  {Number(product?.quantity) > 0 && (
                    <button
                      onClick={handleProductQuickView}
                      // className="flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-full bg-accent text-lg text-white transition-colors hover:bg-accent-hover hover:text-white focus:bg-accent-hover focus:text-white focus:outline-0"
                      className="text-xl text-accent"
                    >
                      <EyeIcon />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {Number(product?.quantity) > 0 &&
                    !discountSimplePrice?.isInvalidPrice && (
                      <AddToCart variant="florine" data={product} />
                    )}
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleProductQuickView}
              // className="flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-full bg-accent text-lg text-white transition-colors hover:bg-accent-hover hover:text-white focus:bg-accent-hover focus:text-white focus:outline-0"
              className="text-xl text-accent"
            >
              <EyeIcon />
            </button>
          )}
        </div>
        <p className="flex items-center gap-1 text-sm font-medium text-[#666]">
          <StarIcon className="text-[#FFE03A]" width={14} height={14} />
          {product?.ratings} ({product?.rating_count?.length}){' '}
          <span className="text-muted-black">Reviews</span>
        </p>
      </div>
    </div>
  );
};

export default Fluorine;
