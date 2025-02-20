import usePrice from '@/lib/use-price';
import { ThumbsCarousel } from '@/components/ui/thumb-carousel';
import { useTranslation } from 'next-i18next';
import { getVariations } from '@/lib/get-variations';
import { useEffect, useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import Truncate from '@/components/ui/truncate';
import { scroller, Element } from 'react-scroll';
import VariationPrice from './variation-price';
import { Routes } from '@/config/routes';
import type { Product } from '@/types';
import { useAtom } from 'jotai';
import VariationGroups from './variation-groups';
import { isVariationSelected } from '@/lib/is-variation-selected';
import { stickyShortDetailsAtom } from '@/store/sticky-short-details-atom';
import { useAttributes } from './attributes.context';
import { AddToCartAlt } from '@/components/products/add-to-cart/add-to-cart-alt';
import BadgeGroups from './badge-groups';
import Link from '@/components/ui/link';
import { displayImage } from '@/lib/display-product-preview-images';
import { useIntersection } from 'react-use';
import dynamic from 'next/dynamic';
import { AddToCartExternal } from '@/components/products/add-to-cart/add-to-cart-external';
import { useSanitizeContent } from '@/lib/sanitize-content';

const FavoriteButton = dynamic(
  () => import('@/components/products/details/favorite-button'),
  { ssr: false },
);

type Props = {
  product: Product;
  backBtn?: boolean;
  isModal?: boolean;
};
const BookDetails: React.FC<Props> = ({ product, isModal = false }) => {
  const {
    id,
    name,
    image, //could only had image we need to think it also
    description,
    categories,
    gallery,
    type,
    sku,
    author,
    manufacturer,
    tags,
    video,
    is_digital,
    is_external,
  } = product ?? {};

  const { t } = useTranslation('common');
  const [_, setShowStickyShortDetails] = useAtom(stickyShortDetailsAtom);

  const { attributes } = useAttributes();
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });
  useEffect(() => {
    if (intersection && intersection.isIntersecting) {
      setShowStickyShortDetails(false);
      return;
    }
    if (intersection && !intersection.isIntersecting) {
      setShowStickyShortDetails(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intersection]);
  const { price, basePrice, discount } = usePrice({
    amount: product?.sale_price ? product?.sale_price : product?.price,
    baseAmount: product?.price ?? 0,
  });

  const variations = useMemo(
    () => getVariations(product?.variations),
    [product?.variations],
  );
  const isSelected = isVariationSelected(variations, attributes);
  let selectedVariation: any = {};
  if (isSelected) {
    selectedVariation = product?.variation_options?.find((o: any) =>
      isEqual(
        o.options.map((v: any) => v.value).sort(),
        Object.values(attributes).sort(),
      ),
    );
  }

  const scrollDetails = () => {
    scroller.scrollTo('details', {
      smooth: true,
      offset: -80,
    });
  };

  const hasVariations = !isEmpty(variations);
  const previewImages = displayImage(selectedVariation?.image, gallery, image);
  const content = useSanitizeContent({ description: description });
  return (
    <article className="mx-auto max-w-screen-xl rounded-lg bg-light px-5 py-16 xl:px-0">
      <div className="flex flex-col border-b border-border-200 border-opacity-70 pb-14 lg:flex-row">
        <div className="lg:w-1/2">
          <div
            className={`product-gallery h-full bg-gray-100  ${
              video?.length
                ? 'book-product-video pb-6 md:pb-14'
                : 'py-6 md:py-16'
            }`}
          >
            <ThumbsCarousel
              gallery={previewImages}
              video={video}
              hideThumbs={
                previewImages.length && video?.length
                  ? false
                  : previewImages.length <= 1
              }
              aspectRatio="auto"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start lg:mt-0 lg:w-1/2 ltr:lg:pl-10 rtl:lg:pr-10 ltr:xl:pl-16 rtl:xl:pr-16 ">
          <div className="w-full" ref={intersectionRef}>
            <div className="flex w-full items-start justify-between space-x-5 rtl:space-x-reverse lg:space-x-8">
              <div className="flex flex-col items-start">
                {name && (
                  <h1 className="text-xl font-bold tracking-tight text-heading lg:text-2xl xl:text-3xl">
                    {name}
                  </h1>
                )}
                {Boolean(is_digital) && (
                  <span className="mt-3 rounded bg-accent-400 px-3 py-1.5 text-xs font-normal text-white md:mt-4">
                    {t('text-downloadable')}
                  </span>
                )}
              </div>

              <FavoriteButton productId={id} />
            </div>

            {author?.name && (
              <div className="mt-4 flex items-center space-x-5 rtl:space-x-reverse md:mt-5">
                <p className="flex items-center text-sm font-normal text-body">
                  {t('text-by-author')}
                  <Link
                    href={Routes.author(author?.slug)}
                    className="text-sm font-bold text-heading transition-colors hover:text-accent ltr:ml-2 rtl:mr-2"
                  >
                    {author?.name}
                  </Link>
                </p>
              </div>
            )}

            {hasVariations ? (
              <>
                <div className="mt-5 mb-7 flex items-center">
                  <VariationPrice
                    selectedVariation={selectedVariation}
                    minPrice={product.min_price}
                    maxPrice={product.max_price}
                  />
                  {isSelected && discount && (
                    <span className="rounded-md bg-accent-200 px-2 py-1 text-xs font-semibold uppercase leading-6 text-accent ltr:ml-4 rtl:mr-4">
                      {discount} {t('text-off')}
                    </span>
                  )}
                </div>
                <div>
                  <VariationGroups variations={variations} variant="outline" />
                </div>
              </>
            ) : (
              <span className="mt-5 mb-7 flex items-center space-x-4 rtl:space-x-reverse">
                <ins className="text-2xl font-bold text-heading no-underline md:text-3xl">
                  {price}
                </ins>
                {basePrice && (
                  <del className="text-base font-normal text-muted md:text-base">
                    {basePrice}
                  </del>
                )}

                {discount && (
                  <span className="rounded-md bg-accent-200 px-2 py-1 text-xs font-semibold uppercase leading-6 text-accent">
                    {discount} {t('text-off')}
                  </span>
                )}
              </span>
            )}

            {content && (
              <div className="mt-7 text-sm leading-7 text-body react-editor-description">
                <Truncate
                  character={150}
                  {...(!isModal && {
                    onClick: () => scrollDetails(),
                    compressText: 'common:text-see-more',
                  })}
                >
                  {content}
                </Truncate>
              </div>
            )}

            <div className="mt-4 flex flex-col items-center border-b border-border-200 border-opacity-70 pb-5 md:mt-6 md:pb-8 lg:flex-row">
              <div className="mb-3 w-full lg:mb-0">
                {!is_external ? (
                  <AddToCartAlt
                    data={product}
                    variant="bordered"
                    variation={selectedVariation}
                    disabled={selectedVariation?.is_disable || !isSelected}
                  />
                ) : (
                  <AddToCartExternal
                    data={product}
                    variant="bordered"
                    variation={selectedVariation}
                    disabled={selectedVariation?.is_disable || !isSelected}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid w-full grid-cols-1 gap-5 md:grid-cols-3">
            {!!categories?.length && (
              <BadgeGroups title={t('text-categories')}>
                {categories.map((category: any) => (
                  <Link
                    href={`/${type?.slug}/search/?category=${category.slug}`}
                    key={category.id}
                    className="bg-transparent text-sm text-body transition-colors after:content-[','] last:after:content-[''] hover:text-accent focus:bg-opacity-100 focus:outline-none ltr:pr-0.5 ltr:last:pr-0 rtl:pl-0.5 rtl:last:pl-0"
                  >
                    {category.name}
                  </Link>
                ))}
              </BadgeGroups>
            )}

            {!!tags?.length && (
              <BadgeGroups title={t('text-tags')}>
                {tags.map((tag: any) => (
                  <Link
                    href={`/${type?.slug}/search/?tags=${tag.slug}`}
                    key={tag.id}
                    className="bg-transparent text-sm text-body transition-colors after:content-[','] last:after:content-[''] hover:text-accent focus:bg-opacity-100 focus:outline-none ltr:pr-0.5 ltr:last:pr-0 rtl:pl-0.5 rtl:last:pl-0"
                  >
                    {tag.name}
                  </Link>
                ))}
              </BadgeGroups>
            )}

            <div className="flex w-full flex-col items-start overflow-hidden">
              <span className="pb-3 text-sm font-semibold capitalize text-heading">
                {t('text-sku')}
              </span>
              {hasVariations ? (
                <span
                  className="w-full truncate text-sm text-body"
                  title={selectedVariation.sku ?? 'sku'}
                >
                  {selectedVariation.sku}
                </span>
              ) : (
                <span
                  className="w-full truncate text-sm text-body"
                  title={sku ?? 'sku'}
                >
                  {sku}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Element name="details" className="pt-5 lg:pt-14">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-heading md:mb-6 lg:text-3xl">
          {t('text-details')}
        </h2>
        {content ? (
          <p
            className="text-sm leading-relaxed text-body react-editor-description"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        ) : (
          ''
        )}

        <div className="mt-7 flex flex-col space-y-3">
          {name && (
            <p className="text-sm text-body">
              <span className="font-semibold text-heading ltr:pr-1 rtl:pl-1">
                {t('text-title')} :
              </span>
              {name}
            </p>
          )}
          {author?.name && (
            <p className="flex items-center text-sm text-body">
              <span className="order-1 font-semibold text-heading ltr:pr-1 rtl:pl-1">
                {t('text-author')} :
              </span>
              <Link
                href={Routes.author(author?.slug)}
                className="order-2 hover:text-accent"
              >
                {author?.name}
              </Link>
            </p>
          )}
          {manufacturer?.name && (
            <p className="flex items-center text-sm text-body">
              <span className="order-1 font-semibold text-heading ltr:pr-1 rtl:pl-1">
                {t('text-publisher')} :
              </span>
              <Link
                href={Routes.manufacturer(manufacturer?.slug)}
                className="order-2 hover:text-accent"
              >
                {manufacturer?.name}
              </Link>
            </p>
          )}
        </div>
      </Element>
    </article>
  );
};

export default BookDetails;
