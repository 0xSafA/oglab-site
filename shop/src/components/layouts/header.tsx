import LocationBasedShopForm from '@/components/form/location-based-shop-form';
import { CloseIcon } from '@/components/icons/close-icon';
import { MapPin } from '@/components/icons/map-pin';
import { SearchIcon } from '@/components/icons/search-icon';
import GroupsDropdownMenu from '@/components/layouts/menu/groups-menu';
import StaticMenu from '@/components/layouts/menu/static-menu';
import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import CountdownTimer from '@/components/ui/countdown-timer';
import LanguageSwitcher from '@/components/ui/language-switcher';
import Logo from '@/components/ui/logo';
import { Routes } from '@/config/routes';
import { useSettings } from '@/framework/settings';
import { useHeaderSearch } from '@/layouts/headers/header-search-atom';
import {
  RESPONSIVE_WIDTH,
  checkIsMaintenanceModeComing,
  checkIsMaintenanceModeStart,
  checkIsScrollingStart,
  checkIsShopMaintenanceModeComing,
  checkIsShopMaintenanceModeStart,
  isMultiLangEnable,
} from '@/lib/constants';
import { useActiveScroll } from '@/lib/use-active-scroll';
import { useIsHomePage } from '@/lib/use-is-homepage';
import { authorizationAtom } from '@/store/authorization-atom';
import { displayMobileHeaderSearchAtom } from '@/store/display-mobile-header-search-atom';
import { drawerAtom } from '@/store/drawer-atom';
import cn from 'classnames';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useShop } from '@/framework/shop';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';
import { useShopMaintenanceEvent } from '@/framework/shop';
const Search = dynamic(() => import('@/components/ui/search/search'));
const AuthorizedMenu = dynamic(() => import('./menu/authorized-menu'), {
  ssr: false,
});
const JoinButton = dynamic(() => import('./menu/join-button'), { ssr: false });
const HeaderNotification = dynamic(
  () => import('@/components/notifications/header-notification-icon'),
  {
    ssr: false,
  },
);

