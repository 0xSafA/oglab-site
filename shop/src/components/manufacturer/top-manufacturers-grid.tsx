import NotFound from '@/components/ui/not-found';
import Carousel from '@/components/ui/carousel';
import ManufacturerCard from '@/components/manufacturer/card';
import SectionBlock from '@/components/ui/section-block';
import { Routes } from '@/config/routes';
import ErrorMessage from '@/components/ui/error-message';
import { useTopManufacturers } from '@/framework/manufacturer';
import ManufacturerLoader from '@/components/ui/loaders/manufacturer-loader';
import rangeMap from '@/lib/range-map';
import { useRouter } from 'next/router';

const breakpoints = {
  320: {
    slidesPerView: 1,
    spaceBetween: 20,
  },

  600: {
    slidesPerView: 2,
    spaceBetween: 20,
  },

  960: {
    slidesPerView: 3,
    spaceBetween: 20,
  },

  1280: {
    slidesPerView: 4,
    spaceBetween: 20,
  },

  1600: {
    slidesPerView: 5,
    spaceBetween: 30,
  },
  2600: {
    slidesPerView: 7,
    spaceBetween: 30,
  },
};

type TopManufacturersGridProps = {
  title?: string;
};

const TopManufacturersGrid: React.FC<TopManufacturersGridProps> = ({
  title,
}) => {
  const { query } = useRouter();
  const { manufacturers, isLoading, error } = useTopManufacturers({
    limit: 10,
    ...(query?.pages && { type: query?.pages[0] as string }),
  });

  if (error) return <ErrorMessage message={error.message} />;

  if (isLoading && manufacturers.length) {
    return (
      <SectionBlock title={title} href={Routes.manufacturers}>
        <div className="">
          <div className="grid w-full grid-flow-col gap-6">
            {rangeMap(4, (i) => (
              <ManufacturerLoader key={i} uniqueKey={`manufacturer-${i}`} />
            ))}
          </div>
        </div>
      </SectionBlock>
    );
  }
  return (
    <SectionBlock title={title} href={Routes.manufacturers}>
      {!isLoading && !manufacturers.length ? (
        <div className="min-h-full pt-6 pb-8 px-9 lg:p-8">
          <NotFound text="text-no-manufacturers" className="h-96" />
        </div>
      ) : (
        <div>
          <Carousel items={manufacturers} breakpoints={breakpoints}>
            {(item) => <ManufacturerCard item={item} />}
          </Carousel>
        </div>
      )}
    </SectionBlock>
  );
};

export default TopManufacturersGrid;
