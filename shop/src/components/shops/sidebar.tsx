import cn from 'classnames';
import { Image } from '@/components/ui/image';
import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/lib/format-address';
import isEmpty from 'lodash/isEmpty';
import ReadMore from '@/components/ui/truncate';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Scrollbar from '@/components/ui/scrollbar';
import { getIcon } from '@/lib/get-icon';
import { productPlaceholder } from '@/lib/placeholders';
import * as socialIcons from '@/components/icons/social';
import type { Shop } from '@/types';
import { useSettings } from '@/framework/settings';
import dayjs from 'dayjs';
import { ShopFaqIcon } from '@/components/icons/shop/faq';
import { ShopWebIcon } from '@/components/icons/shop/web';
import { ShopContactIcon } from '@/components/icons/shop/contact';
import { ShopTermsIcon } from '@/components/icons/shop/terms';
import { ShopCouponIcon } from '@/components/icons/shop/coupon';
import { Routes } from '@/config/routes';
import Link from 'next/link';

type ShopSidebarProps = {
  shop: Shop | any;
  className?: string;
  cardClassName?: string;
};

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  shop,
  className,
  cardClassName,
}) => {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const { settings } = useSettings();

  function handleMoreInfoModal() {
    return openModal('SHOP_INFO', { shop });
  }
  return (
    <>
      <div
        className={cn(
          'sticky top-14 z-10 flex w-full items-center border-b border-gray-300 bg-light py-4 px-6 lg:hidden',
          cardClassName,
        )}
      >
        <div className="relative w-16 h-16 mx-auto overflow-hidden bg-gray-200 border border-gray-100 rounded-lg shrink-0 ltr:mr-4 rtl:ml-4">
          <Image
            alt={t('logo')}
            src={shop?.logo?.original! ?? productPlaceholder}
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>

        <div className="w-full">
          <h3 className="text-base font-semibold text-heading">{shop?.name}</h3>

          <button
            className="text-sm font-semibold transition text-accent hover:text-accent-hover"
            onClick={handleMoreInfoModal}
          >
            {t('text-more-info')}
          </button>
        </div>
      </div>

      <aside
        className={cn(
          'hidden h-full w-full bg-light md:rounded lg:block lg:w-80 2xl:w-96',
          className,
        )}
      >
        <div className="max-h-full overflow-hidden">
          <Scrollbar className={cn('w-full', 'scrollbar_height')}>
            <div className="flex flex-col h-full">
              <div className="flex flex-col w-full p-6 border-b border-gray-200">
                <div className="flex items-center justify-start mb-4">
                  <div className="flex items-center justify-center w-24 h-24 border border-gray-200 rounded-full shrink-0">
                    <div className="relative w-[calc(100%-8px)] h-[calc(100%-8px)] overflow-hidden bg-gray-200 rounded-full">
                      <Image
                        alt={t('logo')}
                        src={shop?.logo?.original! ?? productPlaceholder}
                        fill
                        sizes="(max-width: 768px) 100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="ltr:pl-2.5 rtl:pr-2.5 ">
                    <div className="text-sm text-gray-400">
                      Since {dayjs(shop?.created_at).format('YYYY')}
                    </div>
                    <h3 className="mb-2 overflow-hidden text-lg font-semibold truncate text-heading">
                      {shop?.name}
                    </h3>

                    <div className="flex flex-wrap text-sm rounded gap-x-4">
                      <div className="flex justify-center gap-1.5 text-gray-500">
                        <div className="font-medium text-heading">
                          {shop.products_count}
                        </div>
                        {t('text-products')}
                      </div>
                      {/* <div className="flex justify-center gap-1.5 text-gray-500">
                        <div className="font-medium text-heading">0</div>
                        reviews
                      </div> */}
                    </div>
                  </div>
                </div>

                {shop?.description && (
                  <div className="text-sm leading-relaxed text-body">
                    <ReadMore character={70}>{shop?.description}</ReadMore>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] text-sm gap-1.5 p-6">
                {settings?.enableCoupons ? (
                  <Link
                    className="flex flex-col items-center justify-center p-2 pt-3.5 pb-3 text-gray-500 rounded bg-gray-50 group hover:text-accent hover:bg-accent/10 transition-all"
                    href={`/shops/${shop?.slug}${Routes.coupons}`}
                  >
                    <ShopCouponIcon className="w-7 h-7" />
                    <span className="pt-2 text-sm">Coupons</span>
                  </Link>
                ) : null}

                <Link
                  href={`/shops/${shop?.slug}${Routes.contactUs}`}
                  className="flex flex-col items-center justify-center p-2 pt-3.5 pb-3 text-gray-500 rounded bg-gray-50 group hover:text-accent hover:bg-accent/10 transition-all"
                >
                  <ShopContactIcon className="w-6 h-6" />
                  <span className="pt-2 text-sm">Contact</span>
                </Link>
                {shop?.settings?.website ? (
                  <a
                    href={shop.settings.website}
                    target="_blank"
                    className="flex flex-col items-center justify-center p-2 pt-3.5 pb-3 text-gray-500 rounded bg-gray-50 group hover:text-accent hover:bg-accent/10 transition-all"
                    rel="noreferrer"
                  >
                    <ShopWebIcon className="w-6 h-6" />
                    <span className="pt-2 text-sm"> {t('text-website')}</span>
                  </a>
                ) : null}

                {settings?.enableTerms ? (
                  <Link
                    href={`/shops/${shop?.slug}${Routes.terms}`}
                    className="flex flex-col items-center justify-center p-2 pt-3.5 pb-3 text-gray-500 rounded bg-gray-50 group hover:text-accent hover:bg-accent/10 transition-all"
                  >
                    <ShopTermsIcon className="w-[26px] h-[26px]" />
                    <span className="pt-2 text-sm">Terms</span>
                  </Link>
                ) : null}

                <Link
                  href={`/shops/${shop?.slug}/faqs`}
                  className="flex flex-col items-center justify-center p-2 pt-3.5 pb-3 text-gray-500 rounded bg-gray-50 group hover:text-accent hover:bg-accent/10 transition-all"
                >
                  <ShopFaqIcon className="w-7 h-7" />
                  <span className="pt-2 text-sm">FAQs</span>
                </Link>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex flex-col mb-5 last:mb-0">
                  <span className="mb-1.5 text-sm font-semibold text-heading">
                    {t('text-address')}
                  </span>
                  <p className="text-sm text-body">
                    {!isEmpty(formatAddress(shop?.address))
                      ? formatAddress(shop?.address)
                      : t('common:text-no-address')}
                  </p>
                </div>
                {shop?.settings?.contact ? (
                  <div className="flex flex-col mb-5 last:mb-0">
                    <span className="mb-1.5 text-sm font-semibold text-heading">
                      {t('text-phone')}
                    </span>
                    <p className="text-sm text-body">
                      {shop?.settings?.contact
                        ? shop?.settings?.contact
                        : t('text-no-contact')}
                    </p>
                  </div>
                ) : null}

                {shop?.settings?.socials.length > 0 ? (
                  <div className="flex flex-col mb-5 last:mb-0">
                    <span className="mb-2 text-sm font-semibold text-heading">
                      {t('text-follow-us')}
                    </span>
                    <div className="flex items-center justify-start">
                      {shop?.settings?.socials?.map(
                        (item: any, index: number) => (
                          <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            className={`text-muted transition-colors duration-300 focus:outline-none ltr:mr-3.5 ltr:last:mr-0 rtl:ml-3.5 rtl:last:ml-0 hover:${item.hoverClass}`}
                            rel="noreferrer"
                          >
                            {getIcon({
                              iconList: socialIcons,
                              iconName: item.icon,
                              className: 'w-3 h-3',
                            })}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Scrollbar>
        </div>
      </aside>
    </>
  );
};

export default ShopSidebar;
