import Image from 'next/image';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useIsRTL } from '@/lib/locals';
import { ChevronLeft } from '@/components/icons/chevron-left';
import { ChevronRight } from '@/components/icons/chevron-right';
import {
  Swiper,
  SwiperSlide,
  SwiperOptions,
  Navigation,
} from '@/components/ui/slider';
import useSwiperRef from '@/lib/hooks/use-swiper-ref';

const swiperParams: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
};

const ReviewImageModal = () => {
  const { data } = useModalState();
  const { isRTL } = useIsRTL();

  const [nextEl, nextRef] = useSwiperRef<HTMLDivElement>();
  const [prevEl, prevRef] = useSwiperRef<HTMLDivElement>();

  return (
    <div className="m-auto block w-full max-w-[680px] rounded bg-light p-3">
      <div className="relative">
        <Swiper
          id="review-gallery"
          modules={[Navigation]}
          initialSlide={data?.initSlide ?? 0}
          onSwiper={(swiper) => {
            setTimeout(() => {
              swiper.navigation.init();
            }, 100);
          }}
          loop={data?.images?.length > 1}
          navigation={{
            prevEl,
            nextEl,
          }}
          {...swiperParams}
        >
          {data?.images?.map((item: any) => (
            <SwiperSlide
              key={`review-gallery-${item.id}`}
              className="flex items-center justify-center selection:bg-transparent"
            >
              <Image
                src={item?.original ?? '/product-placeholder-borderless.svg'}
                alt={`Review gallery ${item.id}`}
                width={600}
                height={600}
                objectFit="contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {data?.images?.length > 1 && (
          <>
            <div
              ref={prevRef}
              className="absolute z-10 flex items-center justify-center w-8 h-8 -mt-4 transition-all duration-200 border rounded-full shadow-xl cursor-pointer review-gallery-prev top-2/4 border-border-200 border-opacity-70 bg-light text-heading hover:bg-gray-100 ltr:left-2 rtl:right-2 md:-mt-5 md:h-9 md:w-9 ltr:md:left-3 rtl:md:right-3"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </div>
            <div
              ref={nextRef}
              className="absolute z-10 flex items-center justify-center w-8 h-8 -mt-4 transition-all duration-200 border rounded-full shadow-xl cursor-pointer review-gallery-next top-2/4 border-border-200 border-opacity-70 bg-light text-heading hover:bg-gray-100 ltr:right-2 rtl:left-2 md:-mt-5 md:h-9 md:w-9 ltr:md:right-3 rtl:md:left-3"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewImageModal;
