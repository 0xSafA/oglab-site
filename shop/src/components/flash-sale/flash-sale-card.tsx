import { Image } from '@/components/ui/image';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import Link from 'next/link';
import dayjs from 'dayjs';
import { FlashSale } from '@/types';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

type FlashSaleCardProps = {
  flashSale: FlashSale;
  className?: string;
};

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  flashSale,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <Link
      href={Routes?.flashSaleSingle(flashSale?.slug)}
      className={twMerge(
        classNames('relative block overflow-hidden', className)
      )}
    >
      <div className="relative mb-4 h-52 overflow-hidden rounded-md bg-gray-300 md:mb-6 xl:h-60 2xl:h-[21.6875rem]">
        {flashSale?.image?.original ? (
          <div
            className="blur- absolute top-0 left-0 h-full w-full bg-cover bg-center bg-no-repeat blur-sm"
            style={{ backgroundImage: `url(${flashSale?.image?.original})` }}
          ></div>
        ) : (
          ''
        )}
        <Image
          alt={flashSale?.title}
          src={flashSale?.image?.original ?? '/flash-sale-fallback.png'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          quality={100}
          style={{
            objectFit: 'contain',
          }}
        />
      </div>
      {flashSale?.title ? (
        <h2 className="mb-3 text-base font-semibold text-muted-black md:text-lg">
          {flashSale?.title?.length > 50
            ? flashSale?.title?.substring(0, 50) + '...'
            : flashSale?.title}
        </h2>
      ) : (
        ''
      )}
      <ul className="space-y-2 text-base [&>li>p]:font-normal [&>li>p]:text-[#666] [&>li>span]:font-semibold [&>li>span]:text-muted-black [&>li]:flex [&>li]:items-center [&>li]:gap-2">
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

        <li>
          <span>Campaign status : </span>
          <p>{flashSale?.sale_status ? 'On going' : 'On hold'}</p>
        </li>

        {flashSale?.type ? (
          <li>
            <span>Campaign type on : </span>
            <p>{t(flashSale?.type)}</p>
          </li>
        ) : (
          ''
        )}

        {flashSale?.rate ? (
          <li>
            <span>Deals rate : </span>
            <p>{flashSale?.rate}</p>
          </li>
        ) : (
          ''
        )}
      </ul>
    </Link>
  );
};

export default FlashSaleCard;
