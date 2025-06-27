import { useRef } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
import { ArrowPrevIcon } from '@/components/icons/arrow-prev';
import { ArrowNextIcon } from '@/components/icons/arrow-next';
import { Swiper, SwiperSlide, Navigation } from '@/components/ui/slider';
import { productPlaceholder } from '@/lib/placeholders';
import { Image } from '@/components/ui/image';

interface CategoryItemProps {
  item: any;
}
const CategoryItem: React.FC<CategoryItemProps> = ({ item }) => {
  const router = useRouter();

  const { pathname, query } = router;
  const selectedQueries = query.category;

  const onCategoryClick = (slug: string) => {
    if (selectedQueries === slug) {
      const { category, ...rest } = query;
      router.push(
        {
          pathname,
          query: { ...rest },
        },
        undefined,
        {
          scroll: false,
        },
      );
      return;
    }
    router.push(
      {
        pathname,
        query: { ...query, category: slug },
      },
      undefined,
      {
        scroll: false,
      },
    );
  };

  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded border-2 bg-light text-center md:py-2',
        selectedQueries === item.slug ? 'border-accent' : 'border-light',
      )}
      role="button"
      onClick={() => onCategoryClick(item?.slug!)}
    >
      <div className="relative flex items-center justify-center w-auto my-3.5 mb-3 overflow-hidden h-28">
        <Image
          src={item?.image?.original! ?? productPlaceholder}
          alt={item?.name!}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-contain"
        />
      </div>
      <span className="block px-4 pb-4 text-sm font-semibold text-center md:pt-1 text-heading">
        {item.name}
      </span>
    </div>
  );
};

function SolidBoxedCategoryMenu({ items }: any) {
  const { t } = useTranslation('common');
  const { isRTL } = useIsRTL();

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const breakpoints = {
    320: {
      slidesPerView: 2,
    },

    440: {
      slidesPerView: 3,
    },

    620: {
      slidesPerView: 4,
    },

    820: {
      slidesPerView: 5,
    },

    1100: {
      slidesPerView: 6,
    },

    1280: {
      slidesPerView: 7,
    },
  };

  return (
    <div className="relative">
      <Swiper
        id="category-card-menu"
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current!, // Assert non-null
          nextEl: nextRef.current!, // Assert non-null
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
        }}
        breakpoints={breakpoints}
        // slidesPerView={7}
        spaceBetween={12}
      >
        {items?.map((category: any, idx: number) => (
          <SwiperSlide key={idx}>
            <CategoryItem item={category} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        ref={prevRef}
        className="absolute z-10 flex items-center justify-center w-8 h-8 -mt-4 rounded-full outline-none cursor-pointer category-slider-prev top-1/2 bg-light text-heading shadow-300 focus:outline-none ltr:-left-3 rtl:-right-3 ltr:lg:-left-4"
      >
        <span className="sr-only">{t('text-previous')}</span>
        {isRTL ? <ArrowNextIcon /> : <ArrowPrevIcon />}
      </div>
      <div
        ref={nextRef}
        className="absolute z-10 flex items-center justify-center w-8 h-8 -mt-4 rounded-full outline-none cursor-pointer category-slider-next top-1/2 bg-light text-heading shadow-300 focus:outline-none ltr:-right-3 rtl:-left-3 ltr:lg:-right-4 rtl:lg:-left-4"
      >
        <span className="sr-only">{t('text-next')}</span>
        {isRTL ? <ArrowPrevIcon /> : <ArrowNextIcon />}
      </div>
    </div>
  );
}

export default SolidBoxedCategoryMenu;