const Header = ({ layout }: { layout?: string }) => {
  const { t } = useTranslation('common');
  const { show, hideHeaderSearch } = useHeaderSearch();
  const router = useRouter();
  const {
    query: { slug },
  } = router;
  const { data: shopData, isLoading } = useShop({
    slug: slug as string,
    enabled: Boolean(slug),
  });
  const { createShopMaintenanceEventRequest } = useShopMaintenanceEvent();
  const [_, setDrawerView] = useAtom(drawerAtom);
  const [displayMobileHeaderSearch, setDisplayMobileHeaderSearch] = useAtom(
    displayMobileHeaderSearchAtom,
  );
  const [isAuthorize] = useAtom(authorizationAtom);
  const [openDropdown, setOpenDropdown] = useState(false);
  const isHomePage = useIsHomePage();
  const siteHeaderRef = React.useRef(null);
  useActiveScroll(siteHeaderRef);
  const isFlattenHeader = useMemo(
    () => !show && isHomePage && layout !== 'modern',
    [show, isHomePage, layout],
  );

  const handleSidebar = useCallback((view: string) => {
    return setDrawerView({ display: true, view });
  }, []);
  const closeLocation = () => setOpenDropdown(false);
  const { settings } = useSettings();
  const [underMaintenanceIsComing] = useAtom(checkIsMaintenanceModeComing);
  const [shopUnderMaintenanceIsComing] = useAtom(
    checkIsShopMaintenanceModeComing,
  );
  const [__, setUnderMaintenanceStart] = useAtom(checkIsMaintenanceModeStart);
  const [___, setShopUnderMaintenanceStart] = useAtom(
    checkIsShopMaintenanceModeStart,
  );
  const [isScrolling] = useAtom(checkIsScrollingStart);
  const { width } = useWindowSize();
  return (
    <>
      <header
        id="site-header"
        ref={siteHeaderRef}
        className={twMerge(
          cn('site-header-with-search top-0 z-50 w-full transition-all', {
            '': isFlattenHeader,
            'sticky lg:fixed': isHomePage,
            'sticky border-b border-border-200 shadow-sm': !isHomePage,
            'lg:h-22': !underMaintenanceIsComing,
            'lg:h-auto': shopUnderMaintenanceIsComing,
          }),
        )}
      >
        {width >= RESPONSIVE_WIDTH &&
        underMaintenanceIsComing &&
        !isScrolling &&
        !shopUnderMaintenanceIsComing ? (
          <Alert
            message={`Site ${t('text-maintenance-mode-title')}`}
            variant="info"
            className="sticky top-0 left-0 z-50"
            childClassName="flex justify-center font-bold items-center w-full gap-4"
          >
            <CountdownTimer
              date={new Date(settings?.maintenance?.start as string)}
              className="text-blue-600 [&>p]:bg-blue-200 [&>p]:p-2 [&>p]:text-xs [&>p]:text-blue-600"
              onComplete={() => setUnderMaintenanceStart(true)}
            />
          </Alert>
        ) : (
          ''
        )}
        {width >= RESPONSIVE_WIDTH &&
        !underMaintenanceIsComing &&
        !isScrolling &&
        shopUnderMaintenanceIsComing &&
        !isLoading &&
        shopData ? (
          <Alert
            message={`${shopData?.name} ${t('text-maintenance-mode-title')}`}
            variant="info"
            className="sticky top-0 left-0 z-50"
            childClassName="flex justify-center items-center font-bold w-full gap-4"
          >
            <CountdownTimer
              date={
                new Date(shopData?.settings?.shopMaintenance?.start as string)
              }
              className="text-blue-600 [&>p]:bg-blue-200 [&>p]:p-2 [&>p]:text-xs [&>p]:text-blue-600"
              onComplete={() => {
                setShopUnderMaintenanceStart(true);
                createShopMaintenanceEventRequest({
                  shop_id: shopData?.id,
                  isMaintenance: true,
                  isShopUnderMaintenance: Boolean(
                    shopData?.settings?.isShopUnderMaintenance,
                  ),
                });
              }}
            />
          </Alert>
        ) : (
          ''
        )}
        <div
          className={cn(
            'fixed inset-0 -z-10 h-[100vh] w-full bg-black/50',
            openDropdown === true ? '' : 'hidden',
          )}
          onClick={closeLocation}
        ></div>
        <div>
          <div
            className={cn(
              'flex w-full transform-gpu items-center justify-between bg-light px-5 transition-transform duration-300 lg:h-22 lg:px-6 2xl:px-8',
              {
                'lg:absolute lg:border-0 lg:bg-transparent lg:shadow-none':
                  isFlattenHeader,
                'lg:!bg-light': openDropdown,
              },
            )}
          >
            <motion.button
              onClick={() => handleSidebar('MAIN_MENU_VIEW')}
              className="group hidden h-full w-6 shrink-0 items-center justify-center focus:text-accent focus:outline-0 ltr:mr-6 rtl:ml-6 lg:flex xl:hidden"
            >
              <span className="sr-only">{t('text-burger-menu')}</span>
              <div className="flex w-full flex-col space-y-1.5">
                <span className="h-0.5 w-1/2 rounded bg-gray-600 transition-all group-hover:w-full" />
                <span className="h-0.5 w-full rounded bg-gray-600 transition-all group-hover:w-3/4" />
                <span className="h-0.5 w-3/4 rounded bg-gray-600 transition-all group-hover:w-full" />
              </div>
            </motion.button>
            <div className="flex shrink-0 grow-0 basis-auto flex-wrap items-center ltr:mr-auto rtl:ml-auto lg:w-auto lg:flex-nowrap">
              <Logo
                className={cn(
                  'py-3',
                  !isMultiLangEnable ? 'mx-auto lg:mx-0' : 'ltr:ml-0 rtl:mr-0 ',
                )}
              />

              {/* {isMultiLangEnable ? (
              <div className="ltr:pr-4 rtl:pl-4 lg:hidden">
                <LanguageSwitcher />
              </div>
            ) : null} */}

              <div className="hidden ltr:ml-10 ltr:mr-auto rtl:mr-10 rtl:ml-auto xl:block">
                <GroupsDropdownMenu />
              </div>
            </div>

            {isHomePage ? (
              <>
                {(displayMobileHeaderSearch && show) ||
                (displayMobileHeaderSearch && layout === 'modern') ? (
                  <div className="absolute top-0 z-20 flex h-full w-full items-center justify-center space-x-4 border-b-accent-300 bg-light px-5 py-1.5 backdrop-blur ltr:left-0 rtl:right-0 rtl:space-x-reverse lg:border lg:bg-opacity-30">
                    <Search
                      label={t('text-search-label')}
                      variant="minimal"
                      className="lg:max-w-3xl"
                      inputClassName="lg:border-accent-400"
                    />
                    <Button
                      variant="custom"
                      onClick={() =>
                        setDisplayMobileHeaderSearch((prev) => !prev)
                      }
                      className="hidden border border-accent-400 bg-gray-100 !px-4 text-accent lg:inline-flex"
                    >
                      <CloseIcon className="h-5 w-5" />
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
            {/* <button
          className="px-10 ltr:ml-auto rtl:mr-auto"
          onClick={() => openModal('LOCATION_BASED_SHOP')}
        >
          Map
        </button> */}
            <div className="flex shrink-0 items-center space-x-7 rtl:space-x-reverse 2xl:space-x-10">
              <ul className="hidden shrink-0 items-center space-x-7 rtl:space-x-reverse xl:flex 2xl:space-x-10">
                <StaticMenu />
              </ul>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {(isHomePage && show) || (isHomePage && layout === 'modern') ? (
                  <Button
                    variant="custom"
                    className="hidden h-[38px] w-[38px] items-center  gap-2 rounded-full border border-border-200 bg-light !p-1 text-sm !font-normal focus:!shadow-none focus:!ring-0 md:text-base lg:!flex"
                    onClick={() =>
                      setDisplayMobileHeaderSearch((prev) => !prev)
                    }
                  >
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                ) : null}
                {settings?.useGoogleMap && (
                  <div
                    className={cn(
                      'relative flex justify-center lg:w-auto lg:border-none',
                      isFlattenHeader || (isHomePage && 'flex'),
                      // isFlattenHeader || (isHomePage && 'lg:hidden 2xl:flex')
                      // {
                      //   'lg:hidden xl:flex': !isFlattenHeader,
                      //   'lg:flex': !isHomePage,
                      // }
                    )}
                  >
                    <Button
                      variant="custom"
                      className="!flex h-[38px] w-[38px] max-w-full items-center gap-2 rounded-full border border-border-200 bg-light !p-1 text-sm !font-normal focus:!shadow-none focus:!ring-0 md:text-base"
                      onClick={() => setOpenDropdown(!openDropdown)}
                    >
                      <span className="flex shrink-0 grow-0 basis-auto items-center gap-1 text-base text-gray-700">
                        <MapPin className="h-5 w-5 " />
                      </span>
                    </Button>
                    <LocationBasedShopForm
                      className={cn(
                        'fixed inset-x-0 top-[60px] mx-auto bg-white lg:top-[82px]',
                        openDropdown === true ? '' : 'hidden',
                      )}
                      closeLocation={closeLocation}
                    />
                  </div>
                )}

                <HeaderNotification
                  isAuthorize={isAuthorize}
                  isEnable={Boolean(settings?.enableEmailForDigitalProduct)}
                />

                {isMultiLangEnable ? (
                  <div className="ms-auto shrink-0">
                    <LanguageSwitcher />
                  </div>
                ) : null}

                <div className="hidden lg:inline-flex">
                  {isAuthorize ? <AuthorizedMenu /> : <JoinButton />}
                </div>
                <Link
                  href={Routes.becomeSeller}
                  className="hidden h-9 shrink-0 items-center justify-center rounded border border-transparent bg-accent px-3 py-0 text-sm font-semibold leading-none text-light outline-none transition duration-300 ease-in-out hover:bg-accent-hover focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700 sm:inline-flex"
                >
                  {t('text-become-seller')}
                </Link>
              </div>
            </div>
          </div>
          {/* <div
          className={cn(
            'w-full border-b border-t border-border-200 bg-light shadow-sm 2xl:border-t-0',
            isHomePage ? 'hidden lg:block' : 'hidden'
          )}
        >
          {settings?.useGoogleMap && (
            <div
              className={cn(
                'relative flex w-full justify-center border-t before:absolute before:inset-y-0 before:my-auto before:h-8 before:w-[1px] lg:w-auto lg:border-none lg:before:w-0 lg:before:bg-[#E5E7EB] 2xl:ltr:pl-8 2xl:rtl:pr-8',
                isFlattenHeader ? 'hidden' : 'lg:flex 2xl:hidden'
              )}
            >
              <Button
                variant="custom"
                className="flex items-center gap-2 focus:!shadow-none focus:!ring-0"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <span className="flex items-center gap-1 text-base text-accent">
                  <MapPin className="w-4 h-4 " />
                  <span className="hidden md:block">Find Locations :</span>
                </span>
                {getLocation ? (
                  <span className="flex items-center gap-2 pl-1">
                    {' '}
                    {getLocation}
                  </span>
                ) : (
                  <span className="flex items-center gap-2 pl-1">
                    {' '}
                    Enter your address
                  </span>
                )}
                <ArrowDownIcon
                  className={cn(
                    'mt-1 h-2.5 w-2.5 text-accent transition-all',
                    openDropdown ? 'rotate-180' : ''
                  )}
                />
              </Button>
              <LocationBasedShopForm
                className={cn(
                  'fixed inset-x-0 top-14 mx-auto bg-white md:top-[109px] lg:top-[128px]',
                  openDropdown === true ? '' : 'hidden'
                )}
                closeLocation={closeLocation}
              />
            </div>
          )}
        </div> */}
        </div>
      </header>
    </>
  );
};

export default Header;
