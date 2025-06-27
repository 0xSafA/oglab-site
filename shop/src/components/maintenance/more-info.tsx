import SuperAdminContactForm from '@/components/settings/super-admin-contact-form';
import { GoogleMapLocation } from '@/types';
import { MapPinNew } from '@/components/icons/map-pin';
import Link from '@/components/ui/link';
import { MobileIconNew } from '@/components/icons/mobile-icon';
import { HomeIconNew } from '@/components/icons/home-icon-new';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
const JoinButton = dynamic(
  () => import('@/components/layouts/menu/join-button'),
  { ssr: false }
);
import { CloseIcon } from '@/components/icons/close-icon';
import { drawerAtom } from '@/store/drawer-atom';
import { useAtom } from 'jotai';

type ContactDetailsProps = {
  contact: string;
  emailAddress: string;
  website: string;
  location: GoogleMapLocation;
  socials: {
    icon: string;
    url: string;
  }[];
};

const MoreInfo = ({
  variables: {
    aboutUsDescription,
    aboutUsTitle,
    contactUsTitle,
    contactDetails,
  },
}: {
  variables: {
    aboutUsDescription: string;
    aboutUsTitle: string;
    contactUsTitle: string;
    contactDetails: ContactDetailsProps;
  };
}) => {
  const { t } = useTranslation('common');
  const [_, closeSidebar] = useAtom(drawerAtom);
  return (
    <>
      <div className="sticky top-0 left-0 flex w-full items-center justify-between border-b border-b-border-200 bg-white p-4">
        <JoinButton />
        <button
          onClick={() => closeSidebar({ display: false, view: '' })}
          aria-label="Close panel"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-muted transition-all duration-200 hover:bg-accent hover:text-light focus:bg-accent focus:text-light focus:outline-0"
        >
          <span className="sr-only">{t('text-close')}</span>
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5 pt-12 md:p-10">
        <div className="mb-12 text-center md:mb-24">
          {aboutUsTitle ? (
            <h2 className="mb-5 text-3xl font-bold">{aboutUsTitle}</h2>
          ) : (
            ''
          )}
          {aboutUsDescription ? (
            <p className="mb-6 leading-8 text-black text-opacity-80">
              {aboutUsDescription}
            </p>
          ) : (
            ''
          )}
        </div>

        <div className="mb-14 md:mb-32">
          {contactUsTitle ? (
            <h2 className="mb-5 text-center text-3xl font-bold">
              {contactUsTitle}
            </h2>
          ) : (
            ''
          )}
          <SuperAdminContactForm variant="drawer" />
        </div>

        <div className="grid grid-cols-3 gap-6 divide-y divide-slate-100 text-center md:gap-4 md:divide-y-0">
          <div className="col-span-full md:col-span-1">
            <div className="text-[rgb(191 187 199)] mb-4 text-3xl">
              <MapPinNew className="mx-auto" />
            </div>
            <h3 className="mb-3 text-base font-bold">{t('text-address')}</h3>
            {contactDetails?.location?.formattedAddress ? (
              <Link
                href={`https://www.google.com/maps/place/${contactDetails?.location?.formattedAddress}`}
                target="_blank"
                title={contactDetails?.location?.formattedAddress}
                className="text-[rgb(79, 81, 93)] text-sm leading-7"
              >
                {contactDetails?.location?.formattedAddress}
              </Link>
            ) : (
              ''
            )}
          </div>
          <div className="col-span-full pt-6 md:col-span-1 md:pt-0">
            <div className="text-[rgb(191 187 199)] mb-4 text-3xl">
              <MobileIconNew className="mx-auto" />
            </div>
            <h3 className="mb-3 text-base font-bold">
              {t('text-contact-number')}
            </h3>
            {contactDetails?.contact ? (
              <Link
                href={`tel:${contactDetails?.contact}`}
                className="text-[rgb(79, 81, 93)] text-sm leading-7"
              >
                {contactDetails?.contact}
              </Link>
            ) : (
              ''
            )}
          </div>
          <div className="col-span-full pt-6 md:col-span-1 md:pt-0">
            <div className="text-[rgb(191 187 199)] mb-4 text-3xl">
              <HomeIconNew className="mx-auto" />
            </div>
            <h3 className="mb-3 text-base font-bold">{t('text-website')}</h3>
            {contactDetails?.website ? (
              <Link
                target="_blank"
                href={contactDetails?.website}
                className="text-[rgb(79, 81, 93)] text-sm leading-7"
              >
                {contactDetails?.website}
              </Link>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MoreInfo;
