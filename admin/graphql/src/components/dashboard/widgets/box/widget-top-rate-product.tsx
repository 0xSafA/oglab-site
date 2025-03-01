import {
  Pagination,
  Swiper,
  SwiperSlide,
} from '@/components/ui/slider';
import { siteSettings } from '@/settings/site.settings';
import usePrice from '@/utils/use-price';
import cn from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { StarIcon } from '@/components/icons/star-icon';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useTypeQuery } from '@/graphql/type.graphql';
import { ProductType, TopRatedProduct } from '__generated__/__types__';
import { useTranslation } from 'react-i18next';
import PageHeading from '@/components/common/page-heading';
import { isEmpty } from 'lodash';

// get rating calculation
function getRating(rating: any) {
  return (
    <div className="flex items-center gap-1">
      {[...new Array(5)].map(
        (
          //@ts-ignore
          arr,
          index
        ) => {
          return index < Math.round(rating) ? (
            <StarIcon className="w-3.5 text-yellow-500" />
          ) : (
            <StarIcon className="w-3.5 text-gray-300" key={index} />
          );
        }
      )}{' '}
    </div>
  );
}

function SoldProductCard({ product }: { product: any }) {
  const {
    name,
    image,
    product_type,
    price,
    max_price,
    min_price,
    sale_price,
    actual_rating,
    description,
    type_slug,
  } = product ?? {};
  const router = useRouter();
  const { locale } = router;
  const { data } = useTypeQuery({
    variables: {
      slug: type_slug as string,
      language: locale!,
    },
  });

  const { price: currentPrice, basePrice } = usePrice({
    amount: sale_price ? sale_price : price!,
    baseAmount: price ?? 0,
  });
  const { price: minPrice } = usePrice({
    amount: min_price ?? 0,
  });
  const { price: maxPrice } = usePrice({
    amount: max_price ?? 0,
  });

  return (
    <>
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border-200/60 2xl:aspect-[1/0.88]">
        <div>
          <div
            className={cn(
              'relative w-52 sm:w-80 md:w-96 lg:w-48 xl:w-72 2xl:w-80',
              data?.type?.settings?.productCard === 'radon'
                ? 'aspect-[2.5/3.6]'
                : 'aspect-square'
            )}
          >
            <Image
              alt={name}
              src={image?.original ?? siteSettings?.product?.placeholder}
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw"
            />
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between pt-4">
        <div className="w-full max-w-[calc(100%-110px)]">
          <h4 className="mb-1.5 truncate text-base font-semibold text-heading">
            {name}
          </h4>
          <p className="mb-3 text-sm font-normal text-gray-500 truncate">
            {description}
          </p>

          {product_type === ProductType.Variable ? (
            <div className="block">
              <span className="text-base font-semibold text-heading/80">
                {minPrice}
              </span>
              <span> - </span>
              <span className="text-base font-semibold text-heading/80">
                {maxPrice}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-base font-semibold text-heading/80">
                {currentPrice}
              </span>
              {basePrice && (
                <del className="text-xs text-muted ms-2 md:text-base">
                  {basePrice}
                </del>
              )}
            </div>
          )}
        </div>
        <div className="pt-1.5">{getRating(actual_rating)}</div>
      </div>
    </>
  );
}


export type IProps = {
  products: TopRatedProduct[] | undefined;
  title: string;
  className?: string;
};

const TopRatedProductWidget = ({ products, title, className }: IProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-lg bg-white p-5 md:p-8',
          className
        )}
      >
        <div className="mb-5 mt-1.5 flex items-center justify-between md:mb-7">
          <PageHeading title={t(title)} />
        </div>
        {isEmpty(products) ? (
          <div className="flex h-[calc(100%-60px)] items-center justify-center">
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="pt-6 mb-1 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          </div>
        ) : (
          <Swiper
            id="sold-products-gallery"
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
          >
            {products?.map((product: TopRatedProduct) => (
              <SwiperSlide key={`sold-gallery-${product.id}`}>
                <SoldProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </>
  );
};

export default TopRatedProductWidget;
