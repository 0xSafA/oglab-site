import { BellIcon } from '@/components/icons/bell-icon';
import { CloseIconNew } from '@/components/icons/close-icon';
import { LangIcon } from '@/components/icons/lang-icon';
import { LongArrowIcon } from '@/components/icons/long-arrow-icon';
import Button from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { isMultiLangEnable } from '@/lib/constants';
import { languageMenu } from '@/lib/locals';
import { drawerAtom } from '@/store/drawer-atom';
import { Attachment } from '@/types';
import classNames from 'classnames';
import { useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface MaintenanceModeProps {
  data: {
    newsLetterTitle?: string;
    newsLetterDescription?: string;
    aboutUsTitle?: string;
    aboutUsDescription?: string;
    contactUsTitle?: string;
    contactDetails?: {
      [key: string]: any;
    };
    title: string;
    description: string;
    buttonTitleOne?: string;
    buttonTitleTwo?: string;
    isOverlayColor?: string;
    overlayColorRange?: string;
    overlayColor?: string;
    image: Attachment;
  };
  renderCountDown: React.ReactNode;
  className?: string;
  showLogo?: boolean;
}

const MaintenanceMode = ({
  data,
  renderCountDown,
  className,
  showLogo = true,
}: MaintenanceModeProps) => {
  const { openModal } = useModalAction();
  const [_, setDrawerView] = useAtom(drawerAtom);
  const { t } = useTranslation('common');
  const [langOnClick, setLangOnClick] = useState<boolean>(false);
  const router = useRouter();
  const { locale, asPath, locales, reload } = router;

  let filterItem = languageMenu?.filter(
    (element) => locales?.includes(element?.value),
  );

  const currentSelectedItem = locale
    ? filterItem?.find((o) => o?.value === locale)!
    : filterItem[2];
  const [selectedItem, setSelectedItem] = useState(currentSelectedItem?.value);

  const openNewsLetterModal = () => {
    openModal('NEWSLETTER_MODAL', {
      title: data?.newsLetterTitle as string,
      description: data?.newsLetterDescription as string,
    });
  };

  const handleItemClick = (item: string) => {
    Cookies.set('NEXT_LOCALE', item, { expires: 365 });
    setSelectedItem(item);
    router.push(asPath, undefined, {
      locale: item,
    });
  };

  const handleSidebar = (view: string) => {
    setDrawerView({
      display: true,
      view,
      data: {
        aboutUsTitle: data?.aboutUsTitle,
        aboutUsDescription: data?.aboutUsDescription,
        contactUsTitle: data?.contactUsTitle,
        contactDetails: data?.contactDetails,
      },
    });
  };

  return (
    <div
      className={twMerge(
        classNames(
          'relative h-screen min-h-[43.75rem] w-full bg-[#e6e5eb] text-center',
          className,
        ),
      )}
    >
      <div className="relative z-20 mx-auto h-[calc(100%-70px)] max-w-7xl px-8">
        {showLogo ? (
          <div className="flex items-center justify-center pt-8">
            <Logo />
          </div>
        ) : (
          ''
        )}
        <div className="relative mt-8 lg:mt-16">
          <div>
            {data?.title ? (
              <h1 className="mb-4 text-xl font-bold tracking-tight text-black lg:mb-8 lg:text-6xl">
                {data?.title}
              </h1>
            ) : (
              ''
            )}
            {data?.description ? (
              <p className="m-0 mx-auto max-w-xl text-base leading-8 text-black lg:text-lg">
                {data?.description}
              </p>
            ) : (
              ''
            )}
            {renderCountDown}
            {data?.buttonTitleOne || data?.buttonTitleTwo ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:mt-16">
                {data?.buttonTitleOne ? (
                  <Button
                    onClick={openNewsLetterModal}
                    className="notify-button group h-auto rounded-full py-2.5 text-sm md:text-base"
                  >
                    {data?.buttonTitleOne}
                    <span className="notify-button-icon flex h-9 w-9 rounded-full bg-accent-hover transition-colors duration-500 group-hover:bg-accent ltr:ml-3 rtl:mr-3">
                      <BellIcon className="m-auto" />
                    </span>
                  </Button>
                ) : (
                  ''
                )}
                {data?.buttonTitleTwo ? (
                  <Button
                    onClick={() => handleSidebar('MAINTENANCE_MORE_INFO')}
                    className="info-button group h-auto rounded-full bg-white py-2.5 text-sm text-slate-700 hover:bg-slate-300 hover:text-slate-600 md:text-base"
                  >
                    {data?.buttonTitleTwo}
                    <span className="info-button-icon flex h-9 w-9 rounded-full bg-slate-300 text-black duration-500 group-hover:bg-slate-400 group-hover:text-white ltr:ml-3 rtl:mr-3 rtl:rotate-180 rtl:transform">
                      <LongArrowIcon className="m-auto text-3xl" />
                    </span>
                  </Button>
                ) : (
                  ''
                )}
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      {data?.image && data?.image?.original ? (
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-no-repeat">
          <Image
            src={data?.image?.original}
            alt="maintenance image"
            fill
            className="object-contain object-bottom"
          />
        </div>
      ) : (
        ''
      )}
      {data?.isOverlayColor ? (
        <div
          style={{
            backgroundColor: data?.overlayColor as string,
            opacity: data?.overlayColorRange as string,
          }}
          className="absolute top-0 left-0 z-10 h-full w-full"
        />
      ) : (
        ''
      )}
      {isMultiLangEnable && !isEmpty(filterItem) ? (
        <div className="fixed bottom-5 right-5 z-50">
          {langOnClick ? (
            <div className="absolute bottom-16 right-1 max-w-md overflow-hidden rounded-2xl bg-white shadow-lg md:bottom-24">
              <div className="bg-[#f0f4f8] px-4 py-5 text-left text-lg font-bold leading-none text-black md:px-8">
                <h3>{t('text-title-change-language')}</h3>
              </div>
              <div className="flex gap-2 px-4 pt-5 pb-2 md:px-8">
                {filterItem?.map((item, index) => {
                  return (
                    <button
                      key={index}
                      className={twMerge(
                        classNames(
                          'relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border-4 border-transparent object-cover transition-all duration-300 md:h-12 md:w-12 [&>svg]:left-0 [&>svg]:top-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full',
                          selectedItem === item?.value ? 'border-accent' : '',
                        ),
                      )}
                      onClick={() => handleItemClick(item?.value)}
                    >
                      {item?.icon}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-1 px-5 pt-2 pb-5 text-left text-base md:px-9">
                <span className="font-medium">{t('text-title-language')}</span>:
                <span className="font-bold">{currentSelectedItem?.name}</span>
              </div>
            </div>
          ) : (
            ''
          )}
          <button
            className={twMerge(
              classNames(
                'fixed right-5 bottom-8 z-50 flex h-10 w-10 cursor-pointer rounded-full bg-accent text-xl text-white md:h-16 md:w-16 md:text-3xl',
                langOnClick ? '' : 'lang-switch-icon',
              ),
            )}
            onClick={() => setLangOnClick(!langOnClick)}
          >
            {langOnClick ? (
              <CloseIconNew className="m-auto" />
            ) : (
              <LangIcon className="m-auto" />
            )}
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default MaintenanceMode;
