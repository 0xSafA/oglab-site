import { FlashSale, Product, SingleFlashSale } from '@/types';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import { isArray, isEmpty } from 'lodash';
import Fluorine from '@/components/products/cards/fluorine';
import CountdownTimer from '@/components/ui/countdown-timer';
import NotFound from '@/components/ui/not-found';
import { useSettings } from '@/framework/settings';
import { useSanitizeContent } from '@/lib/sanitize-content';

type DetailsViewProps = {
  flashSale: FlashSale;
  products: FlashSale['products'];
  className?: string;
};

const DetailsView: React.FC<DetailsViewProps> = ({
  flashSale,
  products,
  className,
}) => {
  const { t } = useTranslation();
  const containerClass = 'px-4 md:px-8 lg:px-16 2xl:px-52';
  const { settings } = useSettings();
  const currency = settings?.currency;
  const content = useSanitizeContent({ description: flashSale?.description });
  return (
    <div className={twMerge(classNames('bg-white', className))}>
      <>
        <div className="relative h-80 overflow-hidden md:h-[31.25rem] lg:h-[43.75rem]">
          <Image
            src={flashSale?.cover_image?.original ?? '/flash-sale-fallback.png'}
            fill
            // width={2000}
            // height={700}
            sizes="(max-width: 768px) 100vw"
            alt={String(flashSale?.title)}
            className="block w-full h-full 2xl:object-cover"
          />
        </div>
        <div
          className={twMerge(classNames('bg-[#EAF9F0] py-7', containerClass))}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <CountdownTimer
              date={
                new Date(
                  flashSale?.sale_status
                    ? flashSale?.end_date
                    : flashSale?.start_date,
                )
              }
              title={
                flashSale?.sale_status ? 'Sale Ends In:' : 'Sale Starts In:'
              }
            />
          </div>
        </div>
      </>
      <div className={twMerge(classNames('bg-white py-10', containerClass))}>
        {flashSale?.title ? (
          <h3 className="mb-4 text-xl font-semibold text-muted-black lg:text-2xl">
            {flashSale?.title}
          </h3>
        ) : (
          ''
        )}

        {content ? (
          <div
            className="mb-8 text-base leading-[180%] text-[#666] lg:text-lg react-editor-description"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          />
        ) : (
          ''
        )}

        <ul className="space-y-2 text-base lg:space-y-3 [&>li>p]:font-normal [&>li>p]:text-base-dark [&>li>span]:font-semibold [&>li>span]:text-muted-black [&>li]:flex [&>li]:items-center [&>li]:gap-2">
          <li>
            <span>Campaign status : </span>
            <p>{flashSale?.sale_status ? 'On going' : 'On hold'}</p>
          </li>

          {flashSale?.start_date || flashSale?.end_date ? (
            <li>
              <span>Offer Till: </span>
              <p>
                {dayjs(flashSale?.start_date).format('DD MMM YYYY')} -{' '}
                {dayjs(flashSale?.end_date).format('DD MMM YYYY')}
              </p>
            </li>
          ) : (
            ''
          )}

          {flashSale?.type ? (
            <li>
              <span>Campaign type : </span>
              <p>on {t(flashSale?.type)}</p>
            </li>
          ) : (
            ''
          )}

          {flashSale?.rate ? (
            <li>
              <span>Deals rate : </span>
              <p>
                {flashSale?.type === 'fixed_rate' && currency + ' '}
                {flashSale?.rate}
                {flashSale?.type === 'percentage' ? '% Off.' : ' Off.'}
              </p>
            </li>
          ) : (
            ''
          )}
        </ul>
      </div>
      <div
        className={twMerge(
          classNames('relative bg-[#F9F9F9] py-16 sm:py-20', containerClass),
        )}
      >
        {!isEmpty(products) ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {isArray(products) &&
              products?.map((product: Product, index: number) => {
                // TODO: Product grid should be independent to show some specific data only.
                return (
                  <Fluorine
                    key={index}
                    product={product}
                    type={flashSale?.type}
                    rate={flashSale?.rate}
                    sale_status={flashSale?.sale_status}
                    //@ts-ignore
                    currency={currency}
                    start_date={dayjs(flashSale?.start_date).format(
                      'DD-MMM-YYYY',
                    )}
                    end_date={dayjs(flashSale?.end_date).format('DD-MMM-YYYY')}
                  />
                );
              })}
          </div>
        ) : (
          <NotFound text="text-not-found" className="h-96" />
        )}
      </div>
    </div>
  );
};

export default DetailsView;
