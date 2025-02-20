import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
import { ArrowPrevIcon } from '@/components/icons/arrow-prev';
import { ArrowNextIcon } from '@/components/icons/arrow-next';
import {
  Swiper,
  SwiperSlide,
  Navigation,
  SwiperOptions,
} from '@/components/ui/slider';
import classNames from 'classnames';

interface CarouselProps extends SwiperOptions {
  items: any[];
  children: (item: { [key: string]: any }) => React.ReactNode;
  className?: string;
  breakpoints?: any;
}

/**
 * Common carousel
 * @param items any[]
 * @param children (item: { [key: string]: any }) => React.ReactNode
 * @param className string
 * @param rest SwiperOptions
 * @returns
 */

const initialBreakpoints = {
  320: {
    slidesPerView: 1,
    spaceBetween: 20,
  },

  480: {
    slidesPerView: 2,
    spaceBetween: 20,
  },

  700: {
    slidesPerView: 3,
  },

  900: {
    slidesPerView: 4,
  },

  1100: {
    slidesPerView: 5,
  },

  1280: {
    slidesPerView: 6,
    spaceBetween: 24,
  },
  1400: {
    slidesPerView: 7,
    spaceBetween: 30,
  },
  1700: {
    slidesPerView: 8,
    spaceBetween: 30,
  },
  2600: {
    slidesPerView: 10,
    spaceBetween: 40,
  },
};

const Carousel = ({
  items,
  children,
  className,
  breakpoints,
  ...rest
}: CarouselProps) => {
  const { t } = useTranslation('common');
  const { isRTL } = useIsRTL();

  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

  return (
    <div className={classNames('relative', className)}>
      <Swiper
        id="author-card-menu"
        className="!px-3"
        modules={[Navigation]}
        navigation={{
          prevEl,
          nextEl,
          // prevEl: prevRef.current!, // Assert non-null
          // nextEl: nextRef.current!, // Assert non-null
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
        }}
        breakpoints={breakpoints ? breakpoints : initialBreakpoints}
        {...rest}
      >
        {items?.map((item: any, idx: number) => (
          <SwiperSlide key={idx} className="py-2 carousel-slide">
            {children(item)}
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        ref={(node) => setPrevEl(node)}
        // ref={prevRef}
        className="author-slider-prev absolute top-1/2 z-[5] -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-light text-heading shadow-300 outline-none transition-colors hover:text-orange-500 focus:outline-none ltr:-left-3 rtl:-right-3 ltr:lg:-left-4 rtl:lg:-right-4"
      >
        <span className="sr-only">{t('text-previous')}</span>
        {isRTL ? <ArrowNextIcon /> : <ArrowPrevIcon />}
      </div>
      <div
        ref={(node) => setNextEl(node)}
        // ref={nextRef}
        className="author-slider-next absolute top-1/2 z-[5] -mt-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-light text-heading shadow-300 outline-none transition-colors hover:text-orange-500 focus:outline-none ltr:-right-3 rtl:-left-3 ltr:lg:-right-4 rtl:lg:-left-4"
      >
        <span className="sr-only">{t('text-next')}</span>
        {isRTL ? <ArrowPrevIcon /> : <ArrowNextIcon />}
      </div>
    </div>
  );
};

export default Carousel;
